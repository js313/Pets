process.on('uncaughtException', err => {
    console.log(err)
    console.log('Uncaught Exception! Shutting Down!')
    process.exit(1)
})

const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

const mongoose  = require('mongoose')
mongoose.connect(process.env.MONGODB_CONNECT, {
    useNewUrlParser: true
})
.then(data => console.log("Database connected successfully."))
.catch(err => console.log(err))

const app = require('./app')

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

process.on('unhandledRejection', err => {
    console.log(err)
    console.log('Unhandled rejection! Shutting Down!')
    process.exit(1)
    server.close(() => {
        process.exit(1)
    })
})