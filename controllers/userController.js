const CatchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')
const Review = require('../models/reviewModel')
const Shelter = require('../models/shelterModel')
const buildObject = require('../utils/apiFeatures')
const { cloudinary } = require('../utils/cloudinaryConfig')

exports.getAllUsers = CatchAsync(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
        status: 'success',
        length: users.length,
        data: {
            users
        }
    })
})

exports.getUsers = CatchAsync(async (req, res, next) => {
    const { query } = buildObject(req, res, next, User)
    let users = await query
    users = users.map(user => { return { id: user.id, name: user.name } })
    res.status(200).json({
        status: 'success',
        length: users.length,
        data: {
            users
        }
    })
})

exports.newUser = CatchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        email: req.body.email,
        profilePhoto: req.body.profilePhoto,
        location: req.body.location
    })
    res.status(201).json({
        status: 'success',
        message: "User registered successfully",
        data: {
            user: newUser
        }
    })
})

exports.getUser = CatchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
        .populate({ path: 'pets', select: '_id name' })
        .populate({ path: 'reviews', select: '_id rating body shelter' })
        .populate({ path: 'shelter', select: '_id name', populate: { path: 'pets', select: '_id name' } })
        .select('-passwordChangedAt -__v')
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

exports.deleteUser = CatchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id)
    res.status(204).end()
})

exports.updateUser = CatchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        location: req.body.location
    }, {
        new: true,
        runValidators: true
    })
    res.status(201).json({
        status: 'success',
        message: 'User updated successfully.',
        data: {
            user
        }
    })
})

exports.updateCurrentUser = CatchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm)
        return next(new AppError(401, "This route is not for password update, use /update-password instead."))
    let userData = {
        name: req.body.name,
        email: req.body.email,
        location: req.body.location
    }
    const userToUpdate = req.user
    if (req.body.profilePhoto && req.body.profilePhoto.data_url && !req.body.profilePhoto.data_url.includes('cloudinary')) {
        if (userToUpdate.profilePhoto)
            await cloudinary.uploader.destroy(`Pets${userToUpdate.profilePhoto.split('/Pets')[1].split('.')[0]}`)
        userData.profilePhoto = (await cloudinary.uploader.upload(req.body.profilePhoto.data_url, { folder: 'Pets/User', upload_preset: 'snztw8go' })).url
    }
    for (let key in userData) {
        userToUpdate[key] = userData[key]
    }
    const user = await User.findByIdAndUpdate(req.user, userData, { new: true, runValidators: true })
    res.status(201).json({
        status: 'success',
        message: 'User updated successfully.',
        data: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                location: user.location,
                shelter: user.shelter,
                profilePhoto: user.profilePhoto
            }
        }
    })
})

exports.deleteCurrentUser = CatchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    if (!user) return next(new AppError(400, "No user found with that ID"))
    if (user.role === 'owner') return next(new AppError(405, "You own a shelter, user cannot be deleted."))
    else if (user.role === 'manager') {
        const shelter = await Shelter.findByIdAndUpdate(user.shelter, { $pull: { team: user._id } })
    }
    await Review.deleteMany({ user: req.user.id })
    user.active = false
    await User.save()
    res.status(204).end()
})

exports.getProfile = (req, res, next) => {
    req.params.id = req.user.id
    next()
}