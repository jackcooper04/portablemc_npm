const fs = require('fs');
const path = require('path');
const homedir = require('os').homedir();

const EXPECTED_PORTABLEMC_PATH = path.join(homedir,'AppData','Roaming','Python','Python312','Scripts','portablemc.exe');

if (fs.existsSync(EXPECTED_PORTABLEMC_PATH)) {
    const PACKAGE_DIRECTORY = path.join(__dirname,'portablemc.exe');
    fs.copyFileSync(EXPECTED_PORTABLEMC_PATH,PACKAGE_DIRECTORY);
} else {
    console.log('Unable to find')
};
