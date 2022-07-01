const express = require('express')
const { protect, restrictToCurrentUser } = require('../controllers/authController')
const { getAllPets, newPet, getPet, updatePet, deletePet, petsWithin, getDistances, getAllBreeds, getAllSpecies } = require('../controllers/petControllers')

const petRouter = express.Router()

petRouter.route('/get-within')
    .post(petsWithin)

petRouter.route('/distances')
    .post(getDistances)

petRouter.route('/all-breeds')
    .get(getAllBreeds)

petRouter.route('/all-species')
    .get(getAllSpecies)

petRouter.route('/')
    .get(getAllPets)
    .post(protect, newPet)

petRouter.route('/:id')
    .get(getPet)
    .patch(protect, restrictToCurrentUser('pet'), updatePet)
    .delete(protect, restrictToCurrentUser('pet'), deletePet)

module.exports = petRouter