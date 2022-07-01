const express = require('express')
const { getAll, getWithin, getDistances } = require('../controllers/petsAndShelterController')

const bothRouter = express.Router()

bothRouter.route('/')
    .get(getAll)

bothRouter.route('/get-within')
    .post(getWithin)

bothRouter.route('/get-distances')
    .post(getDistances)

module.exports = bothRouter