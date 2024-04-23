
const fs = require('fs');
const path = require('path');

var portableMCLocation = path.join(__dirname, 'portablemc.exe');

console.log(portableMCLocation)

async function executeMC(params,detached) {
  detached = detached || true;

  const { spawn } = require('node:child_process');
  const exe = spawn('cmd.exe', ['/C', portableMCLocation, ...params],
    {
      detached: detached,
      stdio: 'pipe'
    }
  )
  exe.on('exit',function(code){
    console.log('child exit code (spawn)', code);
  })

  exe.stdout.on('data', (data) => {
    console.log(data.toString());
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

async function startGame(email,version,loader) {
  if (!version) {
    version = 'release'
  };

  if (!loader) {
    const start = await executeMC(['start',version,'-l',email]);
  } else {
    const start = await executeMC(['start',loader+":"+version,'-l',email]);
  }
 
}


module.exports = startGame,loginBrowser,logout