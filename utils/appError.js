class AppError extends Error {
    constructor(statusCode, message) {
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isExpectedError = true
        Error.captureStackTrace(this, this.constructor)
        //For captureStackTrace explanation https://stackoverflow.com/questions/59625425/understanding-error-capturestacktrace-and-stack-trace-persistance
    }
}

module.exports = AppError