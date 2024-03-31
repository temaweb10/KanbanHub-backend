import * as fs from "fs";
export  function findAndDeleteFile(filePath, fileName) {



    fs.readdir(filePath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        files.forEach(file => {
            if (file.includes(fileName)) {
                fs.unlink(filePath + file, (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(file);
                    }
                });
            }
        });
    });
}