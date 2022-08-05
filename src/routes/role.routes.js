const router = require('express').Router()
const role = require('../controllers/roles.controller')

// create
router.post('/', role.store)

// fetch all
router.get('/', role.list)

// fetch by parameter
// router.get('/:id', rider.show)

// update rider by id
// router.put('/:id', rider.update)

module.exports = router