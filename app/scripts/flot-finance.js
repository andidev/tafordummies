'use strict';
/* global log */
/* global moment */
/* global TA */
/* global yahooFinance */
/* jshint newcap: false */

(function () {

    // Constructor
    var flotFinance = function (symbol) {
        // Ensure to use the `new` operator
        if (!(this instanceof flotFinance)) {
            return new flotFinance(symbol);
        }

        // Check the argument
        if (typeof symbol === 'string' || symbol instanceof String) {
            // Save symbol if first argument is a String
            this.symbol = symbol;
            this.yahooFinanceData = yahooFinance(symbol).getData();
        } else {
            // Invalid argument value
            throw 'First argument must be a String containing a yahoo symbol, search for available symbols at http://finance.yahoo.com/lookup';
        }

        return this;
    };

    // make library public
    window.flotFinance = flotFinance;

    // create `fn` alias to `prototype` property
    flotFinance.fn = flotFinance.prototype = {};

    // Cache method calls implementation
    function cached(f) {
        var cache = {};
        return function () {
            var key = this.symbol + JSON.stringify(Array.prototype.slice.call(arguments));
            if (key in cache) {
                log.trace('Loading from cache "' + key + '"', cache[key], cache);
                return cache[key];
            } else {
                var data = f.apply(this, arguments);
                log.trace('Saving to cache "' + key + '"', data, cache);
                cache[key] = data;
                return data;
            }
        };
    }

    // Public methods
    /**
     * Get the dates
     *
     * @return     {Array} the dates
     */
    flotFinance.fn.getDate = cached(function (scale) {
        return this.getData(scale).date;
    });

    /**
     * Get the close price
     *
     * @return     {Array} the close price
     */
    flotFinance.fn.getClosePrice = cached(function (scale, splitDetection) {
        var close = this.getData(scale).close;
        if (splitDetection) {
            close = adjustSplits(close);
        }
        return close;
    });

    /**
     * Get the adjusted close price
     *
     * @return     {Array} the adjusted close price
     */
    flotFinance.fn.getAdjClosePrice = cached(function (scale, splitDetection) {
        var adjclose = this.getData(scale).adjclose;
        if (splitDetection) {
            adjclose = adjustSplits(adjclose);
        }
        return adjclose;
    });

    /**
     * Get the volume
     *
     * @return     {Array} the volume
     */
    flotFinance.fn.getVolume = cached(function (scale, splitDetection) {
        var volume = this.getData(scale).volume;
        if (splitDetection) {
            var adjclose = this.getData(scale).adjclose;
            volume = adjustSplitsVolume(adjclose, volume);
        }
        return volume;
    });

    /**
     * Check if volume data exists
     *
     * @return     {boolean} true if volume data exists
     */
    flotFinance.fn.hasVolume = cached(function () {
        var firstVolume = this.yahooFinanceData[0].volume;
        var lastVolume = this.yahooFinanceData[this.yahooFinanceData.length - 1].volume;
        if (firstVolume === '000' && lastVolume === '000') {
            return false;
        } else {
            return true;
        }
    });

    /**
     * Get the RSI curve
     *
     * @return     {Array} the RSI curve
     */
    flotFinance.fn.getRsi = cached(function (n, scale, splitDetection) {
        var priceTA = this.getPriceTA(scale, splitDetection);
        var data = convertToFlotFormat(priceTA.rsi(n, false).asArray());
        return data;
    });

    /**
     * Get the Simple Moving Avarage
     *
     * @return     {Array} the Simple Moving Avarage
     */
    flotFinance.fn.getSmaPrice = cached(function (n, scale, splitDetection) {
        var priceTA = this.getPriceTA(scale, splitDetection);
        var data = convertToFlotFormat(priceTA.sma(n).asArray());
        return data;
    });

    /**
     * Get the Simple Moving Avarage
     *
     * @return     {Array} the Simple Moving Avarage
     */
    flotFinance.fn.getEmaPrice = cached(function (n, scale, splitDetection) {
        var priceTA = this.getPriceTA(scale, splitDetection);
        var data = convertToFlotFormat(priceTA.ema(n).asArray());
        return data;
    });

    /**
     * Get the MACD curve
     *
     * @return     {Array} the MACD curve
     */
    flotFinance.fn.getMacd = cached(function (nSlow, nFast, nSignal, scale, splitDetection) {
        var macdTA = this.getMacdTA(nSlow, nFast, nSignal, scale, splitDetection);
        var data = convertToFlotFormat(macdTA.macd.asArray());
        return data;
    });

    /**
     * Get the MACD signal
     *
     * @return     {Array} the MACD signal
     */
    flotFinance.fn.getMacdSignal = cached(function (nSlow, nFast, nSignal, scale, splitDetection) {
        var macdTA = this.getMacdTA(nSlow, nFast, nSignal, scale, splitDetection);
        var data = convertToFlotFormat(macdTA.signal.asArray());
        return data;
    });

    /**
     * Get the MACD divergence
     *
     * @return     {Array} the MACD curve
     */
    flotFinance.fn.getMacdDivergence = cached(function (nSlow, nFast, nSignal, scale, splitDetection) {
        var macdTA = this.getMacdTA(nSlow, nFast, nSignal, scale, splitDetection);
        var data = convertToFlotFormat(macdTA.divergence.asArray());
        return data;
    });


    /**
     * Get (convert, parse and scale) the Yahoo Finance data
     *
     * @param {String} scale
     *
     * @returns {Array}
     */
    flotFinance.fn.getData = cached(function (scale) {
        log.trace('Getting (converting, parsing and scaling) Yahoo Finance data');
        var self = this;
        var data = {
            date: {},  // Store date as a bimap
            open: [],
            high: [],
            low: [],
            close: [],
            adjclose: [],
            volume: []
        };
        var value;
        var previousValue;
        var previousDate;
        var lastValue;
        var lastDate;
        var index = 0;
        var lastIndex;
        var i;
        switch (scale) {
            case undefined:
            case 'days':
                for (i = this.yahooFinanceData.length - 1; i >= 0; i--) {
                    value = this.yahooFinanceData[i];
                    // Remove holidays which are stored with no volume
                    if (self.hasVolume() && value.volume === '000') {
                        continue;
                    }
                    data.date[index] = moment(value.date); // Store index to date entry
                    data.date[moment(value.date).format('YYYYMMDD')] = index; // Store date to index entry
                    data.open[index] = [index, parseFloat(value.open)];
                    data.high[index] = [index, parseFloat(value.high)];
                    data.low[index] = [index, parseFloat(value.low)];
                    data.close[index] = [index, parseFloat(value.close)];
                    data.adjclose[index] = [index, parseFloat(value.adjclose)];
                    data.volume[index] = [index, parseFloat(value.volume)];
                    index++;
                }
                data.date.length = index;
                return data;
            case 'weeks':
                var week;
                var previousWeek = null;
                for (i = this.yahooFinanceData.length - 2; i >= 0; i--) {
                    value = this.yahooFinanceData[i];
                    // Remove holidays which are stored with no volume
                    if (self.hasVolume() && value.volume === '000') {
                        continue;
                    }
                    previousValue = this.yahooFinanceData[i + 1];
                    previousDate = moment(previousValue.date);
                    if (previousWeek === null) {
                        previousWeek = previousDate.week();
                    }
                    week = moment(value.date).week();
                    if (week !== previousWeek) {
                        data.date[index] = previousDate; // Store index to date entry
                        data.date[previousDate.format('YYYYMMDD')] = index; // Store date to index entry
                        data.open[index] = [index, parseFloat(previousValue.open)];
                        data.high[index] = [index, parseFloat(previousValue.high)];
                        data.low[index] = [index, parseFloat(previousValue.low)];
                        data.close[index] = [index, parseFloat(previousValue.close)];
                        data.adjclose[index] = [index, parseFloat(previousValue.adjclose)];
                        data.volume[index] = [index, (data.volume[index] ? data.volume[index][1] : 0) + parseFloat(previousValue.volume)];
                        previousWeek = week;
                        index++;
                    } else {
                        data.volume[index] = [index, (data.volume[index] ? data.volume[index][1] : 0) + parseFloat(previousValue.volume)];
                        lastIndex = i;
                    }
                }
                lastValue = this.yahooFinanceData[lastIndex];
                lastDate = moment(lastValue.date);
                data.date[index] = lastDate; // Store index to date entry
                data.date[lastDate.format('YYYYMMDD')] = index; // Store date to index entry
                data.open[index] = [index, parseFloat(lastValue.open)];
                data.high[index] = [index, parseFloat(lastValue.high)];
                data.low[index] = [index, parseFloat(lastValue.low)];
                data.close[index] = [index, parseFloat(lastValue.close)];
                data.adjclose[index] = [index, parseFloat(lastValue.adjclose)];
                // Skip volume since its already added
                index++;
                data.date.length = index;
                return data;
            case 'months':
                var month;
                var previousMonth = null;
                for (i = this.yahooFinanceData.length - 2; i >= 0; i--) {
                    value = this.yahooFinanceData[i];
                    // Remove holidays which are stored with no volume
                    if (self.hasVolume() && value.volume === '000') {
                        continue;
                    }
                    previousValue = this.yahooFinanceData[i + 1];
                    previousDate = moment(previousValue.date);
                    if (previousMonth === null) {
                        previousMonth = previousDate.month();
                    }
                    month = moment(value.date).month();
                    if (month !== previousMonth) {
                        data.date[index] = previousDate; // Store index to date entry
                        data.date[previousDate.format('YYYYMMDD')] = index; // Store date to index entry
                        data.open[index] = [index, parseFloat(previousValue.open)];
                        data.high[index] = [index, parseFloat(previousValue.high)];
                        data.low[index] = [index, parseFloat(previousValue.low)];
                        data.close[index] = [index, parseFloat(previousValue.close)];
                        data.adjclose[index] = [index, parseFloat(previousValue.adjclose)];
                        data.volume[index] = [index, (data.volume[index] ? data.volume[index][1] : 0) + parseFloat(previousValue.volume)];
                        previousMonth = month;
                        index++;
                    } else {
                        data.volume[index] = [index, (data.volume[index] ? data.volume[index][1] : 0) + parseFloat(previousValue.volume)];
                        lastIndex = i;
                    }
                }
                lastValue = this.yahooFinanceData[lastIndex];
                lastDate = moment(lastValue.date);
                data.date[index] = lastDate; // Store index to date entry
                data.date[lastDate.format('YYYYMMDD')] = index; // Store date to index entry
                data.open[index] = [index, parseFloat(lastValue.open)];
                data.high[index] = [index, parseFloat(lastValue.high)];
                data.low[index] = [index, parseFloat(lastValue.low)];
                data.close[index] = [index, parseFloat(lastValue.close)];
                data.adjclose[index] = [index, parseFloat(lastValue.adjclose)];
                // Skip volume since its already added
                index++;
                data.date.length = index;
                return data;
            case 'years':
                var year;
                var previousYear = null;
                for (i = this.yahooFinanceData.length - 2; i >= 0; i--) {
                    value = this.yahooFinanceData[i];
                    // Remove holidays which are stored with no volume
                    if (self.hasVolume() && value.volume === '000') {
                        continue;
                    }
                    previousValue = this.yahooFinanceData[i + 1];
                    previousDate = moment(previousValue.date);
                    if (previousYear === null) {
                        previousYear = previousDate.year();
                    }
                    year = moment(value.date).year();
                    if (year !== previousYear) {
                        data.date[index] = previousDate; // Store index to date entry
                        data.date[previousDate.format('YYYYMMDD')] = index; // Store date to index entry
                        data.open[index] = [index, parseFloat(previousValue.open)];
                        data.high[index] = [index, parseFloat(previousValue.high)];
                        data.low[index] = [index, parseFloat(previousValue.low)];
                        data.close[index] = [index, parseFloat(previousValue.close)];
                        data.adjclose[index] = [index, parseFloat(previousValue.adjclose)];
                        data.volume[index] = [index, (data.volume[index] ? data.volume[index][1] : 0) + parseFloat(previousValue.volume)];
                        previousYear = year;
                        index++;
                    } else {
                        data.volume[index] = [index, (data.volume[index] ? data.volume[index][1] : 0) + parseFloat(previousValue.volume)];
                        lastIndex = i;
                    }
                }
                lastValue = this.yahooFinanceData[lastIndex];
                lastDate = moment(lastValue.date);
                data.date[index] = lastDate; // Store index to date entry
                data.date[lastDate.format('YYYYMMDD')] = index; // Store date to index entry
                data.open[index] = [index, parseFloat(lastValue.open)];
                data.high[index] = [index, parseFloat(lastValue.high)];
                data.low[index] = [index, parseFloat(lastValue.low)];
                data.close[index] = [index, parseFloat(lastValue.close)];
                data.adjclose[index] = [index, parseFloat(lastValue.adjclose)];
                // Skip volume since its already added
                index++;
                data.date.length = index;
                return data;
        }
    });

    /**
     * Get the Price TA Object
     *
     * @return     {Array} the MACD curve
     */
    flotFinance.fn.getPriceTA = cached(function (scale, splitDetection) {
        var adjclose = this.getAdjClosePrice(scale, splitDetection);
        var priceTA = TA(convertToTaFormat(adjclose));
        return priceTA;
    });

    /**
     * Get the MACD TA Object
     *
     * @return     {Array} the MACD curve
     */
    flotFinance.fn.getMacdTA = cached(function (nFast, nSlow, nSignal, scale, splitDetection) {
        var priceTA = this.getPriceTA(scale, splitDetection);
        var macdTA = priceTA.macd(nFast, nSlow, nSignal);
        return macdTA;
    });

    flotFinance.fn.isCloseEqualToAdjClose = function () {
        var close = this.getAdjClosePrice();
        var adjclose = this.getAdjClosePrice();
        for (var i = 0; i < close.length; i++) {
            if (close[i][1] !== adjclose[i][1]) {
                log.info('Close is not equal to Adjusted Close');
                log.info('close[' + i + '][1] = ', close[i][1]);
                log.info('adjclose[' + i + '][1] = ', adjclose[i][1]);
                return false;
            }
        }
        return true;
    };

    var adjustSplits = function (data) {
        log.trace('Adjusting splits to data', data);
        var splitData = [];
        splitData[data.length - 1] = [data[data.length - 1][0], data[data.length - 1][1]];
        var previousPrice = data[data.length - 1][1];
        var previousIndex = data[data.length - 1][0];
        var adjustFactor = 1;
        for (var i = data.length - 2; i >= 0; i--) {
            if (Math.round(data[i][1] / previousPrice) >= 2) {
                log.info('Split found and adjusted between ' + data[i][0] + ' (' + data[i][1] + ') to ' + previousIndex + ' (' + previousPrice + ')');
                adjustFactor = adjustFactor / Math.round(data[i][1] / previousPrice);
            }
            previousPrice = data[i][1];
            previousIndex = data[i][0];
            if (adjustFactor !== 1) {
                splitData[i] = [data[i][0], data[i][1] * adjustFactor];
            } else {
                splitData[i] = [data[i][0], data[i][1]];
            }
        }
        return splitData;
    };

    var adjustSplitsVolume = function (data, volume) {
        log.trace('Adjusting splits to data', data);
        var splitVolume = [];
        splitVolume[volume.length - 1] = [volume[volume.length - 1][0], volume[volume.length - 1][1]];
        var previousPrice = data[data.length - 1][1];
        var previousIndex = data[data.length - 1][0];
        var adjustFactor = 1;
        for (var i = data.length - 2; i >= 0; i--) {
            if (Math.round(data[i][1] / previousPrice) >= 2) {
                log.info('Split found and adjusted between ' + data[i][0] + ' (' + data[i][1] + ') to ' + previousIndex + ' (' + previousPrice + ')');
                adjustFactor = adjustFactor / Math.round(data[i][1] / previousPrice);
            }
            previousPrice = data[i][1];
            previousIndex = data[i][0];
            if (adjustFactor !== 1) {
                splitVolume[i] = [volume[i][0], volume[i][1] * adjustFactor];
            } else {
                splitVolume[i] = [volume[i][0], volume[i][1]];
            }
        }
        return splitVolume;
    };

    var convertToFlotFormat = function (arg1) {
        // Array passed as arg1 and price in Flot format as arg2
        log.trace('Converting array to Flot format');
        return $.map(arg1, function (value, index) {
            return [[index, value]];
        });
    };

    var convertToTaFormat = function (data) {
        return $.map(data, function (value) {
            return value[1];
        });
    };

})();
