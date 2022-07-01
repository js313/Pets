const AppError = require('./appError')
const CatchAsync = require('./catchAsync')

class ApiFeatures {
    constructor(reqQuery, model) {
        this.model = model
        this.reqQuery = reqQuery
        this.query = this.model.find()
    }
    filter() {
        let queryObj = { ...this.reqQuery }
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])
        let inequalityQueryStr = JSON.stringify(queryObj)         //Might not need these
        inequalityQueryStr = inequalityQueryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        queryObj = JSON.parse(inequalityQueryStr)
        this.query = this.model.find(queryObj)

        let rawQueryStr = '{ '  //last space is important to replace it with '}'
        for (let key in queryObj) {
            if (key === 'species' || key === 'breed' || key === 'role')     //OR operation
                rawQueryStr += `"${key}": {"$in": ["${queryObj[key].replace(',', '","')}"]},`
            if (key === 'name')
                rawQueryStr += `"${key}": {"$regex": "${queryObj[key]}", "$options": "i"},`     //to replicate use of includes from js with case insensitivity
        }
        const equalityQueryStr = rawQueryStr.substring(0, rawQueryStr.length - 1) + '}'

        // console.log(JSON.parse(equalityQueryStr))
        this.query = this.query.find(JSON.parse(equalityQueryStr))
    }
    sort() {
        if (this.reqQuery.sort) {
            const sortBy = this.reqQuery.sort.replace(',', ' ')
            this.query = this.query.sort(sortBy)
        }
        else {
            this.query = this.query.sort('-createdAt')
        }
    }
    select() {
        if (this.reqQuery.fields) {
            const fields = this.reqQuery.fields.replace(',', ' ')
            this.query = this.query.select(fields)
        }
        else {
            this.query = this.query.select('-__v')
        }
    }
    paginate = CatchAsync(async (req, res, next) => {
        const page = Number(this.reqQuery.page) || 1
        const limit = Number(this.reqQuery.limit) || 100
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        if (this.reqQuery.page) {
            const numDocs = await this.model.countDocuments()
            if (skip >= numDocs) throw new AppError(404, 'Page does not exist')
        }
    })
    // paginate(req, res, next) {       //This function works too
    //     const page = Number(this.reqQuery.page) || 1
    //     const limit = Number(this.reqQuery.limit) || 100
    //     const skip = (page - 1) * limit
    //     this.query = this.query.skip(skip).limit(limit)
    //     if (this.reqQuery.page) {
    //         this.model.countDocuments().then((numDocs) => {
    //             if (skip >= numDocs) return next(new AppError(404, 'Page does not exist'))
    //         })
    //     }
    // }
    getQuery() {
        return this.query
    }
}

function buildObject(req, res, next, model) {
    const features = new ApiFeatures(req.query, model)
    features.filter()
    features.sort()
    features.select()
    const totalDocsCountQuery = features.getQuery().model.find().merge(features.getQuery())     //building a new query/deep cloning
    features.paginate(req, res, next)
    return { query: features.getQuery(), totalDocs: totalDocsCountQuery }
}

module.exports = buildObject