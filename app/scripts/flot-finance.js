'use strict';
/* global log */
/* global moment */
/* global TA */
/* global yahooFinance */
/* jshint newcap: false */

(function () {

    // Constructor
    var flotFinance = function (symbol, callback) {
        // Ensure to use the `new` operator
        if (!(this instanceof flotFinance)) {
            return new flotFinance(symbol, callback);
        }

        // Check the argument
        if (typeof symbol === 'string' || symbol instanceof String) {
            // Save symbol if first argument is a String
            this.symbol = symbol;
            this.yahooFinanceData = null;
            self = this;
            yahooFinance(symbol).getData(function(data){
                self.yahooFinanceData = data;
                callback(self);
            });
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
                log.trace('Loading from cache ' + key, cache[key], cache);
                return cache[key];
            } else {
                var data = f.apply(this, arguments);
                log.trace('Saving to cache ' + key, data, cache);
                cache[key] = data;
                return data;
            }
        };
    }

    // Public methods
    /**
     * Get the close price
     *
     * @return     {Array} the close price
     */
    flotFinance.fn.getClosePrice = cached(function (scale, splitDetection) {
        var close = this.convertYahooFinanceToFlotFormat('close');
        if (splitDetection) {
            close = adjustSplits(close);
        }
        return scaleTo(scale, close);
    });

    /**
     * Get the adjusted close price
     *
     * @return     {Array} the adjusted close price
     */
    flotFinance.fn.getAdjClosePrice = cached(function (scale, splitDetection) {
        var close = this.convertYahooFinanceToFlotFormat('adjclose');
        if (splitDetection) {
            close = adjustSplits(close);
        }
        return scaleTo(scale, close);
    });

    /**
     * Get the volume
     *
     * @return     {Array} the volume
     */
    flotFinance.fn.getVolume = cached(function (scale, splitDetection) {
        var volume = this.convertYahooFinanceToFlotFormat('volume');
        if (splitDetection) {
            volume = adjustSplits(volume);
        }
        return scaleTo(scale, volume, true);
    });

    /**
     * Check if volume data exists
     *
     * @return     {boolean} true if volume data exists
     */
    flotFinance.fn.hasVolume = cached(function () {
        var firstVolume = this.yahooFinanceData[0].volume;
        var lastVolume = this.yahooFinanceData[this.yahooFinanceData.length-1].volume;
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
        var data = this.getClosePrice(scale, splitDetection);
        var priceTA = this.getPriceTA(scale, splitDetection);
        data = convertToFlotFormat(priceTA.rsi(n).asArray(), data);
        return data;
    });

    /**
     * Get the Simple Moving Avarage
     *
     * @return     {Array} the Simple Moving Avarage
     */
    flotFinance.fn.getSmaPrice = cached(function (n, scale, splitDetection) {
        var data = this.getClosePrice(scale, splitDetection);
        var priceTA = this.getPriceTA(scale, splitDetection);
        data = convertToFlotFormat(priceTA.sma(n).asArray(), data);
        return data;
    });

    /**
     * Get the Simple Moving Avarage
     *
     * @return     {Array} the Simple Moving Avarage
     */
    flotFinance.fn.getEmaPrice = cached(function (n, scale, splitDetection) {
        var data = this.getClosePrice(scale, splitDetection);
        var priceTA = this.getPriceTA(scale, splitDetection);
        data = convertToFlotFormat(priceTA.ema(n).asArray(), data);
        return data;
    });

    /**
     * Get the MACD curve
     *
     * @return     {Array} the MACD curve
     */
    flotFinance.fn.getMacd = cached(function (nSlow, nFast, nSignal, scale, splitDetection) {
        var data = this.getClosePrice(scale, splitDetection);
        var macdTA = this.getMacdTA(nSlow, nFast, nSignal, scale, splitDetection);
        data = convertToFlotFormat(macdTA.macd.asArray(), data);
        return data;
    });

    /**
     * Get the MACD signal
     *
     * @return     {Array} the MACD signal
     */
    flotFinance.fn.getMacdSignal = cached(function (nSlow, nFast, nSignal, scale, splitDetection) {
        var data = this.getClosePrice(scale, splitDetection);
        var macdTA = this.getMacdTA(nSlow, nFast, nSignal, scale, splitDetection);
        data = convertToFlotFormat(macdTA.signal.asArray(), data);
        return data;
    });

    /**
     * Get the MACD histogram
     *
     * @return     {Array} the MACD curve
     */
    flotFinance.fn.getMacdHistogram = cached(function (nSlow, nFast, nSignal, scale, splitDetection) {
        var data = this.getClosePrice(scale, splitDetection);
        var macdTA = this.getMacdTA(nSlow, nFast, nSignal, scale, splitDetection);
        data = convertToFlotFormat(macdTA.histogram.asArray(), data);
        return data;
    });

    /**
     * Convert Yahoo Finance format to Flot format
     *
     * @param {type} column to use (available columns open, high, low, close, volume, adjclose)
     *
     * @returns {Array}
     */
    flotFinance.fn.convertYahooFinanceToFlotFormat = cached(function (column) {
        log.trace('Converting Yahoo Finance to Flot format');
        var returnvalue = $.map(this.yahooFinanceData, function (value) {
            return [[moment(value.date), parseFloat(value[column])]];
        }).reverse();
        return returnvalue;
    });

    /**
     * Get the Price TA Object
     *
     * @return     {Array} the MACD curve
     */
    flotFinance.fn.getPriceTA = cached(function (scale, splitDetection) {
        var data = this.getClosePrice(scale, splitDetection);
        var priceTA = TA(getPricesAsArray(data));
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
        var close = this.getClosePrice();
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

    // Private methods
    var scaleTo = function (scale, data, add) {
        switch (scale) {
            case undefined:
            case 'days':
                // Keep original day scale
                return data;
            case 'weeks':
                return scaleToWeeks(data, add);
            case 'months':
                return scaleToMonths(data, add);
            case 'years':
                return scaleToYears(data, add);
        }
    };

    var scaleToWeeks = function (data, add) {
        log.trace('Scaling data to week', data);
        console.time('scaleToWeeks');
        var scaledData = [];
        var currentWeek = data[0][0].isoWeek();
        var currentWeekIndex = 0;
        if (add) {
            scaledData[currentWeekIndex] = [data[0][0], data[0][1]];
            $.each(data, function (index, value) {
                var week = value[0].isoWeek();
                if (week === currentWeek) {
                    scaledData[currentWeekIndex] = [value[0], scaledData[currentWeekIndex][1] + value[1]];
                } else {
                    currentWeek = week;
                    currentWeekIndex = currentWeekIndex + 1;
                    scaledData[currentWeekIndex] = [value[0], value[1]];
                }
            });
            console.timeEnd('scaleToWeeks');
            return scaledData;
        } else {
            $.each(data, function (index, value) {
                var week = value[0].isoWeek();
                if (week === currentWeek) {
                    scaledData[currentWeekIndex] = [value[0], value[1]];
                } else {
                    currentWeek = week;
                    currentWeekIndex = currentWeekIndex + 1;
                    scaledData[currentWeekIndex] = [value[0], value[1]];
                }
            });
            console.timeEnd('scaleToWeeks');
            return scaledData;
        }
    };

    var scaleToMonths = function (data, add) {
        log.trace('Scaling data to month', data);
        console.time('scaleToMonths');
        var scaledData = [];
        var currentMonth = data[0][0].month();
        var currentMonthIndex = 0;
        if (add) {
            scaledData[currentMonthIndex] = [data[0][0], data[0][1]];
            $.each(data, function (index, value) {
                var month = value[0].month();
                if (month === currentMonth) {
                    scaledData[currentMonthIndex] = [value[0], scaledData[currentMonthIndex][1] + value[1]];
                } else {
                    currentMonth = month;
                    currentMonthIndex++;
                    scaledData[currentMonthIndex] = [value[0], value[1]];
                }
            });
            console.timeEnd('scaleToMonths');
            return scaledData;
        } else {
            $.each(data, function (index, value) {
                var month = value[0].month();
                if (month === currentMonth) {
                    scaledData[currentMonthIndex] = [value[0], value[1]];
                } else {
                    currentMonth = month;
                    currentMonthIndex++;
                    scaledData[currentMonthIndex] = [value[0], value[1]];
                }
            });
            console.timeEnd('scaleToMonths');
            return scaledData;
        }
    };

    var scaleToYears = function (data, add) {
        log.trace('Scaling data to year', data);
        console.time('scaleToYears');
        var scaledData = [];
        var currentYear = data[0][0].year();
        var currentYearIndex = 0;
        if (add) {
            scaledData[currentYearIndex] = [data[0][0], data[0][1]];
            $.each(data, function (index, value) {
                var year = value[0].year();
                if (year === currentYear) {
                    scaledData[currentYearIndex] = [value[0], scaledData[currentYearIndex][1] + value[1]];
                } else {
                    currentYear = year;
                    currentYearIndex++;
                    scaledData[currentYearIndex] = [value[0], value[1]];
                }
            });
            console.timeEnd('scaleToYears');
            return scaledData;
        } else {
            $.each(data, function (index, value) {
                var year = value[0].year();
                if (year === currentYear) {
                    scaledData[currentYearIndex] = [value[0], value[1]];
                } else {
                    currentYear = year;
                    currentYearIndex++;
                    scaledData[currentYearIndex] = [value[0], value[1]];
                }
            });
            console.timeEnd('scaleToYears');
            return scaledData;
        }
    };

    var adjustSplits = function (data) {
        log.trace('Adjusting splits to data', data);
        var previousPrice = data[data.length - 1][1];
        var previousDate = data[data.length - 1][0];
        var adjustFactor = 1;
        for (var i = data.length - 2; i >= 0; i--) {
            if (Math.round(data[i][1] / previousPrice) >= 2) {
                log.debug('Split found and adjusted between ' + data[i][0] + '(' + data[i][1] + ') to ' + previousDate + ' (' + previousPrice + ')');
                adjustFactor = adjustFactor / Math.round(data[i][1] / previousPrice);
            }
            previousPrice = data[i][1];
            previousDate = data[i][0];
            if (adjustFactor !== 1) {
                data[i][1] = data[i][1] * adjustFactor;
            }
        }
        return data;
    };

    var convertToFlotFormat = function (arg1, arg2) {
        // Array passed as arg1 and price in Flot format as arg2
        log.trace('Converting array to Flot format');
        return $.map(arg1, function (value, index) {
            return [[arg2[index][0], value]];
        });
    };

    var getPricesAsArray = function (data) {
        return $.map(data, function (value) {
            return value[1];
        });
    };

})();
