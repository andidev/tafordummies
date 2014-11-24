'use strict';
/* global moment */
/* exported formatDate */
/* exported formatLongDate */

function formatDate(date){
    if (date === undefined || date === null || date === '') {
        return '';
    }
    if (date < moment().startOf('year')) {
        return date.format('D MMM YYYY');
    } else if (date < moment().startOf('month')) {
        return date.format('D MMM');
    } else if (date < moment().subtract(1, 'weeks').startOf('week')) {
        return date.format('D MMM');
    } else if (date < moment().startOf('week')) {
        return date.format('[Last] dddd');
    } else if (date < moment().subtract(1, 'days').startOf('day')) {
        return date.format('dddd');
    } else if (date < moment().startOf('day')) {
        return 'Yesterday';
    } else if (date < moment().add(1, 'days').startOf('day')) {
        return 'Today';
    } else {
        return date.format('D MMM YYYY');
    }
}

function formatLongDate(date){
    if (date === undefined || date === null || date === '') {
        return '';
    }
    return date.format('ddd D MMM YYYY');
}