const owner = require("../services/owner.services");
const createError = require("http-errors");
const { ip } = require("../utils/helpers");

class ownerController {
  static store = async (req, res, next) => {
    try {
      let { data } = req.body;
      data = JSON.parse(data);

      console.log(data)

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
console.log(';', data)
      const response = await owner.create(data);

      res.status(200).json({
        status: true,
        message: "Owner Created successfully",
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

        const { data, count } = await owner.searchOwnerByName(parseInt(id), query);
        res.status(200).json({
          status: "success",
          data,
          count
        });
      } else {
        const params = req.query;

        const { data, count } = await owner.fetchAll(params);
        res.status(200).json({
          status: "success",
          data,
          count,
        });
      }
    } catch (err) {
      next(createError(err.statusCode, err.message));
    }
  };

  static show = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await owner.getOwnerDetail(parseInt(id));
      res.status(200).json({
        status: true,
        message: "Fetch owner",
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
      const detail = await owner.updateOwner(id, data);
      res.status(200).json({
        status: true,
        message: "Owner updated successfully",
        data: detail,
      });
    } catch (err) {
      console.log("err", err);
      next(createError(err.statusCode, err.message));
    }
  };

  static updateStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const status = req.body.status;

      const data = await owner.updateStatus(parseInt(id), status);
      res.status(200).json({
        status: true,
        message: "Owner status updated",
        data,
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };

  static ownerAutoFill = async (req, res, next) => {
    console.log(req.query)

    try {
      const { id, query } = req.query;

      const { response, count } = await owner.searchOwnerByName(parseInt(id), query);
      res.status(200).json({
        status: true,
        message: "Owner Fetched!",
        response,
        count
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };
}

module.exports = ownerController;
