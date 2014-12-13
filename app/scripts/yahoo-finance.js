'use strict';
/* global alert */
/* global log */
/* global moment */
/* jshint newcap: false */

(function () {

    // Constructor
    var yahooFinance = function (symbol) {
        // Ensure to use the `new` operator
        if (!(this instanceof yahooFinance)) {
            return new yahooFinance(symbol);
        }

        // Check the argument
        if (typeof symbol === 'string' || symbol instanceof String) {
            // Save symbol if first argument is a String
            this.symbol = symbol;
        } else {
            // Invalid argument value
            throw 'First argument must be a String containing a yahoo symbol, search for available symbols at http://finance.yahoo.com/lookup';
        }

        return this;
    };

    // make library public
    window.yahooFinance = yahooFinance;

    // create `fn` alias to `prototype` property
    yahooFinance.fn = yahooFinance.prototype = {};

    // Public methods

    /**
     * Get the symbol data from cache if it exists or download it if it's not cached yet
     *
     * @return     {Object} the symbol data
     */
    yahooFinance.fn.getData = function () {
        try {
            var fromDate;
            var toDate;
            var downloadedData;
            if (this.isDataCacheEmpty()) {
                fromDate = moment('1980-01-01', 'YYYY-MM-DD');
                toDate = mostRecentWorkingDay();
                log.debug('Dowloading data from ' + fromDate.format('YYYY-MM-DD') + ' to ' + toDate.format('YYYY-MM-DD'));
                log.time('Downloading data');
                downloadedData = downloadData(this.symbol, fromDate, toDate);
                log.timeEnd('Downloading data');
                log.trace('Saving data to cache', downloadedData);
                this.setDataCache(downloadedData);
                log.trace('Data saved to cache', dataCacheKeyNameSpace + this.symbol + '.data', this.getDataCache());
                return this.getDataCache();
            } else if (this.isDataCacheOutOfDate()) {
                if (this.isDataCacheCheckThrotteled()) {
                    log.debug('Dowloading data not needed (throtteled), using data found in cache');
                    return this.getDataCache();
                }
                fromDate = moment(this.getDataCache()[0].date).add(1, 'day');
                toDate = mostRecentWorkingDay();
                log.debug('Dowloading outdated data from ' + fromDate.format('YYYY-MM-DD') + ' to ' + toDate.format('YYYY-MM-DD'));
                log.time('Downloading data');
                downloadedData = downloadData(this.symbol, fromDate, toDate);
                log.timeEnd('Downloading data');
                if (downloadedData.length > 0) {
                    log.trace('Updating chached data', downloadedData);
                    this.appendDataCache(downloadedData);
                    log.trace('Data saved to cache', dataCacheKeyNameSpace + this.symbol + '.data', this.getDataCache());
                }
                return this.getDataCache();
            } else {
                log.debug('Dowloading data not needed, using data found in cache');
                return this.getDataCache();
            }
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                log.error('Failed to save data to since maximum storage capacity was exceeded!');
                log.error('Clearing data cache for symbol = ' + this.symbol);
                this.clearSymbolDataCache();
            } else {
                log.error('Something went wrong. Clearing data cache for safety');
                alert('Something went wrong. Clearing data cache for safety');
                log.error('Error = ', e);
                this.clearDataCache();
            }
            throw e;
        }
    };

    /**
     * Get the cached symbol data in localStorage
     */
    yahooFinance.fn.getDataCache = function () {
        var dataCache = localStorage.getItem(dataCacheKeyNameSpace + this.symbol + '.data');
        if (dataCache !== undefined || dataCache !== null) {
            return JSON.parse(dataCache);
        } else {
            return null;
        }
    };

    /**
     * Set the cached symbol data in localStorage
     *
     * @param      {Object}   data
     */
    yahooFinance.fn.setDataCache = function (data) {
        localStorage.setItem(dataCacheKeyNameSpace + this.symbol + '.data', JSON.stringify(data));
    };

    /**
     * Append data to the cached symbol data in localStorage
     *
     * @param      {Object}   data to append
     */
    yahooFinance.fn.appendDataCache = function (data) {
        Array.prototype.push.apply(data, this.getDataCache());
        this.setDataCache(data);
    };

    /**
     * Clear the currently cached data from localStorage
     * @return     {yahooFinance} returns the yahooFinance object
     */
    yahooFinance.fn.clearDataCache = function () {
        localStorage.clear();
        return this;
    };

    /**
     * Clear the currently cached symbol data from localStorage
     * @return     {yahooFinance} returns the yahooFinance object
     */
    yahooFinance.fn.clearSymbolDataCache = function () {
        localStorage.removeItem(dataCacheKeyNameSpace + this.symbol + '.data');
        localStorage.removeItem(dataCacheKeyNameSpace + this.symbol + '.lastDataCacheCheckDate');
        return this;
    };

    /**
     * Check if cached symbol data in localStorage does not exist
     *
     * @return     {boolean} true if the data cache is empty
     */
    yahooFinance.fn.isDataCacheEmpty = function () {
        log.trace('Is data cache empty?');
        if (this.getDataCache() === null) {
            log.trace('Yes', dataCacheKeyNameSpace + this.symbol + '.data', this.getDataCache());
            return true;
        } else {
            log.trace('No');
            return false;
        }
    };

    /**
     * Check if cached symbol data in localStorage needs to be updated
     *
     * @return     {boolean} true if the data cache needs to be updated
     */
    yahooFinance.fn.isDataCacheOutOfDate = function () {
        log.trace('Is data cache out of date?');
        var lastDataCacheDate = moment(this.getDataCache()[0].date);
        if (lastDataCacheDate.isBefore(mostRecentWorkingDay())) {
            log.trace('Yes', dataCacheKeyNameSpace + this.symbol + '.data', this.getDataCache());
            return true;
        } else {
            log.trace('No', dataCacheKeyNameSpace + this.symbol + '.data', this.getDataCache());
            return false;
        }
    };

    /**
     * Check if the data cache check is throttled
     *
     * @return     {boolean} true if the data cache check is throttled
     */
    yahooFinance.fn.isDataCacheCheckThrotteled = function () {
        log.trace('Is data cache check throtteled?');
        var lastDataCacheCheckDate = localStorage.getItem(dataCacheKeyNameSpace + this.symbol + '.lastDataCacheCheckDate');
        if (lastDataCacheCheckDate === null || lastDataCacheCheckDate === undefined || moment(lastDataCacheCheckDate).isBefore(moment().subtract(1, 'hours'))) {
            log.trace('No', lastDataCacheCheckDate);
            localStorage.setItem(dataCacheKeyNameSpace + this.symbol + '.lastDataCacheCheckDate', moment().toISOString());
            return false;
        } else {
            log.trace('Yes', lastDataCacheCheckDate);
            return true;
        }
    };

    // Private methods
    var dataCacheKeyNameSpace = 'yahooFinance.';

    var mostRecentWorkingDay = function () {
        var currentDate = moment().startOf('day');
        if (currentDate.isoWeekday() === 7) {
            currentDate.subtract(2, 'days');
        } else if (currentDate.isoWeekday() === 6) {
            currentDate.subtract(1, 'days');
        }
        return currentDate;
    };

    function downloadData(symbol, fromDate, toDate) {

        function parseYear(date) {
            return date.format('YYYY');
        }
        function parseMonth(date) {
            return parseInt(date.format('MM')) - 1;
        }
        function parseDay(date) {
            return date.format('DD');
        }

        log.debug('Getting historical prices from yahoo finance for symbol ' + symbol + ' between date ' + fromDate.format('YYYY-MM-DD') + ' to ' + toDate.format('YYYY-MM-DD'));
        var columns = '*';
        var url = 'http://ichart.finance.yahoo.com/table.csv?' + $.param({
            s: symbol,
            a: parseMonth(fromDate),
            b: parseDay(fromDate),
            c: parseYear(fromDate),
            d: parseMonth(toDate),
            e: parseDay(toDate),
            f: parseYear(toDate),
            g: 'd',
            ignore: '.cvs'
        });
        var columnAliases = 'date,open,high,low,close,volume,adjclose';
        var query = 'select ' + columns + ' from csv where url="' + url + '" and columns="' + columnAliases + '"';

        var returnData = [];
        $.ajax('http://query.yahooapis.com/v1/public/yql', {
            data: {
                q: query,
                ignore: '.cvs',
                format: 'json',
                diagnostics: true
            },
            async: false,
            dataType: 'json',
            crossDomain: true
        }).done(function (data) {
            if (data.query.results !== null && data.query.results.row !== undefined) {
                if (data.query.results.row.length > 1) {
                    data.query.results.row.shift(); // remove descriptions
                    var from = data.query.results.row[data.query.results.row.length - 1];
                    var to = data.query.results.row[0];
                    log.debug('Historical prices between date ' + from.date + ' to ' + to.date + ' (' + from.close + ' to ' + to.close + ') received', data.query.results.row);
                    returnData = data.query.results.row;
                    if (data.query.diagnostics.warning === 'You have reached the maximum number of items which can be returned in a request') {
                        log.debug('Was not able to receive all data in call, trying again');
                        var recursiveToDate = moment(from.date).subtract(1, 'days');
                        Array.prototype.push.apply(returnData, downloadData(symbol, fromDate, recursiveToDate));
                    }
                }
            }

            if (data.query.diagnostics.csv !== undefined) {
                log.warn('diagnostics.cvs = ' + data.query.diagnostics.csv, data);
            }
            if (data.query.diagnostics.warning !== undefined) {
                if (data.query.diagnostics.warning !== 'You have reached the maximum number of items which can be returned in a request') {
                    log.warn('diagnostics.warning = ' + data.query.diagnostics.warning, data);
                    alert('diagnostics.warning = ' + data.query.diagnostics.warning);
                }
            }
        }).fail(function () {
            alert('Error downloading data');
        }).always(function () {

        });

        return returnData;
    }

})();
