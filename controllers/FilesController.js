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
        // if (parentId !== 0) {
            
        // }
    }
}

module.exports = FilesController;