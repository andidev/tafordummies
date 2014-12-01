'use strict';
 /* global log */
 /* exported async */
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

function async(f) {
    return function () {
        log.trace('Loading...');
        $('#progress-info').show();
        var self = this;
        var selfarguments = arguments;
        setTimeout(function () {
            try {
                f.apply(self, selfarguments);
                log.trace('Loading done!');
                $('#progress-info').fadeOut('slow');
            } catch (e) {
                $('#progress-info').fadeOut('slow');
                throw e;
            }
        }, 1);
    };
}