const { v4: uuidv4 } = require("uuid");
const dbClient = require("../utils/db.js");
const redisClient = require("../utils/redis.js");
const fs = require("fs");

let folderPath = "";
if (!process.env.FOLDER_PATH || process.env.FOLDER_PATH === "") {
  folderPath = "/tmp/files_manager";
} else {
  folderPath = process.env.FOLDER_PATH;
}

class FilesController {
  static async postUpload(req, res) {
    console.log(req.headers);
    const tokenHeader = "auth_" + req.headers["x-token"];
    console.log(`tokenHeader: ${tokenHeader}`);
    const user = await redisClient.get(tokenHeader);
    console.log(user);
    if (!req.body.name) {
      res.status(400).send("Missing name");
    }
    const type = req.body.type;
    const data = req.body.data;
    let typeValidation = false;
    if (type === "folder" || type === "file" || type === "image") {
      typeValidation = true;
    }
    if (!type || typeValidation === false) {
      res.status(400).send("Missing type");
    }
    if (!data && type !== "folder") {
      res.status(400).send("Missing data");
    }
    let parentId = 0;
    if (req.body.parentId) {
      parentId = req.body.parentId;
    }
    console.log(`parentId: ${parentId}`);
    if (parentId !== 0) {
      const parent = await dbClient.findFile(parentId);
      console.log("parent: " + parent);
      if (!parent) {
        res.status(400).send("Parent not found");
      } else if (parent.type !== "folder") {
        res.status(400).send("Parent is not a folder");
      } else {
        folderPath = parent.name;
        console.log("Folder path: " + folderPath);
      }
    }
    if (type !== "folder") {
      const fileName = uuidv4();
      const newFile = {
        userId: user,
        name: req.body.name,
        type: req.body.type,
        isPublic: req.body.isPublic,
        parentId: parentId,
        localPath: `${folderPath}/${String(fileName)}`,
      };
      fs.writeFile(
        newFile.localPath,
        req.body.data,
        { encoding: "base64" },
        (err) => {
          if (err) throw err;
          console.log(`file ${newFile.name} saved to ${newFile.localPath}`);
        }
      );
      const addedFile = await dbClient.createFile(newFile);
      console.log(addedFile._id);
      res.status(201).send(newFile);
    } else {
      const newFolder = {
        userId: user,
        name: req.body.name,
        type: req.body.type,
        isPublic: req.body.isPublic,
        parentId: parentId,
      };
      fs.mkdir(newFolder.name, (err) => {
        if (err) throw err;
        console.log(`folder ${newFolder.name} saved`);
      });
      await dbClient.createFile(newFolder);
      res.status(200).send(newFolder);
    }
  }

  static async getShow(req, res) {
    const tokenHeader = "auth_" + req.headers["x-token"];
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
    const tokenHeader = "auth_" + req.headers["x-token"];
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
    console.log("parentId: " + req.query.parentId);
    const offset = pageSize * pageNumber;
    const files = dbClient.db.collection("files");
    const query = await files
      .find({ parentId: req.query.parentId })
      .sort({ _id: 1 })
      .skip(offset)
      .limit(pageSize)
      .toArray();
    for (const doc of query) {
      console.log(`id: ${doc._id} - parentId: ${doc.parentId}`);
    }
    res.status(200).send(query);
  }

  static async putPublish(req, res) {
    const tokenHeader = "auth_" + req.headers["x-token"];
    console.log(`tokenHeader: ${tokenHeader}`);
    const user = await redisClient.get(tokenHeader);
    if (!user) {
      res.status(401).send("Unauthorized");
    }
    const fileId = req.params.id;

    const updateDoc = {
      $set: {
        isPublic: "True",
      },
    };

    await dbClient.db
      .collection("files")
      .updateOne({ _id: ObjectId(fileId) }, updateDoc);

    const updatedFile = await dbClient.db
      .collection("files")
      .findOne({ _id: ObjectId(fileId) });
    res.status(200).send(updatedFile);
  }
}

module.exports = FilesController;
