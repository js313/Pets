const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')

const locationSchema = mongoose.Schema({
    type: {
        type: String,
        default: 'Point',
        enum: ['Point']
    },
    coordinates: {
        type: [Number], //[lng, lat]
        required: true
    },
    properties: {
        address: String,
        description: String
    }
})

const shelterSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Shelter must have a name."],
        unique: true,
        trim: true,
        maxlength: [40, "Shelter name must have less than 40 characters."]
    },
    slug: String,
    location: {
        type: locationSchema,
        required: [true, "Shelter must have a location."]
    },
    email: {
        type: String,
        required: [true, "Shelter must have an email."],
        validate: [validator.isEmail, "Email should be in correct format."]
        // validate: {
        //     validator: validator.isEmail,
        //     message: "Email should be in correct format."
        // }    // Another way
    },
    description: {
        type: String,
        required: [true, "Shelter must have a description."],
        minLength: [50, "Shelter description must have at least 50 characters"],
        maxlength: [700, "Shelter description must have less than 700 characters."]
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    team: [     //Do not include owner's id
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    imageCover: {
        type: String,
        required: [true, "Shelter must have a cover image."]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    ratingsAverage: {
        type: Number,
        default: 0,
        min: [0, "Rating must be above 0."],
        max: [5, "Rating must be below 5."],
        set: value => Math.round(value * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
    // ... add more like donate(after frontend implemented), reports etc
}, {
    collation: {    //for case insensitive search(find operation)
        locale: 'en',
        strength: 2
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }    //to show the virtual properties when data requested in JSON and javascript object format
})  //it is better to include virtual fields where needed, eg https://stackoverflow.com/questions/52978514/exclude-virtual-fields, 
//here they are included even where not needed

shelterSchema.index({ ratingsAverage: -1 })
shelterSchema.index({ slug: 1 })
shelterSchema.index({ location: '2dsphere' })

shelterSchema.virtual('pets', {
    ref: 'Pet',
    foreignField: 'shelter',
    localField: '_id'
})
shelterSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'shelter',
    localField: '_id'
})

shelterSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

shelterSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })
    next()
})

shelterSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'team',
        select: '-__v -passwordChangedAt'
    })
    next()
})

shelterSchema.statics.getDistances = async function (lng, lat) {
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

const Shelter = mongoose.model('Shelter', shelterSchema)

module.exports = Shelter