'use strict';

const DEBUG = 0;
const INFO = 1;
const WARN = 2;
const ERROR = 3;
const EMERGENCE = 3;

let colors = require('colors');
const fs = require('fs');
const moment = require('moment');

let themes = {
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red',
    emergence: 'red',
};
colors.setTheme(themes);

function Logger() {

}

Logger.levels = {
    DEBUG: DEBUG, INFO: INFO, WARN: WARN, ERROR: ERROR, EMERGENCE: EMERGENCE,
};

Logger.level = process.env.LOG_LEVEL || 'debug';

Logger.write = function (line, level = 'info', write = true) {
    console.log(colors[level](line));
    if (Logger.levels[level.toUpperCase()] < Logger.levels[Logger.level.toUpperCase()]) {
        return;
    }
    let file = './logs/' + moment().format('YYYY-MM-DD') + '.log';
    write && fs.appendFile(file, Logger.formatLine(line, level), function (err) {
        if (err) {
            console.log(colors.red(`Write log failed file [${file}]`));
        }
    });
};

Logger.formatLine = function (line, level) {
    let time = moment().format('YYYY-MM-DD HH:mm:ss');
    return `[${time}][${level}] ${line} \n`;
};

Logger.info = function (line, write = true) {
    Logger.write(line, 'info', write);
};
Logger.debug = function (line, write = true) {
    Logger.write(line, 'debug', write);
};
Logger.warn = function (line, write = true) {
    Logger.write(line, 'warn', write);
};
Logger.error = function (line, write = true) {
    Logger.write(line, 'error', write);
};
Logger.emergence = function (line, write = true) {
    Logger.write(line, 'emergence', write);
};


module.exports = Logger;
