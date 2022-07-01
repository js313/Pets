module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => next(err))
    }
}

//Just to reduce the amount of try catch