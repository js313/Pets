const dotenv = require('dotenv')
const mongoose = require('mongoose')
const fs = require('fs')
const Pet = require('../models/petModel')
const User = require('../models/userModel')
const Review = require('../models/reviewModel')
const Shelter = require('../models/shelterModel')

dotenv.config({ path: '../config.env' })

mongoose.connect(process.env.MONGODB_CONNECT, { useNewUrlParser: true })
    .then(data => console.log("DB Connection successful"))
    .catch(err => console.log(err))

async function insertData() {
    try {
        const dataDir = process.argv[3].toUpperCase()

        // ****************************************USER**********************************************
        // Max users needed = number of shelters + number of pets(worst case)
        const userLocation = JSON.parse(fs.readFileSync(`${__dirname}/LOCATION/USERlocationSchema.json`, 'utf-8'))
        const userData = JSON.parse(fs.readFileSync(`${__dirname}/${dataDir}/${dataDir}userSchema.json`, 'utf-8'))
        for (let i = 0; i < userData.length; i++) {
            userData[i].location = userLocation[i]
            userData[i]._id = userData[i]._id['$oid']
            userData[i].passwordChangedAt = userData[i].passwordChangedAt['$date']
        }
        await User.create(userData)  //for hashing password, insertMany did not trigger the middleware
        console.log("User Data Added.")

        // ****************************************SHELTER**********************************************
        const noOfMaxTeamMembers = 2
        const shelterLocation = JSON.parse(fs.readFileSync(`${__dirname}/LOCATION/SHELTERlocationSchema.json`, 'utf-8'))
        const shelterData = JSON.parse(fs.readFileSync(`${__dirname}/${dataDir}/${dataDir}shelterSchema.json`, 'utf-8'))
        for (let i = 0; i < shelterData.length; i++) {
            shelterData[i].location = shelterLocation[i]
            shelterData[i]._id = shelterData[i]._id['$oid']
            shelterData[i].createdAt = shelterData[i].createdAt['$date']
            shelterData[i].team = []
            const randomNumberOfTeamMembers = Math.floor(Math.random() * noOfMaxTeamMembers) + 1
            const randomUsers = await User.aggregate([
                {
                    $match: { role: 'user' }
                },
                {
                    $sample: { size: randomNumberOfTeamMembers }
                }
            ])
            if (randomUsers.length < 1) throw new Error('Not Enough Users')
            shelterData[i].owner = randomUsers[0]._id
            await User.findByIdAndUpdate(randomUsers[0]._id, { role: 'owner', shelter: shelterData[i]._id }, { runValidators: true })
            for (let j = 1; j < randomUsers.length; j++) {
                await User.findByIdAndUpdate(randomUsers[j]._id, { role: 'manager', shelter: shelterData[i]._id }, { runValidators: true })
                shelterData[i].team.push(randomUsers[j]._id)
            }
        }
        await Shelter.create(shelterData)
        console.log("Shelter Data Added.")

        // ****************************************PET**********************************************
        const petLocation = JSON.parse(fs.readFileSync(`${__dirname}/LOCATION/PETlocationSchema.json`, 'utf-8'))
        const petData = JSON.parse(fs.readFileSync(`${__dirname}/${dataDir}/${dataDir}petSchema.json`, 'utf-8'))
        for (let i = 0; i < petData.length; i++) {
            petData[i].location = petLocation[i]     //change location to shelter it is in or if the parent has a location.
            petData[i]._id = petData[i]._id['$oid']
            petData[i].createdAt = petData[i].createdAt['$date']
            if (Math.random() > 0.7) {
                const randomUser = await User.aggregate([
                    {
                        $match: { role: 'user' }
                    },
                    {
                        $sample: { size: 1 }
                    }
                ])
                if (randomUser.length > 0) {
                    petData[i].parent = randomUser[0]._id
                    if (randomUser[0].location)
                        petData[i].location = randomUser[0].location
                    await User.findByIdAndUpdate(randomUser[0]._id, { role: 'parent' }, { runValidators: true })
                }
                else
                    throw new Error('Not Enough Users')
            }
            else {
                const randomIndex = Math.floor(Math.random() * shelterData.length)
                petData[i].shelter = shelterData[randomIndex]._id
                petData[i].location = shelterData[randomIndex].location
            }
        }
        await Pet.create(petData)
        console.log("Pet Data Added.")

        // ****************************************REVIEW**********************************************
        const reviewData = JSON.parse(fs.readFileSync(`${__dirname}/${dataDir}/${dataDir}reviewSchema.json`, 'utf-8'))
        for (let i = 0; i < reviewData.length; i++) {
            reviewData[i]._id = reviewData[i]._id['$oid']
            reviewData[i].createdAt = reviewData[i].createdAt['$date']
            reviewData[i].shelter = shelterData[i]._id
            reviewData[i].user = userData[i]._id
        }
        await Review.create(reviewData)
        console.log("Review Data Added.")
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

async function clearAllData() {
    try {
        await User.deleteMany()
        console.log("User data deleted successfully.")
        await Shelter.deleteMany()
        console.log("Shelter data deleted successfully.")
        await Pet.deleteMany()
        console.log("Pet data deleted successfully.")
        await Review.deleteMany()
        console.log("Review data deleted successfully.")
        console.log("All data deleted successfully.")
        process.exit(0)
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}
if (process.argv[2] == '-ca')
    clearAllData()
else if (process.argv[2] == '-i')
    insertData()