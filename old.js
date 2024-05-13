const fs = require('fs');
const path = require('path');
const { Console } = require('console');
const homedir = require('os').homedir();

var logPath = ""
var AUTHENTICATED_USER = {};
var AUTHENTICATED_USER_EMAIL = "";
var MAIN_DIRECTORY = "";
MAIN_DIRECTORY_PATH = "";
var portableMCLocation = false;

function config(options) {
  return new Promise((resolve) => {
    if (!options.EXE_LOCATION) {
      options.EXE_LOCATION = path.join(homedir, 'AppData', 'Roaming', 'Python', 'Python312', 'Scripts', 'portablemc.exe');
    };
    if (options.LOG_LOCATION) {
      declareLogFile(options.LOG_LOCATION);
    } else {
      declareLogFile(path.join(__dirname, 'logs'))
    };

    if (options.MAIN_DIR) {
      MAIN_DIRECTORY = ["--main-dir", options.MAIN_DIR];
      MAIN_DIRECTORY_PATH = options.MAIN_DIR;
    };

    if (fs.existsSync(options.EXE_LOCATION)) {
      const PACKAGE_DIRECTORY = path.join(__dirname, 'portablemc.exe');
      portableMCLocation = options.EXE_LOCATION;
      const genVersions = executeMCDetached(['search'], false)
    } else {
      throw new Error('portableMC.exe not found');
    };
  })
};




async function executeMC(params, detached) {
  return new Promise((resolve) => {
    const logOutput = fs.createWriteStream(path.join(logPath, 'latest.log'));
    const logger = new Console({ stdout: logOutput });
    if (detached == undefined) {
      detached = false;
    }

    const { spawn } = require('node:child_process');
    const exe = spawn('cmd.exe', ['/C', portableMCLocation, ...MAIN_DIRECTORY, ...params],
      {
        stdio: 'pipe'
      }
    )

    if (detached) {
      const viewer = spawn('cmd.exe', ['/C', 'node', path.join(__dirname, 'loggerViewer.js'), logPath],
        {
          detached: true,
        }
      )
    }
    exe.on('exit', function (code) {
      //console.log('child exit code (spawn)', code);
      let filename = `${(new Date().toJSON().slice(0, 19))}.log`.replace(/:/g, ";");

      let writer = fs.createWriteStream(path.join(logPath, filename));
      writer.write(fs.readFileSync(path.join(logPath, 'latest.log')));

      fs.writeFileSync(path.join(logPath, 'latest.log'), '');
      resolve(true);

    })

    exe.stdout.on('data', (data) => {
      //console.log(data);
      logger.log(data.toString().replace(/(\r\n|\n|\r)/gm, ""));
    });


    exe.stderr.on('data', (data) => {
      logger.log(data.toString().replace(/(\r\n|\n|\r)/gm, ""));
      //console.error(data.toString());
    });
  });

}

function executeMCDetached(params, detached) {

  const logOutput = fs.createWriteStream(path.join(logPath, 'latest.log'));
  const logger = new Console({ stdout: logOutput });
  if (detached == undefined) {
    detached = false;
  }

  const { spawn } = require('node:child_process');
  const exe = spawn('cmd.exe', ['/C', portableMCLocation, ...MAIN_DIRECTORY, ...params],
    {
      stdio: 'pipe'
    }
  )

  if (detached) {
    const viewer = spawn('cmd.exe', ['/C', 'node', path.join(__dirname, 'loggerViewer.js'), logPath],
      {
        detached: true,
      }
    )
  }
  exe.on('exit', function (code) {
    //console.log('child exit code (spawn)', code);
    let filename = `${(new Date().toJSON().slice(0, 19))}.log`.replace(/:/g, ";");

    let writer = fs.createWriteStream(path.join(logPath, filename));
    writer.write(fs.readFileSync(path.join(logPath, 'latest.log')));

    fs.writeFileSync(path.join(logPath, 'latest.log'), '');

  })

  exe.stdout.on('data', (data) => {
    logger.log(data.toString().replace(/(\r\n|\n|\r)/gm, ""));
  });


  exe.stderr.on('data', (data) => {
    logger.log(data.toString().replace(/(\r\n|\n|\r)/gm, ""));
    //console.error(data.toString());
  });

};
function getAuthedUsers() {
  if (MAIN_DIRECTORY_PATH) {
    minecraftDIR = MAIN_DIRECTORY_PATH
  } else {
    minecraftDIR = path.join(homedir, 'AppData', 'Roaming', '.minecraft');
  }
  var authFile = JSON.parse(fs.readFileSync(path.join(minecraftDIR, 'portablemc_auth.json')));
  if (authFile.microsoft) {
    var sessions = authFile.microsoft.sessions;
    var loggedProfiles = new Array();
    for (idx in sessions) {
      var obj = {
        email_safe: idx.replace(/(\w{3})[\w.-]+@([\w.]+\w)/, "$1***@$2"),
        email: idx,
        username: sessions[idx].username,
        uuid: sessions[idx].uuid,
      }
      loggedProfiles.push(obj)
    };
    return loggedProfiles;
  } else {
    return authFile;
  }


};

