const express = require('express')
const { getAllShelters, newShelter, getShelter, deleteShelter,
    updateShelter, aliasTopShelters, petsInShelters, getSheltersWithin, getDistances,
    changeTeam, changeOwner } = require('../controllers/shelterController')
const { protect, restrictTo, restrictToCurrentUser } = require('../controllers/authController')
const reviewRouter = require('./reviewRoutes')
const { getShelterPets } = require('../controllers/petControllers')
const shelterRouter = express.Router()

shelterRouter.route('/top5')    //Add a top 5 near me as well
    .get(aliasTopShelters, getAllShelters)

shelterRouter.route('/pets-in-shelters')    //Add some more routes like these
    .get(petsInShelters)

shelterRouter.route('/get-within')
    .post(getSheltersWithin)

shelterRouter.route('/distances')
    .post(getDistances)

shelterRouter.route('/')
    .get(getAllShelters)
    .post(protect, newShelter)

shelterRouter.route('/:id')
    .get(getShelter)
    .delete(protect, restrictTo("admin", "owner"), restrictToCurrentUser('shelter'), deleteShelter)
    .patch(protect, restrictTo("admin", "owner", "manager"), restrictToCurrentUser('shelter'), updateShelter)

shelterRouter.route('/:shelterId/get-pets')
    .get(getShelterPets)

shelterRouter.route('/:shelterId/change-team')
    .post(protect, restrictTo("admin", "owner"), changeTeam)

shelterRouter.route('/:shelterId/change-owner')
    .post(protect, restrictTo("admin", "owner"), changeOwner)

shelterRouter.use('/:shelterId/reviews', reviewRouter)

module.exports = shelterRouter