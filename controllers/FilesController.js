const { v4: uuidv4 } = require("uuid");
const dbClient = require('../utils/db.js');
const redisClient = require('../utils/redis.js');
const fs = require('fs');
const mime = require('mime-types');

// set path to local storage - if path does not exist, create it.
let folderPath = '';
if (!process.env.FOLDER_PATH || process.env.FOLDER_PATH === '') {
    folderPath = '/tmp/files_manager';
} else {
    folderPath = process.env.FOLDER_PATH;
}
if(!fs.existsSync(folderPath)) {
    fs.mkdir(folderPath, () => {
        console.log("creating storage directory");
    });
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
        if(req.body.parentId) {
            parentId = req.body.parentId;
        }
        console.log(`parentId: ${parentId}`);
        if (parentId !== 0) {
            const parent = await dbClient.findFile(parentId);
            console.log("parent: "+parent)
            if (!parent) {
                res.status(400).send('Parent not found');
            } else if (parent.type !== 'folder') {
                res.status(400).send('Parent is not a folder');
            } else {
                folderPath = parent.name;
                console.log("Folder path: "+folderPath);
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
            const addedFile = await dbClient.createFile(newFile);
            console.log(addedFile._id);
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
        console.log(user);
        const showFile = await dbClient.findFileByUserId(req.params.id, user);
        if (!showFile) {
            res.status(404).send("Not found");
        } else {
            res.status(200).send(showFile);
        }
    }

    static async getIndex(req, res) {
        const tokenHeader = "auth_"+req.headers['x-token'];
        console.log(`tokenHeader: ${tokenHeader}`);
        const user = await redisClient.get(tokenHeader);
        if (!user) {
            res.status(401).send("Unauthorized");
        }
        const pageSize = 20;
        const pageNumber = 0;
        if (req.query.page) {
            pageNumber = req.query.page;
        }
        console.log("parentId: "+req.query.parentId)
        const offset = pageSize * pageNumber;
        const files = dbClient.db.collection('files');
        const query = await files.find({parentId: req.query.parentId}).sort({_id: 1}).skip(offset).limit(pageSize).toArray();
        for (const doc of query) {
            console.log(`id: ${doc._id} - parentId: ${doc.parentId}`);
        }
        res.status(200).send(query);
    }

    static async getFile(req, res) {
        // retrieve file data from storage based on provided params
        const fileId = req.params.id;
        const gotFile = await dbClient.findFile(fileId);
        if (!gotFile || !gotFile.isPublic) {
            res.status(404).send("Not found");
        }
        if (gotFile.type === 'folder') {
            res.status(400).send("A folder doesn't have content");
        }
        // store content type based on file name
        const contentType = mime.contentType(gotFile.name);
        // pull char set out of content type header to be used when opening the file
        const charSet = contentType.split('=')[1];

        // open file, send either data or error depending on if it was successful.
        fs.readFile(gotFile.localPath, charSet, (err, data) => {
            if (err) {
                res.status(404).send("Not found");
            }
            res.set('Content-Type', contentType);
            res.status(200).send(data);
        });
    }
}

module.exports = FilesController;