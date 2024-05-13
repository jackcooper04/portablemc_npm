// Dependencies
const platform = require('os').platform();
const path = require('path');
const { Console } = require('console');
const homedir = require('os').homedir();
const { spawn } = require('node:child_process');
const fs = require('fs')

// Global Variables
var PACKAGE_CONFIGURED = false;
var logPath = path.join(__dirname, 'logs');
var previousAction = 'boot';
var bootStarted = false;
var programStart = false;
var quitCleanly = true;

// OS Dependent Variables

// Pre-set to Windows
var EXPECTED_PMC_PATH = path.join('C:\\Users\\jc305\\AppData\\Roaming\\Python\\Python312\\Scripts\\portablemc.exe')

// Config Set




// portableMC Communicator
async function executeMC(params, action) {
  return new Promise((resolve) => {
    quitCleanly = true;
    const logOutput = fs.createWriteStream(path.join(logPath,action,'latest.log'));
    const logger = new Console({ stdout: logOutput });
    const { spawn } = require('node:child_process');
    const exe = spawn(EXPECTED_PMC_PATH, [...params],
      {
        stdio: 'pipe'
      }
    )
    exe.on('exit', function (code) {
      if (bootStarted) {
        bootStarted = false;
        logger.log('BOOTEND\nPROGRAMEND');
      } else {
        logger.log('GAMEEND\nPROGRAMEND');
      };
      let filename = `${(new Date().toJSON().slice(0, 19))}.log`.replace(/:/g, ";");
      let writer = fs.createWriteStream(path.join(logPath, action,filename));
      writer.write(fs.readFileSync(path.join(logPath, action,'latest.log')));
      fs.writeFileSync(path.join(logPath,action, 'latest.log'), '');
      bootStarted = false;
      previousAction = 'boot';
      resolve(quitCleanly);
    });

    exe.stdout.on('data', (data) => {
      if (!bootStarted && !programStart) {
        logger.log('PROGRAMSTART');
        logger.log('BOOTSTART');
        bootStarted = true;
        programStart = true;
      };
      var convertedData = data.toString().replace(/(\r\n|\n|\r)/gm,"splitme").replace(/  +/g, ' ');
        var action = convertedData.split("splitme").filter(str => /\w+/.test(str));
        for (idx in action) {
          var identfyAction = action[idx].match(/(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])/g);
          if (identfyAction == null){
            identfyAction = 'boot';
          } else {
            identfyAction = 'game';
          };
          if (identfyAction != previousAction && previousAction != 'game' && bootStarted) {
            logger.log('\nBOOTEND');
            bootStarted = false;
            logger.log('GAMESTART');
          };
          console.log(action[idx])
          logger.log(action[idx]);
          if (action[idx].includes('Game crashed!')) {
            quitCleanly = false;
          };
          previousAction = identfyAction;
        };
    });
    exe.stderr.on('data', (data) => {
      //logger.log(data.toString().replace(/(\r\n|\n|\r)/gm, ""));
      console.error(data.toString());
    });
  });
};

async function test() {
  const test = await executeMC(['login','--auth-service','microsoft','jc3053765@gmail.com'],'auth')
  //const test = await executeMC(['start','forge:1.8','-l','jc3053765@gmail.com'],'game')
  console.log(test)
  console.log('finished')
}
test();