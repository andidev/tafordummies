'use strict';
/* global log */
/* global moment */
/* exported async */
/* exported defaultValue */
/* exported defaultBooleanValue */
/* exported defaultNumberValue */
/* exported defaultDate */
/* exported faArrowClass */
/* exported textColorClass */
/* exported getLinks */

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
        if (data === 'true' || data === true) {
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

function defaultDate(defaultVal, data) {
    if (data === undefined) {
        if (defaultVal !== null) {
            return moment(defaultVal);
        } else {
            return null;
        }
    } else {
        return moment(data);
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

function faArrowClass(number) {
    if (number > 0) {
        return 'fa-arrow-up';
    } else if (number < 0) {
        return 'fa-arrow-down';
    } else {
        return 'fa-arrow-right';
    }
}

function textColorClass(number) {
    if (number > 0) {
        return 'text-success';
    } else if (number < 0) {
        return 'text-danger';
    } else {
        return '';
    }
}

function getLinks(id, symbols) {
    for (var i = 0; i < symbols.length; i++) {
        if (symbols[i].id === id) {
            return symbols[i].links;
        }
    }
    return [];
}
