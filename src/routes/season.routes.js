const router = require('express').Router()
const season = require('../controllers/season.controller')
// const multer = require("multer"); # postman fix

// create
// router.post('/', multer().none(), season.store) # postman fix
router.post('/', season.store)

// fetch all
router.get('/', season.list)

module.exports = router