async function authenticate(email) {
  return new Promise(async (resolve) => {
    if (MAIN_DIRECTORY_PATH) {
      minecraftDIR = MAIN_DIRECTORY_PATH
    } else {
      minecraftDIR = path.join(homedir, 'AppData', 'Roaming', '.minecraft');
    }

    if (fs.existsSync(minecraftDIR)) {
      var authFile = path.join(minecraftDIR, 'portablemc_auth.json');
      if (fs.existsSync(authFile)) {
        var authData = JSON.parse(fs.readFileSync(authFile));
        if (authData.microsoft) {
          var loggedUsers = authData.microsoft.sessions;
          if (loggedUsers[email]) {
            var authObj = {
              username: loggedUsers[email].username,
              uuid: loggedUsers[email].uuid,
              email: email.replace(/(\w{3})[\w.-]+@([\w.]+\w)/, "$1***@$2")
            };
            AUTHENTICATED_USER = authObj;
            AUTHENTICATED_USER_EMAIL = email;
            resolve(AUTHENTICATED_USER);
            return;
          };
        }
      };
    };


    const userLoggedIn = await loginBrowser(email);
    var authData = JSON.parse(fs.readFileSync(authFile));
    var loggedUsers = authData.microsoft.sessions;
    if (loggedUsers[email]) {
      var authObj = {
        username: loggedUsers[email].username,
        uuid: loggedUsers[email].uuid,
        email: email.replace(/(\w{3})[\w.-]+@([\w.]+\w)/, "$1***@$2")
      };
      AUTHENTICATED_USER = authObj;
      AUTHENTICATED_USER_EMAIL = email;
      resolve(AUTHENTICATED_USER);
      return;
    };
  })
}

async function loginBrowser(email) {
  return new Promise(async (resolve) => {
    const login = await executeMC(['login', '--auth-service', 'microsoft', email], false);
    resolve(true);
  });
};



async function logout(email) {
  return new Promise(async (resolve) => {
    const logout = await executeMC(['logout', '--auth-service', 'microsoft', email]);
    AUTHENTICATED_USER = {};
    AUTHENTICATED_USER_EMAIL = "";
  })
};

async function startGame(options, logs) {
  return new Promise(async (resolve) => {
    if (options.loader == undefined) {
      const start = await executeMC(['start', options.version, '-l', AUTHENTICATED_USER_EMAIL], logs);
      resolve(true)
    } else {
      const start = await executeMC(['start', options.loader + ":" + options.version, '-l', AUTHENTICATED_USER_EMAIL], logs);
      resolve(true)
    };
  })
};

async function installGame(options, logs) {
  return new Promise(async (resolve) => {
    if (options.loader == undefined) {
      const start = await executeMC(['start', options.version, '--dry'], logs);
      resolve(true)
    } else {
      const start = await executeMC(['start', options.loader + ":" + options.version, '--dry'], logs);
      resolve(true)
    };
  })


};

function startGameDetached(options, logs) {
  if (options.loader == undefined) {
    executeMCDetached(['start', options.version, '-l', AUTHENTICATED_USER_EMAIL], logs);
  } else {
    executeMCDetached(['start', options.loader + ":" + options.version, '-l', AUTHENTICATED_USER_EMAIL], logs);
  };

};

function declareLogFile(path) {
  logPath = path;
};

function getLogPath() {
  return logPath;
}



module.exports = { config, startGame, authenticate, logout, getLogPath, startGameDetached, getAuthedUsers, installGame }