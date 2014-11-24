'use strict';
 /* exported defaultValue */
 /* exported defaultBooleanValue */
 /* exported defaultNumberValue */
 
function defaultValue(defaultVal, data) {
    if (data === undefined) {
        return defaultVal;
    } else {
        return data;
    }
}

function defaultBooleanValue(defaultVal, data) {
    if (data === undefined) {
        return defaultVal;
    } else {
        if (data === 'true') {
            return true;
        }
        return false;
    }
}

function defaultNumberValue(defaultVal, data) {
    if (data === undefined) {
        return defaultVal;
    } else {
        return parseInt(data);
    }
}