const AppError = require('../utils/appError')

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path} ${err.value}`
    return new AppError(400, message)
}

const handleDuplicateFieldsDB = (err) => {
    if (err.message.includes("pets.reviews")) return new AppError(400, "A user cannot have multiple reviews on same shelter.")
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0]
    const message = `Duplicate field value: ${value}.`
    return new AppError(400, message)
}

const handleValidationErrorDB = (err) => {
    const message = `${err.message}: `
    return new AppError(400, message)
}

const handleJsonWebTokenError = () => new AppError('Invalid token. Try logging in again.')

const handleTokenExpiredError = () => new AppError('Given token is no longer valid.')

module.exports = (err, req, res, next) => {          //Error handing middleware
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    if (process.env.NODE_ENV == 'production') {
        let error = Object.assign(err)
        console.log(err)
        if (err.name === 'CastError') error = handleCastErrorDB(error)
        if (err.code === 11000) error = handleDuplicateFieldsDB(error)
        if (err.name === 'ValidationError') error = handleValidationErrorDB(error)
        if (err.name === 'JsonWebTokenError') error = handleJsonWebTokenError()
        if (err.name === 'TokenExpiredError') error = handleTokenExpiredError()

        if (error.isExpectedError) {
            res.status(error.statusCode).json({
                status: error.status,
                message: error.message
            })
        }
        else {
            console.log(err)
            res.status(500).json({
                status: 'error',
                message: 'Internal Server Error!'
            })
        }
    }
    else if (process.env.NODE_ENV == 'development') {
        res.status(err.statusCode || 500).json({
            status: err.status,
            message: err.message,
            err: err,
            stack: err.stack
        })
    }
}