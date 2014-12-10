'use strict';
/* global numeral */
/* exported numeral */
/* exported formatNumber */
/* exported formatPercent */
/* exported formatPrice */

numeral.language('custom', {
    delimiters: {
        thousands: ' ',
        decimal: ','
    },
    abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
    },
    ordinal: function () {
        return '.';
    },
    currency: {
        symbol: ''
    }
});
numeral.language('custom');

function formatNumber(number) {
    if (number === undefined || number === null || number === '') {
        return '';
    }
    return numeral(number).format('0,0');
}

function formatPercent(number) {
    if (number === undefined || number === null || number === '') {
        return '';
    }
    if (number > 0) {
        return '&nbsp;' + numeral(number).format('0.00%');
    } else {
        return numeral(number).format('0.00%');
    }
}

function formatPrice(number, decimals) {
    if (number === undefined || number === null || number === '') {
        return '';
    }
    if (decimals !== undefined) {
        var zeros = '';
        for (var i = 0; i < decimals; i++) {
            zeros = zeros + '0';
        }
        return numeral(number).format('0,0.' + zeros);
    } else {
        return numeral(number).format('0,0.00');
    }
}