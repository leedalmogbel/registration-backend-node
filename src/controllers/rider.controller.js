const rider = require("../services/rider.services");
const createError = require("http-errors");
const { ip } = require("../utils/helpers");

class riderController {
  static store = async (req, res, next) => {
    try {
      let data = {}
      if ('data' in req.body) {
        data = JSON.parse(req.body.data);
      } else {
        data = req.body;
      }

      const { documentExpiry, ...rest } = data;
      const files = req.files || {};

      const file = (files.file && files.file[0]) || null;
      const photo = (files.photo && files.photo[0]) || null;

      data = {
        ...rest,
        documents: {
          documentExpiry: documentExpiry,
          file: file,
          filePath: (file && `http://${ip}:7331/${file.path}`) || '',
        },
        riderImage: {
          file: photo,
          filePath: (photo && `http://${ip}:7331/${photo.path}`) || '',
         }
      };

      const response = await rider.create(data);

      res.status(200).json({
        status: true,
        message: "rider Created successfully",
        data: response,
      });
    } catch (err) {
      console.log("errasdasd", err);
      next(createError(err.statusCode, err.message));
    }
  };

  static list = async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      const { data, count } = await rider.fetchAll(params);
      res.status(200).json({
        status: true,
        messsage: "Fetch all riders",
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
      const data = await rider.getRiderDetail(parseInt(id));
      res.status(200).json({
        status: true,
        message: "Fetch rider",
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
      const detail = await rider.updateRider(id, data);
      res.status(200).json({
        status: true,
        message: "rider updated successfully",
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

      const data = await rider.updateStatus(parseInt(id), status);
      res.status(200).json({
        status: true,
        message: "rider status updated",
        data,
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };
}

module.exports = riderController;
