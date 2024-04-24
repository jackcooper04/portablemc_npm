
const fs = require('fs');
const path = require('path');
const { Console } = require('console');
const homedir = require('os').homedir();
var logPath = path.join(__dirname, 'logs');
var AUTHENTICATED_USER = {};
var portableMCLocation = 'portablemc';

async function executeMC(params, detached) {
  return new Promise((resolve) => {
    const logOutput = fs.createWriteStream(path.join(logPath, 'latest.log'));
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
      const viewer = spawn('cmd.exe', ['/C', 'node', path.join(__dirname, 'loggerViewer.js')],
        {
          detached: true,
        }
      )
    }
    exe.on('exit', function (code) {
      console.log('child exit code (spawn)', code);
      let filename = `${(new Date().toJSON().slice(0, 19))}.log`.replace(/:/g, ";");

      let writer = fs.createWriteStream(path.join(logPath, filename));
      writer.write(fs.readFileSync(path.join(logPath, 'latest.log')));

      fs.writeFileSync(path.join(logPath, 'latest.log'), '');
      resolve(true);

    })

    exe.stdout.on('data', (data) => {
      console.log(data);
      logger.log(data.toString().replace(/(\r\n|\n|\r)/gm, ""));
    });


    exe.stderr.on('data', (data) => {
      logger.log(data.toString().replace(/(\r\n|\n|\r)/gm, ""));
      //console.error(data.toString());
    });
  });

}

async function authenticate(email) {
  return new Promise(async (resolve) => {
  var minecraftDIR = path.join(homedir, 'AppData', 'Roaming', '.minecraft');
  if (fs.existsSync(minecraftDIR)) {
    var authFile = path.join(minecraftDIR, 'portablemc_auth.json');
    if (fs.existsSync(authFile)) {
      var authData = JSON.parse(fs.readFileSync(authFile));
      var loggedUsers = authData.microsoft.sessions;
      if (loggedUsers[email]) {
        var authObj = {
          username:loggedUsers[email].username,
          uuid:loggedUsers[email].uuid,
          email:email.replace(/(\w{3})[\w.-]+@([\w.]+\w)/, "$1***@$2")
        };
        console.log('user exists')
        AUTHENTICATED_USER = authObj;
        resolve(authObj);
        return;
      };
    };
  };
  const userLoggedIn = await loginBrowser(email);
  var authData = JSON.parse(fs.readFileSync(authFile));
      var loggedUsers = authData.microsoft.sessions;
  resolve(loggedUsers);
  })
}

async function loginBrowser(email) {
  return new Promise(async (resolve) => {
    const login = await executeMC(['login', '--auth-service', 'microsoft', email],true);
    resolve(true);
  });
  //   setTimeout(function(){
  //    return true;
  //  }, 2000);
  //
};

async function logout(email) {
  const logout = await executeMC(['logout', '--auth-service', 'microsoft', email]);
};

async function startGame(email, version, loader, logs) {
  if (!version) {
    version = 'release'
  };

  if (!loader) {
    const start = await executeMC(['start', version, '-l', email], logs);
  } else {
    const start = await executeMC(['start', loader + ":" + version, '-l', email]);
  }

};

//startGame('jc3053765@gmail.com','1.8','',true)
async function test() {
  const test1 = await authenticate('jackmeta004@gmail.com')
  console.log(test1)
}
test();
async function declareLogFile(path) {
  logPath = path;
};


module.exports = { startGame, loginBrowser, logout, declareLogFile }