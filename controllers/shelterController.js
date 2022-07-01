const Shelter = require('../models/shelterModel')
const User = require('../models/userModel')
const buildObject = require('../utils/apiFeatures')
const CatchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Pet = require('../models/petModel')
const Review = require('../models/reviewModel')
const { getRatings } = require('./reviewController')
const { cloudinary } = require('../utils/cloudinaryConfig')

exports.aliasTopShelters = CatchAsync(async (req, res, next) => {
    req.query.sort = '-ratingsAverage'
    req.query.page = 1
    req.query.limit = 5
    next()
})

exports.petsInShelters = CatchAsync(async (req, res, next) => {
    const stats = await Shelter.aggregate([
        {
            $match: {
                pets: { $exists: 'true' }
            }
        },
        {
            $group: {
                _id: null,
                numPets: { $sum: { $size: '$pets' } }
            }
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
})

exports.getSheltersWithin = CatchAsync(async (req, res, next) => {
    const { distance, lat, lng } = req.body
    if (!distance || !lat || !lng) return next(new AppError(401, "Insufficient data received."))
    const { query, totalDocs } = buildObject(req, res, next, Shelter)
    const shelters = await query.find({ location: { $geoWithin: { $centerSphere: [[lng, lat], distance / 6378.1] } } })
    res.status(200).json({
        status: 'success',
        length: shelters.length,
        data: {
            shelters
        }
    })
})

exports.getDistances = CatchAsync(async (req, res, next) => {
    const { lat, lng } = req.body
    if (!lat || !lng) return next(new AppError(401, "Insufficient data received."))
    const distances = await Shelter.aggregate([
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

exports.getAllShelters = CatchAsync(async (req, res, next) => {
    const { query, totalDocs } = buildObject(req, res, next, Shelter)

    const shelters = await query
    const totalCount = await totalDocs.countDocuments()
    res.status(200).json({
        status: 'success',
        totalCount,
        length: shelters.length,
        data: {
            shelters
        }
    })
})

exports.newShelter = CatchAsync(async (req, res, next) => {
    if (req.user.role !== "user" && req.user.role !== "admin")
        return next(new AppError(400, "You are not authorized to register a shelter."))
    let options = {
        name: req.body.name,
        location: req.body.location,
        email: req.body.email,
        description: req.body.description,
        team: req.body.team,
        owner: req.user.id
    }

    //uploading images
    options.imageCover = (await cloudinary.uploader.upload(req.body.imageCover.data_url, { folder: `Pets/Shelter/Cover`, upload_preset: 'snztw8go' })).url
    let imagesURLs = []
    for (let i = 0; i < req.body.images.length; i++) {
        const response = await cloudinary.uploader.upload(req.body.images[i].data_url, { folder: 'Pets/Shelter', upload_preset: 'snztw8go' })
        imagesURLs.push(response.url)
    }
    options.images = imagesURLs

    const newShelter = await Shelter.create(options)

    //changing roles of team members
    for (let i = 0; i < options.team.length; i++) {
        const toBeManager = await User.findById(options.team[i])
        if (toBeManager.role === 'user' || toBeManager.role === 'parent') {
            toBeManager.role = 'manager'
            toBeManager.shelter = newShelter._id
            await toBeManager.save({ validateBeforeSave: false })
        }
        else if (toBeManager.role === 'manager' || toBeManager.role === 'owner') {
            next(new AppError(401, "Team members cannot be associated with other shelters."))
        }
    }
    //setting current user as owner
    const user = await User.findById(req.user.id)
    if (user.role === 'user' || user.role === 'user') {
        user.role = 'owner'
        req.user = user
    }
    user.shelter = newShelter._id
    await user.save({ validateBeforeSave: false })

    //TODO: above three things are not dependent on one another to finish so they can happen async from one another use promise.all

    res.status(201).json({
        status: 'success',
        message: `Shelter registered successfully, you are now the owner of ${newShelter.name}.`,
        data: {
            shelter: newShelter
        }
    })
})

exports.getShelter = CatchAsync(async (req, res, next) => {
    const { id } = req.params
    const shelter = await Shelter.findById(id)
        .populate({ path: 'reviews', select: "-__v", populate: { path: 'user', select: 'name profilePhoto' } })
        .populate({ path: 'pets', select: "-__v" })
    if (!shelter)
        return next(new AppError(404, "No Shelter found with that ID"))
    res.status(200).json({
        status: 'success',
        data: {
            shelter
        }
    })
})

exports.deleteShelter = CatchAsync(async (req, res, next) => {  //Shelter or pet specified by id
    const { id } = req.params
    const shelter = await Shelter.findById(id).populate('team').populate('pets').populate('reviews')//TODO: Probably efficient to do review., pets. etc
    if (!shelter)
        return next(new AppError(404, "No Shelter found with that ID"))
    shelter.active = false
    for (let i = 0; i < shelter.team.length; i++) {
        const user = await User.findByIdAndUpdate(shelter.team[i].id, { role: 'user', shelter: undefined })
    }
    for (let i = 0; i < shelter.pets.length; i++) {
        const pet = await Pet.findByIdAndUpdate(shelter.pets[i].id, { active: false })
    }
    for (let i = 0; i < shelter.reviews.length; i++) {
        await Review.findByIdAndDelete(shelter.reviews[i])
    }
    shelter.team = []
    await shelter.save()
    res.status(204).end()
})

exports.updateShelter = CatchAsync(async (req, res, next) => {
    const { id } = req.params
    const shelterToUpdate = await Shelter.findById(id)
    let options = {     //Need to add owner field as save rewrites the whole document
        name: req.body.name || shelterToUpdate.name,
        location: req.body.location || shelterToUpdate.location,
        email: req.body.email || shelterToUpdate.email,
        description: req.body.description || shelterToUpdate.desription,
        owner: shelterToUpdate.owner,
        team: req.body.team || [] //have to send all users, including already members.
    }
    if (!shelterToUpdate)
        return next(new AppError(404, "No Shelter found with that ID"))
    let teamToAdd = options.team.length > 0 ? options.team.filter(memberId => !shelterToUpdate.team.find(oldMember => oldMember._id.toString() === memberId)) : []
    //removing non team members
    for (let i = 0; i < shelterToUpdate.team.length; i++) {
        const user = shelterToUpdate.team[i]
        console.log(user.shelter, id)
        if (user.role === "manager" && user.shelter.toString() === id) {
            user.role = "user"
            user.shelter = undefined
            await user.save({ validateBeforeSave: false })
        }
    }
    //changing roles of team members
    for (let i = 0; i < teamToAdd.length; i++) {
        const toBeManager = await User.findById(teamToAdd[i])
        if (toBeManager.role === 'user' || toBeManager.role === 'parent') {
            toBeManager.role = 'manager'
            toBeManager.shelter = id
            await toBeManager.save({ validateBeforeSave: false })
        }
        else if (toBeManager.role === 'manager' || toBeManager.role === 'owner') {
            next(new AppError(401, "Team members cannot be associated with other shelters."))
        }
    }
    if (req.body.images) {    //ignore deletion/upload if no images provided
        //deleteing previous images, trying something new most probably slower but...
        const imagesToStay = req.body.images.map(image => { if (image.data_url.includes('cloudinary')) return image.data_url }).sort()
        shelterToUpdate.images.sort()
        for (let i = 0, j = 0; i < shelterToUpdate.images.length, j < imagesToStay.length; i++) {
            if (shelterToUpdate.images[i] === imagesToStay[j]) {
                j++
                continue
            }
            await cloudinary.uploader.destroy(`Pets${shelterToUpdate.images[i].split('/Pets')[1].split('.')[0]}`)   //needs public_id
        }
        //uploading images
        if (!req.body.imageCover.data_url.includes('cloudinary')) {
            if (shelterToUpdate.imageCover)
                await cloudinary.uploader.destroy(`Pets${shelterToUpdate.imageCover.split('/Pets')[1].split('.')[0]}`)
            options.imageCover = (await cloudinary.uploader.upload(req.body.imageCover.data_url, { folder: `Pets/Shelter/Cover`, upload_preset: 'snztw8go' })).url
        }
        let imagesURLs = []
        for (let i = 0; i < req.body.images.length; i++) {
            if (req.body.images[i].data_url.includes('cloudinary')) {
                imagesURLs.push(req.body.images[i].data_url)    //Unchanged images, don't delete these images from cloudinary
                continue
            }
            const response = await cloudinary.uploader.upload(req.body.images[i].data_url, { folder: 'Pets/Shelter', upload_preset: 'snztw8go' })
            imagesURLs.push(response.url)
        }
        options.images = imagesURLs
    }

    //TODO: above three things are not dependent on one another to finish so they can happen async from one another use promise.all
    for (let key in options) {
        shelterToUpdate[key] = options[key]
    }
    const updatedShelter = await shelterToUpdate.save({ validateBeforeSave: false })

    res.status(200).json({
        status: 'success',
        data: {
            shelter: updatedShelter
        }
    })
})

exports.changeTeam = CatchAsync(async (req, res, next) => {
    if (!await Shelter.exists({ _id: req.params.shelterId })) return next(new AppError(401, "No Shelter found with that ID."))
    if ((req.user.shelter.toString() !== req.params.shelterId) && (req.user.role !== 'admin'))
        return next(new AppError(403, "You do not own this shelter."))
    const { team } = req.body
    const addMember = []
    const removeMember = []
    for (let i = 0; i < team.length; i++) {
        const user = await User.findById(team[i])
        if (user && user.role === "user") {
            user.role = "manager"
            user.shelter = req.params.shelterId
            addMember.push(team[i])
            await user.save({ validateBeforeSave: false })
        }
        else if (user && user.role === "manager" && user.shelter.toString() === req.params.shelterId) {
            removeMember.push(team[i])
            user.shelter = undefined
            user.role = "user"
            await user.save({ validateBeforeSave: false })
        }
    }
    await Shelter.findByIdAndUpdate(req.params.shelterId, { $push: { team: { $each: addMember } } }, { new: true })
    const updatedShelter = await Shelter.findByIdAndUpdate(req.params.shelterId, { $pull: { team: { $in: removeMember } } }, { new: true })

    //TODO: (alternate) pull shellter ID from currently logged in owner(user).
    //TODO: Make sure only owners of this shelter can change/add members.
    res.status(200).json({
        status: 'success',
        data: {
            shelter: updatedShelter
        }
    })
})

exports.changeOwner = CatchAsync(async (req, res, next) => {
    if (!await Shelter.exists({ _id: req.params.shelterId })) return next(new AppError(401, "No Shelter found with that ID."))
    if ((req.user.shelter.toString() !== req.params.shelterId) && (req.user.role !== 'admin'))
        return next(new AppError(403, "You do not own this shelter."))
    const newOwner = await User.findById(req.body.newOwner)
    if (!newOwner) return next(new AppError(404, "No user found with that ID."))
    if (newOwner.role === 'user') {
        newOwner.role = 'owner'
        newOwner.shelter = req.params.shelterId
    }
    else if (newOwner.role === 'manager' && newOwner.shelter.toString() === req.params.shelterId)
        newOwner.role = 'owner'
    else
        return next(new AppError(400, "Unable to transfer ownership."))
    const oldOwner = await User.findById(req.user.id)
    oldOwner.role = 'manager'
    await newOwner.save({ validateBeforeSave: false })
    await oldOwner.save({ validateBeforeSave: false })
    res.status(200).json({
        status: 'success',
        data: {
            user: oldOwner
        }
    })
})