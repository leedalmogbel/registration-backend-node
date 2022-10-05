const trainer = require("../services/trainer.services");
const createError = require("http-errors");
const { ip } = require("../utils/helpers");

class trainerController {
  static store = async (req, res, next) => {
    try {
      let { data } = req.body;
      data = JSON.parse(data);

      const { documentExpiry, ...rest } = data;
      const file = req.file || {};

      data = {
        ...rest,
        documents: {
          documentExpiry: documentExpiry,
          file: file,
          filePath: `http://${ip}:7331/${file.path}`,
        },
      };

      const response = await trainer.create(data);

      res.status(200).json({
        status: true,
        message: "Trainer Created successfully",
        data: response,
      });
    } catch (err) {
      console.log("errasdasd", err);
      next(createError(err.statusCode, err.message));
    }
  };

  static list = async (req, res, next) => {
    try {
      if ('query' in req.query) {
        const { id, query } = req.query;

        const { data, count } = await trainer.searchTrainerByName(parseInt(id), query);
        res.status(200).json({
          status: "success",
          data,
          count
        });
      } else {
        const params = req.query;

        const { data, count } = await trainer.fetchAll(params);
        res.status(200).json({
          status: "success",
          data,
          count,
        });
      }
    } catch (err) {
      console.log(err)
      next(createError(err.statusCode, err.message));
    }
  };

  static show = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await trainer.getTrainerDetail(parseInt(id));
      res.status(200).json({
        status: true,
        message: "Fetch Trainer",
        data,
      });
    } catch (err) {
      console.log("THIS!!!", err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };

  static update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      let { data } = req.body;
      data = JSON.parse(data);

      const { documentExpiry, ...rest } = data;
      const file = req.file || {};

      data = {
        ...rest,
        documents: {
          documentExpiry: documentExpiry,
          file: file,
          filePath: `http://${ip}:7331/${file.path}`,
        },
      };
      const detail = await trainer.updateTrainer(id, data);
      res.status(200).json({
        status: true,
        message: "Trainer updated successfully",
        data: detail,
      });
    } catch (err) {
      console.log("THIS!!!", err);
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
      console.log(id, status);
      const data = await trainer.updateStatus(parseInt(id), status);
      console.log(data);
      res.status(200).json({
        status: true,
        message: "Trainer status updated",
        data,
      });
    } catch (error) {
      console.log("THIS!!!", err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };

  static trainerAutoFill = async (req, res, next) => {
    console.log(req.query)

    try {
      const { id, query } = req.query;

      const { response, count } = await trainer.searchTrainerByName(parseInt(id), query);
      console.log('count', count)
      res.status(200).json({
        status: true,
        message: "Trainer Fetched!",
        response,
        count
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };
}

module.exports = trainerController;
