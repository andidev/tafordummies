'use strict';
/* global log */
/* global async */
/* exported queueFunction */
/* exported queue */

var asyncQueue = async.queue(function (task, f) {
    setTimeout(function () {
        log.trace(task.name);
        $('#progress-info').text(task.name);
        $('#progress-info').show();
        setTimeout(function () {
            f.apply(task.this, task.arguments);
            $('#progress-info').text('');
            $('#progress-info').hide();
        }, 1);
    }, 1);
}, 1);

function queueFunction(f, name) {
    if (!name) {
        name = 'Loading...';
    }
    return function () {
        asyncQueue.push({
            'this': this,
            'arguments': arguments,
            'name': name
        }, f);
    };
}

function queue(f, name) {
    return queueFunction(f, name)();
}