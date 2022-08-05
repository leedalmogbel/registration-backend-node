const prisma = require('../utils/prisma');
require('dotenv').config();

const otpGenerator = require('otp-generator');

class ticketService {
    static async create(params) {
        try {
            const { status } = params;
            let otp = '';
            if (status === 'approved') {
                otp = otpGenerator.generate(10, {
                    digits: true,
                    lowerCaseAlphabets: false,
                    upperCaseAlphabets: false,
                    specialChars: false,
                });
            }

            let data = {};
            data = {
                otp,
                userId: params.userId,
                entriesId: params.raceId,
            }
            const ticket = await prisma.tickets.create({
                data
            })
            console.log(ticket)
            return ticket;
        } catch (error) {
            console.log("error", error);
            throw new Error(error.message, 400);
        }
    }

    static async all(params) {}

    static async fetch(params) {
        try {
            const otp = params;
            console.log(otp)
            console.log(typeof otp)
            const ticket = await prisma.tickets.findFirst({
                where: {
                    otp: otp
                },
                include: {
                    entries: {
                        include: {
                            users: true,
                            horses: {
                                include: {
                                    owners: true,
                                    trainers: true
                                }
                            },
                            riders: true,
                        }
                    }
                }
            });

            console.log('id', ticket)
            return ticket;
        } catch (error) {
            console.log('fetch', error);
            throw new Erorr(erorr.message, 400);
        }
    }

    static async update(params) {}
}

module.exports = ticketService;