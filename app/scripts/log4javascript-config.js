'use strict';
/* global log4javascript */
var log = log4javascript.getDefaultLogger();
var consoleAppender = new log4javascript.BrowserConsoleAppender();
log.removeAllAppenders();
log.addAppender(consoleAppender);
consoleAppender.setThreshold(log4javascript.Level.DEBUG);
log.setLevel(log4javascript.Level.DEBUG);
log.trace('Document Ready');