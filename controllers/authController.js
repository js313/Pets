const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const CatchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')
const Review = require('../models/reviewModel')
const Shelter = require('../models/shelterModel')
const Pet = require('../models/petModel')

function signToken(user, id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

function sendCookie(jwt, res) {
    // const cookieOptions = {
    //     expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN),
    //     httpOnly: true
    // }
    // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
    // res.cookie('jwt', jwt, cookieOptions)
}

exports.signup = CatchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        email: req.body.email,
        location: req.body.location
    })
    const token = signToken(newUser, newUser._id, res)
    sendCookie(token, res)
    sendEmail({     //send verification token to validate email.
        to: newUser.email,
        subject: 'Welcome to Pets.',
        text: `Hi ${newUser.name}, thank you for signing up, we promise not to fill your mailbox with spam. Please consider sharing our website to all your friends as well. The more the merrier :-)`
    })
    res.status(201).json({
        status: 'success',
        data: {
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                location: newUser.location,
                shelter: newUser.shelter
            },
            jwt: token
        }
    })
})

exports.signin = CatchAsync(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) return next(new AppError(400, "Email and Passwords fields cannot be empty."))
    const user = await User.findOne({ email }).select('+password')
    if (!user) return next(new AppError(400, "Email or Password incorrect."))
    const result = await bcrypt.compare(password, user.password)
    if (!result) return next(new AppError(400, "Email or Password incorrect."))
    const token = signToken(user, user._id, res)
    sendCookie(token, res)
    res.status(201).json({
        status: 'success',
        data: {
            user: {     //preventing sending unnecessary/sensitive information
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                location: user.location,
                profilePhoto: user.profilePhoto,
                shelter: user.shelter
            },   //Do not return if not needed
            jwt: token
        }
    })
})

exports.signOut = CatchAsync(async (req, res, next) => {
    res.cookie('jwt', 'signedout', {
        expires: new Date(Date.now() + 1000),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success'
    })
})

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return reject(err)
            return resolve(decoded)
        })
    })
}

exports.protect = CatchAsync(async (req, res, next) => {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }
    if (!token) {
        return next(new AppError(401, "Login Required."))
    }
    let data
    try {
        data = await verifyToken(token)
    } catch (err) {
        console.log(err)
        return next(new AppError(401, "User no longer exists."))
    }
    const expectedUser = await User.findById(data.id)
    if (!expectedUser) return next(new AppError(401, "User no longer exists."))

    if (expectedUser.isChangedPasswordAfter(data.iat)) {
        return next(new AppError(401, "User recently changed password."))
    }

    req.user = expectedUser
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role))
            return next(new AppError(403, "Permission denied, lacking privileges."))
        next()
    }
}

exports.restrictToCurrentUser = (type) => {
    return async (req, res, next) => {
        if (req.user.role === "admin") return next()
        if (!req.user) return next(new AppError(401, "Login required."))
        let id = ''
        if (type === "review") {
            id = req.params.reviewId
            const review = await Review.findById(id).select('user')
            if (req.user.id === review.user.toString()) return next()
        }
        else if (type === "shelter") {
            id = req.params.id
            if (req.user.shelter && id === req.user.shelter.toString()) return next()
        }
        else if (type === "pet") {
            id = req.params.id
            const pet = await Pet.findById(id).select('parent')
            console.log(req.user.id, pet.parent.toString())
            if (req.user.id === pet.parent.toString()) return next()
        }
        next(new AppError(401, 'Permission denied, lacking privileges.'))
    }
}

exports.forgotPassword = CatchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user)
        return next(new AppError(404, "No user found with that Email"))

    const resetToken = await user.generateResetToken(64)
    await user.save({ validateBeforeSave: false })       //Here to let global error handler handle if any error
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`
    const message = `Forgot password? Submit a PATCH request to this URL(${resetURL}), with password and passwordConfirm. If not, ignore this email.`
    try {
        await sendEmail({
            to: user.email,
            subject: "Password reset token (valid for 10 minutes).",
            text: message
        })
        res.status(200).json({
            status: 'success',
            message: "Password reset instructions sent to your email.",
        })
    } catch (err) {
        user.resetToken = undefined
        user.resetTokenExpiresAt = undefined
        user.save({ validateBeforeSave: false })
        return next(new AppError(500, "Error sending reset token to email, Please try again later."))
    }
})

exports.resetPassword = CatchAsync(async (req, res, next) => {
    const hash = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({ resetToken: hash, resetTokenExpiresAt: { $gte: Date.now() } })

    if (!user) return next(new AppError(400, "Token is invalid or has expired."))
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.resetToken = undefined
    user.resetTokenExpiresAt = undefined
    await user.save()
    res.status(200).json({
        status: 'success',
        message: "Password changed successfully."
    })
})

exports.updatePassword = CatchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')
    //cant use req.user directly as it does not have access to password field, as it "select: false"
    if (!await bcrypt.compare(req.body.currentPassword, user.password))
        return next(new AppError(401, "Current password is not correct"))
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    const token = signToken(user, user._id, res)
    sendCookie(token, res)
    res.status(200).json({
        status: 'success',
        message: "Password changed successfully.",
        data: {
            token
        }
    })
})