const mongoose = require('mongoose')
const AppError = require('../utils/appError')

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

const petSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Pet must have a name."],
        trim: true
    },
    species: {
        type: String,
        required: [true, "Pet must have a species."],
        trim: true,
        lowercase: true
    },
    breed: {
        type: String,
        required: [true, "Pet must have a breeed."],
        trim: true,
        lowercase: true
    },
    location: {
        type: locationSchema,
        required: [true, "Pet must have a location."]
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    shelter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shelter'
    },
    about: {
        type: String,
        required: [true, "Pet must have an about."]
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: [true, "Pet must have a gender."]
    },
    images: [String],
    active: {   //still up for adoption or not
        type: Boolean,
        default: true,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    }
    // ... add more like rescue or not, health/vaccination information etc..
}, {
    collation: {    //for case insensitive search(find operation). Case insensitive index in mongodb
        locale: 'en',
        strength: 2
    }
})

petSchema.index({ location: '2dsphere' })   //needed for $geoNear queries

petSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })
    next()
})

petSchema.pre('validate', function (next) {
    if ((this.parent && this.shelter) || (!this.parent && !this.shelter))
        return next(new AppError(401, "At least and Only one field(parent, shelter) should be populated"))
    next()
})

petSchema.statics.getDistances = async function (lng, lat) {
    const distances = await this.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: 0.001
            }
        }
    ])
    return distances
}

const Pet = mongoose.model("Pet", petSchema)

module.exports = Pet