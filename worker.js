const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');
const dbClient = require('./utils/db');
const fs = require('fs');

const fileQueue = new Queue('fileQueue');
fileQueue.process(async (job, done) => {
    if (!job.data.userId) {
        throw new Error("Missing userId");
    }
    if (!job.data.fileId) {
        throw new Error("Missing fileId");
    }
    const file = await dbClient.findFileByUserId(job.data.fileId, job.data.userId);
    if (!file) {
        throw new Error("File not found");
    }
    let progress = 0;
    try {
        const thumbnail500 = await imageThumbnail(file.localPath, {width: 500});
        const path500 = file.localPath+"_500";
        fs.writeFile(path500, thumbnail500, (err) => {
            if (err) throw err;
            progress += 33;
            job.progress(progress);
        });
        const thumbnail250 = await imageThumbnail(file.localPath, {width: 250});
        const path250 = file.localPath+"_250";
        fs.writeFile(path250, thumbnail250, (err) => {
            if (err) throw err;
            progress += 33;
            job.progress(progress);
        });
        const thumbnail100 = await imageThumbnail(file.localPath, {width: 100});
        const path100 = file.localPath+"_100";
        fs.writeFile(path100, thumbnail100, (err) => {
            if (err) throw err;
            progress += 33;
            job.progress(progress);
        });
    } catch (err) {
        throw err;
    }
    progress += 1;
    job.progress(progress);
    done();
});
