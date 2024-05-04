# PortableMC_NPM

This module aims to convert the excellent work by [mindstorm38](https://github.com/mindstorm38) into an NPM module in order to be used in many NodeJS based projects. 

## Installation
Install the package using npm
```
npm install portablemc
```
This package also requires that [portablemc](https://github.com/mindstorm38/portablemc) is installed on the system. You can either follow the instructions on portablemc's github page or you can use the batch file (installPortableMC.bat) to install both python and the application.

## Getting Started

### .config(options)
This function tells the package where the application is located and where to store the log files.
By default it will look for the application at its default install directory. You can declare an alternative path by doing the following.
``` js
portablemc.config({
    EXE_LOCATION: PATH_TO_EXE
    LOG_LOCATION: PATH_TO_LOG
});
```
You can also declare the location of the logs which defaults to the package directory.

### .authenticate(email)
This function determines which user is used to boot into the minecraft instance. It can be used both standalone and asynchronously which will return a result (seen below) 
``` js
portablemc.authenticate(EMAIL);
//or
const authenticatedUser = await portablemc.authenticate(EMAIL);
/*
Returns:
{
  username: 'USERNAME',
  uuid: 'UUID',
  email: 'EMAIL (Obsfucated)'
}
*/
```
Once this function is run it stores the user and will use it to launch later sessions.

### .startGame(options,log)
This is the main function and launches the mc instance with the paremeters provide:
``` json
options // 
{
    version:'MC VERSION' REQUIRED (exact number or release / snapshot)
    loader: 'LOADER' DEFAULTS to vanilla
}
```

