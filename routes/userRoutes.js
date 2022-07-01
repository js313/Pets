const express = require('express')
const { getAllUsers, newUser, getUser, deleteUser, updateUser,
    updateCurrentUser, deleteCurrentUser, getProfile, getUsers } = require('../controllers/userController')
const { signup, signin, forgotPassword,
    resetPassword, updatePassword, protect, restrictTo, signOut, restrictToCurrentUser } = require('../controllers/authController')
const { getMyPets } = require('../controllers/petControllers')
const userRouter = express.Router()

userRouter.route('/signup')
    .post(signup)

userRouter.route('/signin')
    .post(signin)

userRouter.route('/signout')
    .get(signOut)

userRouter.route('/profile')
    .get(protect, getProfile, getUser)

userRouter.route('/my-pets')
    .get(protect, getMyPets)

userRouter.route('/forgot-password')
    .post(forgotPassword)

userRouter.route('/reset-password/:token')
    .patch(resetPassword)

userRouter.route('/update-password')
    .patch(protect, updatePassword)

userRouter.route('/update-user-details')
    .patch(protect, updateCurrentUser)

userRouter.route('/delete-user')
    .delete(protect, deleteCurrentUser)

userRouter.route('/get-users')
    .get(protect, getUsers)

userRouter.route('/')
    .get(protect, restrictTo('admin'), getAllUsers)
    .post(protect, restrictTo('admin'), newUser)

userRouter.route('/:id')
    .get(protect, restrictTo('admin'), getUser)
    .delete(protect, restrictTo('admin'), deleteUser)
    .patch(protect, restrictTo('admin'), updateUser)

module.exports = userRouter