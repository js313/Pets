const { cloudinary } = require('../utils/cloudinaryConfig')
const Pet = require('../models/petModel')
const CatchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const buildObject = require('../utils/apiFeatures')
const Shelter = require('../models/shelterModel')
const User = require('../models/userModel')

exports.getAllPets = CatchAsync(async (req, res, next) => {
    const { query, totalDocs } = buildObject(req, res, next, Pet)
    const pets = await query
    const totalCount = await totalDocs.countDocuments({ active: { $ne: false } })
    res.status(200).json({
        status: 'success',
        totalCount,
        length: pets.length,
        data: {
            pets
        }
    })
})

exports.newPet = CatchAsync(async (req, res, next) => {
    let options = {
        name: req.body.name,
        species: req.body.species,
        breed: req.body.breed,
        gender: req.body.gender,
        about: req.body.about
    }
    let imagesURLs = []
    for (let i = 0; i < req.body.images.length; i++) {
        const response = await cloudinary.uploader.upload(req.body.images[i].data_url, { folder: 'Pets/Pet', upload_preset: 'snztw8go' })
        imagesURLs.push(response.url)
    }
    options.images = imagesURLs
    if (!req.body.shelter) {
        options.parent = req.user.id
        const user = await User.findById(req.user.id)
        options.location = user.location
        if (user.role === 'user') user.role = 'parent'
        await user.save({ validateBeforeSave: false })
    }
    else {
        options.shelter = req.body.shelter
        const shelter = await Shelter.findById(req.body.shelter)
        if (!shelter) return next(new AppError(401, "No shelter with that ID found."))
        options.location = shelter.location
    }
    const newPet = await Pet.create(options)
    res.status(201).json({
        status: 'success',
        data: {
            pet: newPet
        }
    })
})

exports.getPet = CatchAsync(async (req, res, next) => {
    const pet = await Pet.findById(req.params.id)
        .populate({ path: 'shelter', select: '_id name' })
        .populate({ path: 'parent', select: '_id name' })
    res.status(200).json({
        status: 'success',
        data: {
            pet
        }
    })
})

exports.updatePet = CatchAsync(async (req, res, next) => {  //cannot change shelter/parent.
    const petToUpdate = await Pet.findById(req.params.id)
    let options = {
        name: req.body.name || petToUpdate.name,    //should take this logic into user schema, in pre-save middleware.
        species: req.body.species || petToUpdate.species,
        breed: req.body.breed || petToUpdate.breed,
        about: req.body.about || petToUpdate.about,
        location: req.body.location || petToUpdate.location
    }
    let imagesURLs = []
    if (req.body.images) {
        const imagesToStay = req.body.images.map(image => { if (image.data_url.includes('cloudinary')) return image.data_url }).sort()
        petToUpdate.images.sort()
        for (let i = 0, j = 0; i < petToUpdate.images.length, j < imagesToStay.length; i++) {
            if (petToUpdate.images[i] === imagesToStay[j]) {
                j++
                continue
            }
            await cloudinary.uploader.destroy(`Pets${petToUpdate.images[i].split('/Pets')[1].split('.')[0]}`)   //needs public_id
        }
        for (let i = 0; i < req.body.images.length; i++) {
            if (req.body.images[i].data_url.includes('cloudinary')) {
                imagesURLs.push(req.body.images[i].data_url)
                continue
            }
            const response = await cloudinary.uploader.upload(req.body.images[i].data_url, { folder: 'Pets/Pet', upload_preset: 'snztw8go' })
            imagesURLs.push(response.url)
        }
        options.images = imagesURLs
    }
    for (let key in options) {
        petToUpdate[key] = options[key]
    }
    const pet = await petToUpdate.save()
    res.status(200).json({
        status: 'success',
        data: {
            pet
        }
    })
})

exports.deletePet = CatchAsync(async (req, res, next) => {
    const deletedPet = await Pet.findByIdAndUpdate(req.params.id, { active: false }, { new: true })
    if (deletedPet.parent) {
        const user = await User.findById(deletedPet.parent).populate('pets')
        if (user.role === "parent" && user.pets.length === 1) {
            user.role = "user"
            user.save({ runValidators: false })
        }
    }
    res.status(204).end()
})

exports.petsWithin = CatchAsync(async (req, res, next) => {
    const { lat, lng, distance } = req.body
    if (!lat || !lng || !distance) return next(new AppError(401, "Insufficient data received."))
    const { query, totalDocs } = buildObject(req, res, next, Pet)
    const pets = await query.find({ location: { $geoWithin: { $centerSphere: [[lng, lat], distance / 6378.1] } } })
    res.status(200).json({
        status: 'success',
        length: pets.length,
        data: {
            pets
        }
    })
})

exports.getDistances = CatchAsync(async (req, res, next) => {
    const { lat, lng } = req.body
    if (!lat || !lng) return next(new AppError(401, "Insufficient data received."))
    const distances = await Pet.aggregate([
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
    res.status(200).json({
        status: 'success',
        length: distances.length,
        data: {
            distances
        }
    })
})

exports.getMyPets = CatchAsync(async (req, res, next) => {
    const pets = await Pet.find({ parent: req.user.id })
    res.status(200).json({
        status: 'success',
        length: pets.length,
        data: {
            pets
        }
    })
})

exports.getShelterPets = CatchAsync(async (req, res, next) => {
    const pets = await Pet.find({ shelter: req.params.shelterId })
    res.status(200).json({
        status: 'success',
        length: pets.length,
        data: {
            pets
        }
    })
})

exports.getAllBreeds = CatchAsync(async (req, res, next) => {
    const { species } = req.query
    const rawBreeds = await Pet.aggregate([
        {
            $match: { species: { $in: species.split(',') } }
        },
        {
            $group: {
                _id: "$breed"
            }
        }
    ])
    let breeds = []
    breeds = rawBreeds.map(el => el._id)
    res.status(200).json({
        status: 'success',
        length: breeds.length,
        data: {
            breeds
        }
    })
})

exports.getAllSpecies = CatchAsync(async (req, res, next) => {
    const rawSpecies = await Pet.aggregate([
        {
            $group: {
                _id: "$species"
            }
        }
    ])
    let species = []
    species = rawSpecies.map(el => el._id)
    res.status(200).json({
        status: 'success',
        length: species.length,
        data: {
            species
        }
    })
})