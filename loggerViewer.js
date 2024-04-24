let fs = require('fs');
const path = require('path');
var logPath = path.join(__dirname, 'logs');

process.stdout.write('\x1Bc')
console.log(fs.readFileSync(path.join(logPath, 'latest.log')).toString())
var currentLog = fs.readFileSync(path.join(logPath, 'latest.log')).toString();
var blankLock = true;
setInterval(function () {
    const log = fs.readFileSync(path.join(logPath, 'latest.log')).toString();
    if (log == "" && !blankLock) {
        process.exit();
    };
    var diff = findDiff(currentLog, log).split("\n");

    if (diff.length > 1) {
        var filtered = diff.filter(str => /\w+/.test(str))
        for (idx in filtered) {
            console.log(filtered[idx])
        }
        currentLog = log;
        blankLock = false;
    }
}, 100);


function findDiff(str1, str2) {
    let diff = "";
    str2.split('').forEach(function (val, i) {
        if (val != str1.charAt(i))
            diff += val;
    });
    return diff;
}