
const fs = require('fs');
const path = require('path');
const { Console } = require('console');

var logPath = path.join(__dirname,'logs');

var portableMCLocation = path.join(__dirname, 'portablemc.exe');

console.log(portableMCLocation)

async function executeMC(params,detached) {
  const logOutput = fs.createWriteStream(path.join(logPath,'latest.log'));
  const logger = new Console({ stdout: logOutput });
  if (detached == undefined) {
    detached = false;
  }

  const { spawn } = require('node:child_process');
  const exe = spawn('cmd.exe', ['/C', portableMCLocation, ...params],
    {
      stdio: 'pipe'
    }
  )

  if (detached) {
    const viewer = spawn('cmd.exe', ['/C','node',path.join(__dirname,'loggerViewer.js')],
    {
      detached: true,
    }
  )
  }
  exe.on('exit',function(code){
    console.log('child exit code (spawn)', code);
    let filename = `${(new Date().toJSON().slice(0,19))}.log`.replace(/:/g, ";");

    let writer = fs.createWriteStream(path.join(logPath,filename));
    writer.write(fs.readFileSync(path.join(logPath,'latest.log')));

    fs.writeFileSync(path.join(logPath,'latest.log'),'');
    
  })

  exe.stdout.on('data', (data) => {
    console.log(data);
    logger.log(data.toString().replace(/(\r\n|\n|\r)/gm, ""));
  });


  exe.stderr.on('data', (data) => {
   //console.error(data.toString());
  });
}


async function loginBrowser(email) {
  const login = await executeMC(['login','--auth-service','microsoft',email]);
};

async function logout(email) {
  const logout = await executeMC(['logout','--auth-service','microsoft',email]);
};

async function startGame(email,version,loader,logs) {
  if (!version) {
    version = 'release'
  };

  if (!loader) {
    const start = await executeMC(['start',version,'-l',email],logs);
  } else {
    const start = await executeMC(['start',loader+":"+version,'-l',email]);
  }
 
};

startGame('jc3053765@gmail.com','1.7.10')

async function declareLogFile(path) {
  logPath = path;
};


module.exports = {startGame,loginBrowser,logout}