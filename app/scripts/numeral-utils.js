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
    ordinal : function (number) {
        return '.';
    },
    currency: {
        symbol: ''
    }
});
numeral.language('custom');


function formatPercent(number) {
    if (number === undefined || number === null || number === "") {
        return "";
    }
    if (number > 0) {
        return "&nbsp;" + numeral(number).format("0.00%");
    } else {
        return numeral(number).format("0.00%");
    }
}

function formatPrice(number) {
    if (number === undefined || number === null || number === "") {
        return "";
    }
    return numeral(number).format("0,0.00");
}