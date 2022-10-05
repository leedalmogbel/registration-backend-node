const prisma = require("../utils/prisma");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const AWS = require("aws-sdk");
const otpGenerator = require("otp-generator");
const { addMinutesToDate } = require("../utils/helpers");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

class userService {
  static async register(data) {
    try {
      const emailExist = await prisma.users.findFirst({
        where: {
          email: data.email
        }
      });

      const usernameExist = await prisma.users.findFirst({
        where: {
          username: data.username
        }
      });

      if (emailExist) {
        throw new Error("Email already exists.", 400);
      }

      if (usernameExist) {
        throw new Error("Username already exists.", 400);
      }

      let stable = await prisma.stable.findMany({ orderBy: { id: 'desc' } });
      const zeroPad = (num, places) => String(num).padStart(places, '0');
      let stableId = 'STABLE_';

      if (stable.length === 0) {
        stableId += zeroPad(1, 6);
      } else {
        stableId += zeroPad(stable[0].id + 1, 6);
      }

      data = {
        ...data,
        password: bcrypt.hashSync(data.password, 8),
        dob: new Date(data.dob),
      };
      
      const user = await prisma.users.create({ data });

      data = {
        name: "Private Individual Stable",
        eievStableId: stableId,
        userId: user.id,
      }
      const newStable = await prisma.stable.create({ data });
      console.log(newStable);

      delete user.password;
      return user;
    } catch (error) {
      console.log(error);
      throw new Error(error, 400);
    }
  }

  static async getUserDetail(id) {
    console.log(typeof id);

    try {
      const user = await prisma.users.findFirst({
        where: {
          id,
        },
      });

      delete user.password;
      return user;
    } catch (error) {
      console.log(error);
      throw new Error(
        "Account not verified, please contact Administration",
        400
      );
    }
  }

  static async getUserDetailByMobile(mobile) {
    console.log(mobile);

    try {
      const user = await prisma.users.findFirst({
        where: {
          mobile,
        },
      });

      if (!user) throw new Error("mobile not found", 400);

      const { id } = user;

      return id;
    } catch (error) {
      console.log("error", error);
      throw new Error(error.message, 400);
    }
  }

  static async login(data) {
    try {
      const { username, password } = data;
      console.log("username0", username);
      let user = await prisma.users.findFirst({
        where: {
          OR: [{ email: username }, { username: username }],
        },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!user) throw new Error("User not registered", 404);

      const checkPassword = bcrypt.compareSync(password, user.password);
      if (!checkPassword)
        throw new Error("Email address or Password not valid", 401);
      if (user.status !== "approved")
        throw new Error(
          "Account not verified, please contact Administrator",
          404
        );


      const accessToken = jwt.sign({ email: user.email }, accessTokenSecret, {
        expiresIn: "30s",
      });
      const refreshToken = jwt.sign({ email: user.email }, refreshTokenSecret, {
        expiresIn: "24h",
      });

      user = await prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
      });

      user = await prisma.users.findFirst({
        where: {
          OR: [{ email: username }, { username: username }],
        },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
        // select: {
        //   password: false,
        // }
      });

      return { ...user };
    } catch (error) {
      console.log("error", error);
      throw new Error(error.message, 400);
    }
  }

  static async all(params) {
    console.log(params)
    try {
      let filter = {};
      let allUsers = [];
      if ('id' in params) {
        let user = await prisma.users.findFirst({
          where: {
            id: parseInt(params.id)
          },
        });

        if (user.userType === 'Admin') {
          allUsers = await prisma.users.findMany({
            where: {
              id: {
                notIn: [parseInt(params.id)]
              }
            }
          });
        }
      } else {
        allUsers = await prisma.users.findMany({
        // where: {
        //   userType: 'User',
        // },
        });
      }
      // console.log(allUsers);
      return allUsers;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async updateStatus(data) {
    try {
      const user = await prisma.users.update({
        where: {
          id: data.id,
        },
        data: {
          status: data.status,
        },
      });

      return user;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async updateInfo(id, data) {
    try {
      const { documents } = data;

      if (Object.entries(documents.file).length === 0) {
        delete data.documents;
      }
      /* TODO: check old password if correct */
      delete data.oldPassword;
      delete data.password;

      data = {
        ...data,
        dob: new Date(data.dob),
        ...(data.newPassword && {
          password: bcrypt.hashSync(data.newPassword, 8),
        }),
      };

      delete data.newPassword;

      const user = await prisma.users.update({
        where: {
          id: id,
        },
        data,
      });

      return user;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async dashboardCategoryCount(params) {
    try {
      let filter = {};
      if ("id" in params && params.id > 1) {
        filter = {
          userId: parseInt(params.id),
        };
      }
console.log('params', params)
      const [users, owners, trainers, riders, horses] = await Promise.all([
        await prisma.users.count({}),
        await prisma.owners.count({ where: { ...filter } }),
        await prisma.trainers.count({ where: { ...filter } }),
        await prisma.riders.count({ where: { ...filter } }),
        await prisma.horses.count({ where: { ...filter } }),
        // await prisma.notifications.findMany({ 
        //   where: { userId: parseInt(params.id) }})
      ]);

      console.log('where', filter)
      // console.log('notifications', notifications)
      return {
        users,
        owners,
        trainers,
        riders,
        horses,
      };
    } catch (error) {
      console.log("THIS!!!", error);
    }
  }

  static async checkRefreshToken(data) {
    console.log("datatoken", data);
    let existUser = await prisma.users.findFirst({
      where: {
        refresh_token: data,
      },
    });

    if (!existUser) throw new Error("Unauthorized", 401);
    let accessToken = "";
    jwt.verify(data, refreshTokenSecret, (err, token) => {
      if (err || existUser.email !== token.email)
        throw new Error("Forbiden", 403);
      console.log("token", token);
      console.log("token", existUser.email);
      accessToken = jwt.sign({ email: token.email }, accessTokenSecret, {
        expiresIn: "30s",
      });
    });

    return accessToken;
  }

  static async sendOtp(userId, mobile) {
    try {
      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      const now = new Date();
      const expiresAt = addMinutesToDate(now, 10);

      userId = String(userId);
      const data = {
        otp,
        expiresAt,
        userId,
      };

      console.log("data", data);
      const params = {
        Message: `This is your OTP: ${otp}`,
        PhoneNumber: `+${mobile}`,
      };

      const payload = await prisma.otp.create({ data });

      const publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
        .publish(params)
        .promise();

      await publishTextPromise
        .then((data) => {
          console.log("otp sent", data.MessageId);
        })
        .catch((err) => {
          console.log("err", err);
        });

      return payload;
    } catch (error) {
      console.log(error);
    }
  }

  static async verifyOtp(otp) {
    try {
      const data = await prisma.otp.findFirst({
        where: {
          otp,
        },
      });

      if (!data) {
        throw new Error("OTP not found", 400);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  static async changePass(id, password) {
    try {
      const user = await prisma.users.update({
        where: {
          id: id,
        },
        data: {
          password: bcrypt.hashSync(password, 8),
        },
      });

      return user;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = userService;
