const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const locationSchema = mongoose.Schema({
    type: {
        type: String,
        default: 'Point',
        enum: ['Point']
    },
    coordinates: {
        type: [Number],
        required: true
    },
    properties: {
        address: String,
        description: String
    }
})

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "User must have a name."]
    },
    location: {
        type: locationSchema    //not 'required' for user to enter location when signing up.
    },
    password: {
        type: String,
        required: [true, "User must have a password."],
        minLength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "User must confirm password"],
        validate: {
            validator: function (pc) {
                return pc === this.password
            },
            message: "Passwords do not match."
        }
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now()
    },
    email: {
        type: String,
        required: [true, "User must have an email."],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Email should be in correct format."]
    },
    role: { //admin can be anything, owner can also be a parent, manager can also be a parent, parent can also be a owner/manager
        type: String,
        enum: ["admin", "owner", "manager", "parent", "user"],
        default: "user"
    },  //Priority:- 1.admin, 2.owner, 2.manager, 3.parent, 4.user.
    shelter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shelter'
    },
    profilePhoto: {
        type: String
    },
    resetToken: String,
    resetTokenExpiresAt: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
    // ... add more like favorites, limit on pets to rehome(set it to 2), reports etc.
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

userSchema.virtual('pets', {
    ref: 'Pet',
    foreignField: 'parent',
    localField: '_id'
})

userSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'user',
    localField: '_id'
})

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const saltRounds = 12
        this.password = await bcrypt.hash(this.password, saltRounds)
        this.passwordConfirm = undefined
        this.passwordChangedAt = Date.now() - 1000
    }
    next()
})

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })   // for those users which do not have the field set
    next()
})

userSchema.methods.isChangedPasswordAfter = function (JWTTimestamp) {
    return JWTTimestamp < parseInt(this.passwordChangedAt.getTime() / 1000)
}

function randomStringGenerator(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    let result = ''
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

userSchema.methods.generateResetToken = function (length) {
    const resetToken = randomStringGenerator(length)
    this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex')//Cant use bcrypt as it produces diff. hashes for same string at diff. time
    this.resetTokenExpiresAt = Date.now() + 10 * 60 * 1000      //Haven't saved these two fields yet.
    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User