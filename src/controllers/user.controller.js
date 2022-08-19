const user = require("../services/user.services");
const createError = require("http-errors");
const { ip } = require("../utils/helpers");

class userController {
  static register = async (req, res, next) => {
    try {
      let { data } = req.body;
      data = JSON.parse(data);

      const { documentExpiry, ...rest } = data;
      const file = req.file || {};
      let userType = "Admin";

      switch (parseInt(rest.roleId)) {
        case 2:
          userType = "User";
          break;
        case 3:
          userType = "EEF";
          break;
      }

      data = {
        ...rest,
        roleId: parseInt(rest.roleId),
        userType,
        documents: {
          documentExpiry: documentExpiry,
          file: file,
          filePath: `http://${ip}:7331/${file.path}`,
        },
      };
      console.log("ip", ip);

      // const response = await user.register(data);
      // res.status(200).json({
      //   status: true,
      //   message: "User Created successfully",
      //   data: response,
      // });
    } catch (err) {
      console.log(err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };

  static login = async (req, res, next) => {
    console.log(req.body);
    try {
      const data = await user.login(req.body);
      console.log("test", data);

      res.cookie("jwt", data.refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      delete data.refreshToken;

      res.status(200).json({
        status: true,
        message: "Account login successfully",
        data,
      });
    } catch (err) {
      console.log("poiwe", err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };

  static fetchUser = async (req, res, next) => {
    const { id } = req.params;

    try {
      const data = await user.getUserDetail(parseInt(id));

      res.status(200).json({
        status: true,
        message: "User Fetched successfully",
        data,
      });
    } catch (err) {
      console.log("poiwe", err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };

  static all = async (req, res, next) => {
    try {
      const params = req.query;
      const users = await user.all(params);
      res.status(200).json({
        status: true,
        message: "Fetch all users",
        data: users,
      });
    } catch (err) {
      next(createError(err.statusCode, err.message));
    }
  };

  static updateStatus = async (req, res, next) => {
    const id = parseInt(req.params.id);
    const status = req.body.status;
    try {
      const data = await user.updateStatus({ id, status });
      res.status(200).json({
        status: true,
        message: "User status updated",
        data: data,
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };

  static updateUserDetail = async (req, res, next) => {
    const id = parseInt(req.params.id);
    let { data } = req.body;
    data = JSON.parse(data);

    const { documentExpiry, ...rest } = data;
    const file = req.file || {};
    let userType = "Admin";

    switch (parseInt(rest.roleId)) {
      case 2:
        userType = "User";
        break;
      case 3:
        userType = "EEF";
        break;
    }

    data = {
      ...rest,
      userType,
      roleId: parseInt(rest.roleId),
      documents: {
        documentExpiry: documentExpiry,
        file: file,
        filePath: `http://${ip}:7331/${file.path}`,
      },
    };
    try {
      const detail = await user.updateInfo(id, data);
      res.status(200).json({
        status: true,
        message: "User Info updated",
        data: detail,
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };

  static dashboard = async (req, res, next) => {
    try {
      const params = req.query;
      const data = await user.dashboardCategoryCount(params);
      console.log(data);
      res.status(200).json({
        status: true,
        message: "Fetch dashboard count",
        data: data,
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };

  static handleRefreshToken = async (req, res) => {
    try {
      const cookies = req.cookies;
      console.log("cookies", cookies);
      if (!cookies?.jwt) {
        res.status(401).json({
          error: true,
          message: "Unauthorized",
        });
      }

      const refreshToken = cookies.jwt;
      const accessToken = await user.checkRefreshToken(refreshToken);
      res.status(200).json({
        status: true,
        data: accessToken,
      });
    } catch (error) {
      res.status(404).json({
        error: true,
        message: error,
      });
    }
  };

  static forgotPassword = async (req, res) => {
    const { mobile } = req.body;

    if (!mobile)
      res
        .status(404)
        .json({ error: true, message: "Mobile number is required" });

    const userId = await user.getUserDetailByMobile(mobile);
    console.log(userId);
    if (!userId)
      res.status(404).json({ error: true, message: "User not found" });

    try {
      const data = await user.sendOtp(userId, mobile);

      res.status(200).json({
        status: true,
        message: "Otp Successfully Sent",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(404).json({
        error: true,
        message: error,
      });
    }
  };

  static changePassword = async (req, res, next) => {
    try {
      const { id, password, otp } = req.body;
      if (!password)
        res.status(404).json({ error: true, message: "Password is required" });
      if (!otp)
        res.status(404).json({ error: true, message: "OTP is required" });

      const isOtpExist = await user.verifyOtp(otp);
      if (!isOtpExist) {
        return res.status(404).json({ error: true, message: "OTP doesnt exist" });
      }

      await user.changePass(parseInt(id), password);
      res.status(200).json({
        status: true,
        message: "Password Successfully Changed",
      });
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = userController;
