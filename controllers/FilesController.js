const { uuidV4 } = require('mongodb/lib/core/utils.js');
const dbClient = require('../utils/db.js');
const redisClient = require('../utils/redis.js');
const fs = require('fs');

let folderPath = '';
if (!process.env.FOLDER_PATH || process.env.FOLDER_PATH === '') {
    folderPath = '/tmp/files_manager';
} else {
    folderPath = process.env.FOLDER_PATH;
}


class FilesController {

    static async postUpload(req, res) {
        if (!req.body.name) {
            res.status(400).send('Missing name');
        }
        const type = req.body.type;
        const typeValidation = false;
        if (type === 'folder' || type === 'file' || type === 'image') {
            typeValidation = true;
        }
        if (!type || typeValidation === false) {
            res.status(400).send('Missing type');
        }
        if (!data && type !== 'folder') {
            res.status(400).send('Missing data');
        }
        let parentId = 0;
        parentId = req.body.parentId;
        if (parentId !== 0) {
            const files = dbClient.db.collection('files');
            const parent = await files.findOne({_id: parentId});
            if (!parent) {
                res.status(400).send('Parent not found');
            } else if (parent.type !== 'folder') {
                res.status(400).send('Parent is not a folder');
            } else {
                folderPath = parent.name;
            }
        }
        if (type !== 'folder') {
            const fileName = new uuidV4();

        } else {
            const newFile = {
                userId: userId,
                name: req.body.name,
                type: req.body.type,
                
            }
            fs.mkdir(req.body.name, (err) => {

            })
        }

    }
}

module.exports = FilesController;