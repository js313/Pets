const CatchAsync = require('../utils/catchAsync')
const Shelter = require('../models/shelterModel')
const Pet = require('../models/petModel')
const buildObject = require('../utils/apiFeatures')
const AppError = require('../utils/appError')

exports.getAll = CatchAsync(async (req, res, next) => {
    const { query: petQuery, totalDocs: petDocs } = buildObject(req, res, next, Pet)
    const { query: shelterQuery, totalDocs: shelterDocs } = buildObject(req, res, next, Shelter)
    const pets = await petQuery
    const shelters = await shelterQuery
    const totalCount = await petDocs.countDocuments() + await shelterDocs.countDocuments()
    res.status(200).json({
        status: 'success',
        length: (shelters.length ? shelters.length : 0 + pets.length ? pets.length : 0),
        totalCount,
        data: {
            shelters,
            pets
        }
    })
})

exports.getWithin = CatchAsync(async (req, res, next) => {
    const { distance, lat, lng } = req.body
    if (!distance || !lat || !lng) return next(new AppError(401, "Insufficient data received."))
    const shelters = await Shelter.find({ location: { $geoWithin: { $centerSphere: [[lng, lat], distance / 6378.1] } } })
    const pets = await Pet.find({ location: { $geoWithin: { $centerSphere: [[lng, lat], distance / 6378.1] } } })

    res.status(200).json({
        status: 'success',
        length: (shelters.length ? shelters.length : 0 + pets.length ? pets.length : 0),
        data: {
            shelters,
            pets
        }
    })
})

exports.getDistances = CatchAsync(async (req, res, next) => {
    const { lat, lng } = req.body
    if (!lat || !lng) return next(new AppError(401, "Insufficient data received."))
    const shelterDistances = await Shelter.getDistances(lng, lat)
    const petDistances = await Pet.getDistances(lng, lat)

    res.status(200).json({
        status: 'success',
        length: (shelterDistances.length + petDistances.length),
        data: {
            shelterDistances,
            petDistances
        }
    })
})