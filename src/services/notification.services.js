const prisma = require('../utils/prisma');
require('dotenv').config();

class notificationService {
    static async create(data) {
        try {
            /**
             * params
             * userId - receiver
             * senderId - sender
             * message - message from FE
             * status - isRead
             * readAt - when read
             * type - user, rider, horse, race
            */
            const notif = await prisma.notifications.create({
                data
            })
            //  userId: 1, //response.userId,
            //  senderId: response.userId,
            //  message: `User {${response.userId}} has been created`,
            //  type: "owner",
            //  senderType: user.userType,
            return data;
        } catch (error) {
            console.log("error", error);
            throw new Error(error.message, 400);
        }
    }

    static async all(params) {}

    static async fetch(params) {
        try {
        } catch (error) {
            console.log('fetch', error);
            throw new Erorr(erorr.message, 400);
        }
    }

    static async update(params) {}
}

module.exports = notificationService;