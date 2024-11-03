class AppController {
    static getStatus(req, res) {
        res.status(200).json({ status: 'OK' });
    }

    static getStats(req, res) {
        res.status(200).json({ status: 'OK' });
    }
}

module.exports = AppController;