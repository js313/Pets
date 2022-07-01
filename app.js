const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const shelterRouter = require('./routes/shelterRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const petRouter = require('./routes/petRoutes')
const petsAndShelterRouter = require('./routes/petsAndShelterRoutes')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const app = express()

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// const limiter = rateLimit({  //enable in production
//     max: 100,
//     windowMs: 60 * 60 * 1000,
//     message: 'You are doing that too many times, Try again later.'
// })
// app.use('/', limiter)

app.use(helmet())

app.use(express.json({ limit: '10kb' }))

app.use(cookieParser())

app.use(mongoSanitize({
    allowDots: true //might be a security issue
}))

app.use(xss())

app.use(hpp({
    whitelist: [
        'name',
        'location',
        'ratingsAverage',
        'ratingsQuantity',
        'description',
        'email'
    ]
}))

app.use(express.static(`${__dirname}/public`))

app.get('/test', (req, res) => res.send("Test URL"))
app.use('/api/v1/shelters', shelterRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/pets', petRouter)
app.use('/api/v1/all', petsAndShelterRouter)

app.all('*', (req, res, next) => {
    next(new AppError(404, `Can't find '${req.originalUrl}'!`))
    //if any argument passed in next express automatically call error handling middleware, skipping every middleware.
})

app.use(globalErrorHandler)

module.exports = app