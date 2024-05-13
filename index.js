// Dependencies
const platform = require('os').platform();
const path = require('path');
const { Console, error } = require('console');
const homedir = require('os').homedir();
const { spawn } = require('node:child_process');
const fs = require('fs')

// Global Variables
var PACKAGE_CONFIGURED = false;
var MAIN_DIRECTORY_PATH = "";
var logPath = path.join(__dirname, 'logs');
var previousAction = 'boot';
var bootStarted = false;
var programStart = false;
var quitCleanly = true;

// OS Dependent Variables
var EXPECTED_PMC_PATH = "";
if (platform == "win32") {
  EXPECTED_PMC_PATH = path.join('C:\\Users\\jc305\\AppData\\Roaming\\Python\\Python312\\Scripts\\portablemc.exe')
  try {
      var pythonScriptPath = path.join(homedir,'AppData','Roaming','Python');
      var scriptSources = fs.readdirSync(pythonScriptPath); 

      for (idx in scriptSources) {
          var scriptPath = fs.existsSync(path.join(pythonScriptPath,scriptSources[idx],'Scripts','portablemc.exe'));
          if (scriptPath) {
              portableMCExeFound = true;
              EXPECTED_PMC_PATH = path.join(pythonScriptPath,scriptSources[idx],'Scripts','portablemc.exe')
          };
      };
  } catch (error) {
      EXPECTED_PMC_PATH = "";
  };
} else if (platform == 'linux') {
  EXPECTED_PMC_PATH = path.join(homedir,'.local','bin','portablemc')
} else {
  throw new Error('Platform Not Suppourted');
};



// Config Set
var ACTUAL_PMC_LOCATION = "";
function config(options) {
  return new Promise((resolve) => {
    if (!options.EXE_LOCATION) {
      options.EXE_LOCATION = EXPECTED_PMC_PATH;
    };
    if (options.LOG_LOCATION) {
      logPath = options.LOG_LOCATION;
    };
    if (!fs.existsSync(path.join(logPath,'auth'))) {
      fs.mkdirSync(path.join(logPath,'auth'));
    };
    if (!fs.existsSync(path.join(logPath,'game'))) {
      fs.mkdirSync(path.join(logPath,'game'));
    };
    if (!fs.existsSync(path.join(logPath,'other'))) {
      fs.mkdirSync(path.join(logPath,'other'));
    };
    
    if (options.MAIN_DIR) {
      MAIN_DIRECTORY_PATH = options.MAIN_DIR;
    };
    if (fs.existsSync(options.EXE_LOCATION)) {
      ACTUAL_PMC_LOCATION = options.EXE_LOCATION;
      //const genVersions = executeMC(['search']);
    } else {
      throw new Error('portableMC.exe not found');
    };
  })
};




// portableMC Communicator
async function executeMC(params, action) {
  return new Promise((resolve) => {
    if (!action) {
      action = 'other';
    }
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
  //const test = await executeMC(['login','--auth-service','microsoft','jc3053765@gmail.com'],'auth')
  //const test = await executeMC(['start','forge:1.8','-l','jc3053765@gmail.com'],'game')
  console.log(platform)
  console.log('finished')
}
config({})