const CatchAsync = require('../utils/catchAsync')
const Review = require('../models/reviewModel')

exports.getAllReviews = CatchAsync(async (req, res, next) => {
    let query = {}
    if (req.params.shelterId) query.shelter = req.params.shelterId
    const reviews = await Review.find(query)
    res.status(200).json({
        status: 'success',
        length: reviews.length,
        data: {
            reviews
        }
    })
})

exports.newReview = CatchAsync(async (req, res, next) => {
    if (!req.params.shelterId) return next(new AppError(401, "Shelter ID required in the URL."))
    const newReview = await Review.create({
        rating: req.body.rating,
        body: req.body.body,
        user: req.user.id,
        shelter: req.params.shelterId
    })
    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    })
})

exports.getReview = CatchAsync(async (req, res, next) => {
    let query = { _id: reviewId }
    if (req.params.shelterId) query.shelter = req.params.shelterId
    const review = await Review.findOne(query)
    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    })
})

exports.getShelterReviews = CatchAsync(async (req, res, next) => {
    if (!req.params.shelterId) return next(new AppError(401, "Shelter ID required in the URL."))
    const reviews = await Review.find({ shelter: req.params.shelterId })
    res.status(200).json({
        status: 'success',
        length: reviews.length,
        data: {
            reviews
        }
    })
})

exports.getMyReviews = CatchAsync(async (req, res, next) => {
    let query = { user: req.user.id }
    if (req.params.shelterId) query.shelter = req.params.shelterId
    const reviews = await Review.find(query)
    res.status(200).json({
        status: 'success',
        length: reviews.length,
        data: {
            reviews
        }
    })
})

exports.updateReview = CatchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(req.params.reviewId, {
        rating: req.body.rating,
        body: req.body.body,
        edited: true
    }, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    })
})

exports.deleteReview = CatchAsync(async (req, res, next) => {
    await Review.findByIdAndDelete(req.params.reviewId)
    res.status(204).json({
        status: 'success',
    })
})

exports.getRatings = CatchAsync(async (shelterId) => {   //Better to store in shelter model, but it is already populated and don't want to do it again
    const ratings = await Review.aggregate([
        {
            $match: {
                shelter: shelterId
            }
        },
        {
            $group: {
                _id: { $round: '$rating' },
                count: { $count: {} }
            }
        }
    ])

    return ratings
})