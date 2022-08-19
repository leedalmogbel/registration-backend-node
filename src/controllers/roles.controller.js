const roles = require('../services/roles.services')
const createError = require('http-errors')

class rolesController {
  static store = async (req, res, next) => {
    try {
      const data = await roles.create(req.body)

      res.status(200).json({
        status: true,
        message: 'Role Created successfully',
        data: data
      })
    } catch (err) {
      console.log(err)
      next(createError(err.statusCode, err.message))
    }
  };

  static list = async (req, res, next) => {
    try {
      const data = await roles.fetchAll();
      res.status(200).json({
        status: true,
        messsage: 'Fetch all roles',
        data: data
      })
    } catch (err) {
      console.log(err)
      next(createError(err.statusCode, err.message))
    }
  };

  // static show = async (req, res, next) => {
  //   try {
  //     const data = await rider.getRider(req.params);
  //     res.status(200).json({
  //       status: true,
  //       message: 'Fetch rider',
  //       data: data
  //     })
  //   } catch (err) {
  //     next(createError(err.statusCode, err.message))
  //   }
  // };

  // static update = async (req, res, next) => {
  //   const _id = parseInt(req.params.id)
  //   try {
  //     const data = await rider.updateRider(_id, req.body)
  //     res.status(200).json({
  //       status: true,
  //       message: 'Rider updated successfully',
  //       data: data
  //     })
  //   } catch (err) {
  //     next(createError(err.statusCode, err.message))
  //   }
  // };
}

module.exports = rolesController;