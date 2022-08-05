const stable = require("../services/stable.services");
const createError = require("http-errors");
const { ip } = require("../utils/helpers");

class stableController {
  static store = async (req, res, next) => {
    try {
      let data = {}
      if ('data' in req.body) {
        data = JSON.parse(req.body.data);
      } else {
        data = req.body;
      }

      const response = await stable.create(data);

      res.status(200).json({
        status: true,
        message: "stable Created successfully",
        data: response,
      });
    } catch (err) {
      console.log("err", err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };

  static list = async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      const { data, count } = await stable.fetchAll(params);
      res.status(200).json({
        status: true,
        messsage: "Fetch all stables",
        data,
        count,
      });
    } catch (err) {
      next(createError(err.statusCode, err.message));
    }
  };

  static show = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await stable.getStableDetail(parseInt(id));
      res.status(200).json({
        status: true,
        message: "Fetch stable",
        data,
      });
    } catch (err) {
      console.log("error", err)
      next(createError(err.statusCode, err.message));
    }
  };

  static update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      let { data } = req.body;
      data = JSON.parse(data);

      const detail = await stable.updateStable(id, data);
      res.status(200).json({
        status: true,
        message: "stable updated successfully",
        data: detail,
      });
    } catch (err) {
      console.log("err", err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };

  static updateStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const status = req.body.status;

      const data = await stable.updateStatus(parseInt(id), status);
      res.status(200).json({
        status: true,
        message: "stable status updated",
        data,
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };
}

module.exports = stableController;
