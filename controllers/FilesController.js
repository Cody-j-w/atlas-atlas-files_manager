const { v4: uuidv4 } = require("uuid");
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
        console.log(req.headers)
        const tokenHeader = "auth_"+req.headers['x-token'];
        console.log(`tokenHeader: ${tokenHeader}`);
        const user = await redisClient.get(tokenHeader);
        console.log(user);
        if (!req.body.name) {
            res.status(400).send('Missing name');
        }
        const type = req.body.type;
        const data = req.body.data;
        let typeValidation = false;
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
        console.log("request parentId: "+req.body.parentId);
        if(req.body.parentId) {
            parentId = req.body.parentId;
        }
        console.log(`parentId: ${parentId}`);
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
            const fileName = uuidv4();
            const newFile = {
                userId: user,
                name: req.body.name,
                type: req.body.type,
                isPublic: req.body.isPublic,
                parentId: parentId,
                localPath: `${folderPath}/${String(fileName)}`
            }
            fs.writeFile(newFile.localPath, req.body.data, {encoding: 'base64'}, (err) => {
                if (err) throw err;
                console.log(`file ${newFile.name} saved to ${newFile.localPath}`);
            });
            await dbClient.createFile(newFile);
            res.status(201).send(newFile);
        } else {
            const newFolder = {
                userId: user,
                name: req.body.name,
                type: req.body.type,
                isPublic: req.body.isPublic,
                parentId: parentId
            }
            fs.mkdir(newFolder.name, (err) => {
                if (err) throw err;
                console.log(`folder ${newFolder.name} saved`);
            });
            await dbClient.createFile(newFolder);
            res.status(200).send(newFolder);
        }
    }

    static async getShow(req, res) {
        const tokenHeader = "auth_"+req.headers['x-token'];
        console.log(`tokenHeader: ${tokenHeader}`);
        const user = await redisClient.get(tokenHeader);
        if (!user) {
            res.status(401).send("Unauthorized");
        }

        const showFile = dbClient.db.findOne({userId: user, _id: req.body.id});
        if (!showFile) {
            res.status(404).send("Not found");
        } else {
            res.status(200).send(showFile);
        }
    }

    static async getIndex(req, res) {

    }
}

module.exports = FilesController;