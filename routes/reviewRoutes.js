const express = require('express')
const { protect, restrictTo, restrictToCurrentUser } = require('../controllers/authController')
const { getAllReviews, newReview, getMyReviews, getShelterReviews, updateReview,
    deleteReview, getReview } = require('../controllers/reviewController')
const reviewRouter = express.Router({ mergeParams: true })

//Both routes supported, /api/v1/reviews & /api/v1/shelters/:shelterId/reviews

reviewRouter.route('/my-reviews')   //if shelterId in URL, gives user their review on that shelter
    .get(protect, getMyReviews)

reviewRouter.route('/all')          //if shelterId in URL, gives admin all reviews on that shelter
    .get(protect, restrictTo('admin'), getAllReviews)

reviewRouter.route('/')
    .get(protect, getShelterReviews)
    .post(protect, newReview)

reviewRouter.route('/:reviewId')
    .get(protect, getReview)
    .patch(protect, restrictToCurrentUser('review'), updateReview)
    .delete(protect, restrictToCurrentUser('review'), deleteReview)

module.exports = reviewRouter