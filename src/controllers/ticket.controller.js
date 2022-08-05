const ticket = require('../services/ticket.services');

class ticketController {
    static show = async (req, res, next) => {
        try {
            const { id } = req.params;
            console.log(req.params)
            const detail = await ticket.fetch(id);
            res.status(200).json({
                status: true,
                message: 'Fetch ticket',
                data: detail
            })
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = ticketController;