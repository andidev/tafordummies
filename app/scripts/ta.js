/*!
 * ta.js 0.0.1
 * http://github.com/andidev/ta.js
 * Copyright (c) 2014 Anders Steiner; Licensed Apache-2.0
 */

(function() {

    // helpers
    var toString = Object.prototype.toString;

    // test if array
    var isArray = Array.isArray || function(arg) {
        return toString.call(arg) === '[object Array]';
    };

    // test if function
    var isFunction = function(arg) {
        return toString.call(arg) === '[object Function]';
    };

    // test if number and not NaN
    var isNumber = function(arg) {
        return toString.call(arg) === '[object Number]' && !isNaN(arg);
    };

    var TA = function(arg1) { // core constructor
        // ensure to use the `new` operator
        if (!(this instanceof TA)) {
            return new TA(arg1);
        }

        // if first argument is an array
        if (isArray(arg1)) {
            this.array = arg1;
        // handle case when TA object is passed to TA
        } else if (arg1 instanceof TA) {
            // duplicate the object and pass it back
            return TA(arg1.asArray());
        // unexpected argument value, return empty TA object
        } else {
            this.array = [];
        }
        return this;
    };

    // create `fn` alias to `prototype` property
    TA.fn = TA.prototype = {
        asArray: function () {
            return this.array;
        },
        max: function () {
            return Math.max.apply(Math, this.array);
        },
        min: function () {
            return Math.min.apply(Math, this.array);
        },
        sum: function (from, to) {
            if (from === undefined && to === undefined) {
                from = 0;
                to = this.array.length;
            }
            var sum = 0;
            for(var i = from; i < to; i++) {
                sum += this.array[i];
            }
            return sum;
        },
        plus: function (array) {
            if (array instanceof TA) {
                array = array.asArray();
            }
            var plus = [];
            for(var i = 0; i < this.array.length; i++) {
                if (this.array[i] === null || array[i] === null) {
                    plus[i] = null;
                    continue;
                }
                plus[i] = this.array[i] + array[i];
            }
            return TA(plus);
        },
        minus: function (array) {
            if (array instanceof TA) {
                array = array.asArray();
            }
            var minus = [];
            for(var i = 0; i < this.array.length; i++) {
                if (this.array[i] === null || array[i] === null) {
                    minus[i] = null;
                    continue;
                }
                minus[i] = this.array[i] - array[i];
            }
            return TA(minus);
        },
        a: function (from, to) {
            if (from === undefined && to === undefined) {
                from = 0;
                to = this.array.length;
            }
            var sum = 0;
            for(var i = from; i < to; i++) {
                sum += this.array[i];
            }
            return sum/(to-from);
        }
    };

    /**
     * Calculate the (Simple) Moving Avarage
     *
     * @param      {Number}   n
     * @param      {Number}   from
     * @param      {Number}   to
     * @return     {TA} the (Simple) Moving Avarage
     */
     TA.fn.ma = function (n, from, to) {
        if (from === undefined && to === undefined) {
            from = 0;
            to = this.array.length;
        }
        var ma = [];
        for(var i = from; i < to; i++) {
            if (i < (n - 1)) {
                ma[i - from] = null;
            } else {
                ma[i - from] = this.sum(i - (n - 1), i + 1) / n;
            }
        }
        return TA(ma);
    };

    /**
     * Calculate the Exponentially (Weighted) Moving Average
     *
     * @param      {Number}   n
     * @param      {Number}   from
     * @param      {Number}   to
     * @return     {TA} the Exponentially (Weighted) Moving Average
     */
    TA.fn.ema = function (n, from, to) {
        if (from === undefined && to === undefined) {
            from = 0;
            to = this.array.length;
        }

        var alpha = 2 / (n + 1);
        var ema = [];
        for(var i = from; i < to; i++) {
            if (i < (n - 1)) {
                ema[i - from] = null;
            } else if (i === (n - 1)) {
                ema[i - from] = this.ma(n, i, i + 1).asArray()[0];
            } else {
                ema[i - from] = alpha * this.array[i] + (1 - alpha) * ema[i - from - 1];
            }
        }
        return TA(ema);
    };

    /**
     * Calculate the RSI (Relative Strength Index)
     *
     *                  100
     *    RSI = 100 - --------
     *                 1 + RS
     *
     *    RS = Average Gain / Average Loss
     *
     * The very first calculations for average gain and average loss are simple 14 period averages.
     *  - First Average Gain = Sum of Gains over the past 14 periods / 14.
     *  - First Average Loss = Sum of Losses over the past 14 periods / 14
     *
     * The second, and subsequent, calculations are based on the prior averages and the current gain loss:
     *  - Average Gain = [(previous Average Gain) x 13 + current Gain] / 14.
     *  - Average Loss = [(previous Average Loss) x 13 + current Loss] / 14.
     *
     * For more info see http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi
     *
     * @param      {Number}   n
     * @param      {Number}   from
     * @param      {Number}   to
     * @return     {TA} the RSI (Relative Strength Index)
     */
    TA.fn.rsi = function (n, from, to) {
        if (from === undefined && to === undefined) {
            from = 0;
            to = this.array.length;
        }

        var gain = 0;
        var loss = 0;
        var rsi = [];
        for(var i = from; i < to; i++) {
            if (i === from) {
                rsi[i - from] = null;
            } else if (i <= n) {
                rsi[i - from] = null;
                if (this.array[i - 1] <= this.array[i]) {
                    gain = gain + this.array[i] - this.array[i - 1];
                } else {
                    loss = loss + this.array[i - 1] - this.array[i];
                }
                if (i === n) {
                    rsi[i - from] = 100 - 100 / (1 + gain / loss);
                }
            } else {
                if (this.array[i - 1] <= this.array[i]) {
                    gain = gain / n * (n - 1) + this.array[i] - this.array[i - 1];
                    loss = loss / n * (n - 1);
                } else {
                    gain = gain / n * (n - 1);
                    loss = loss / n * (n - 1) + this.array[i - 1] - this.array[i];
                }
                rsi[i - from] = 100 - 100 / (1 + gain / loss);
            }
        }
        return TA(rsi);
    };

    /**
     * Calculate the Moving Average Convergence/Divergence
     *
     * @param      {Number}   n
     * @param      {Number}   from
     * @param      {Number}   to
     * @return     {TA} the Moving Average Convergence/Divergence
     */
    TA.fn.macd = function (nSlow, nFast, nSignal, from, to) {
        if (nSlow === undefined) {
            nSlow = 26;
        }
        if (nFast === undefined) {
            nFast = 12;
        }
        if (nSignal === undefined) {
            nSignal = 9;
        }
        if (from === undefined && to === undefined) {
            from = 0;
            to = this.array.length;
        }

        var macd = this.ema(nFast, from, to).minus(this.ema(nSlow, from, to));
        var signal = macd.ema(nSignal, from, to);
        var histogram = macd.minus(signal);
        return {
            "macd": macd,
            "signal": signal,
            "histogram": histogram
        };
    };

    // expose the library
    window.TA = TA;
})();