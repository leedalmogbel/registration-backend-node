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

	static async fetchAll(params) {
			const { id } = params;
			console.log('params', parseInt(id))
			try {
				const [notifOwners] = await Promise.all([
						await prisma.notifications.findMany({
							where: { type: 'owner', userId: parseInt(id), isRead: false }
						})
					]);

					return {
						owners: notifOwners,
					}
			} catch (error) {
					console.log('all', error);
					throw new Error(error.message, 400);
			}
	}

	static async fetch(params) {
		try {
		} catch (error) {
			console.log('fetch', error);
			throw new Erorr(erorr.message, 400);
		}
	}

	static async updateNotification(params) {
		try {
			const qwewqe = await prisma.notifications.findMany({
				where: {
					entityId: params.id
				}
			})
			console.log(qwewqe, 'zzzzz')
			// const notif = await prisma.notifications.updateMany({
			//     where: {
			//         entityId: params.id
			//     },
			//     data: {
			//         isRead: true,
			//         readAt: new Date()
			//     }
			// })
			const notif = await prisma.$queryRaw`
				UPDATE notifications
				SET isRead = true, readAt = ${new Date()}
				WHERE entityId=${params.id}
			`;
console.log('tuleg', notif)
			return notif;
		} catch (error) {
			console.log('UpdateNotif error', error);
			throw new Error(error.message, 400);
		}
	}
}

module.exports = notificationService;