const mongoose = require('mongoose')
const Shelter = require('./shelterModel')

const reviewSchema = mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Review must have a rating.']
    },
    body: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    edited: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Review must belong to a user."]
    },
    shelter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shelter',
        required: [true, "Review must belong to a shelter."]
    }
    // ... add more like reports, approved(moderation) etc
})

reviewSchema.index({ shelter: 1, user: 1 }, { unique: true })

reviewSchema.statics.calcAvgRating = async function (shelterId) {
    const avgRatings = await this.aggregate([
        { $match: { shelter: shelterId } },
        {
            $group: {
                _id: '$shelter',
                noOfRatings: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])
    if (avgRatings.length < 1)
        return await Shelter.findByIdAndUpdate(shelterId, {
            ratingsQuantity: 0,
            ratingsAverage: 0
        })
    await Shelter.findByIdAndUpdate(shelterId, {
        ratingsQuantity: avgRatings[0].noOfRatings,
        ratingsAverage: avgRatings[0].avgRating
    })
}

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.review = await this.findOne().clone()      //here this does not refer to the updated document but it refers to the query object, 
    //so we execute the query and place the result on that query to have access to it in post middleware
    next()
})

reviewSchema.post(/^findOneAnd/, async function () {
    if (this.review)
        await this.review.constructor.calcAvgRating(this.review.shelter)
})

reviewSchema.post('save', function (next) {
    this.constructor.calcAvgRating(this.shelter)
})

// reviewSchema.pre(/^find/, function (next) {     //questionable, use only where needed
//     this.populate({
//         path: 'user',
//         select: 'name image'
//     })
//     next()
// })

const Review = mongoose.model('Review', reviewSchema)   //Keep this below all middlewares, methods, virtual functions, etc

module.exports = Review