'use strict';
/* global _ */
/* global flotFinance */
/* global ko */
/* global log */
/* global moment */
/* global numeral */
/* global async */
/* global defaultValue */
/* global defaultBooleanValue */
/* global defaultNumberValue */
/* global formatDate */
/* global formatLongDate */
/* global formatNumber */
/* global formatPercent */
/* global formatPrice */
/* global addPaddingsToYaxisMinMax */
/* global findYaxisMinMax */
/* exported ViewModel */
function ViewModel() {
    var self = this;
    var url = $.url();

    // Data
    self.debug = ko.observable(defaultBooleanValue(false, url.param('debug')));
    self.symbols = ko.observableArray([
        {id: '^OMX', text: 'OMXS30'},
        {id: 'PXX.TO', text: 'Black Pearl Resources'},
        {id: 'AOI.ST', text: 'Africa Oil'},
        {id: 'GIX.TO', text: 'Geologix Explorations Inc.'},
        {id: 'FOE.OL', text: 'F.OLSEN ENERGY'},
        {id: 'HM-B.ST', text: 'HM-B'},
        {id: '^GSPC', text: 'S&P-500'},
        {id: '^VIX', text: 'VOLATILITY S&P-500'}
    ]);
    self.symbol = ko.observable();
    self.symbolName = ko.computed(function () {
        var symbolName = self.symbol();
        $.each(self.symbols(), function (index, symbol) {
            if (symbol.id === self.symbol()) {
                symbolName = symbol.text;
                return;
            }
        });
        return symbolName;
    });
    self.flotFinanceSymbol = ko.computed(function () {
        if (self.symbol()) {
            return flotFinance(self.symbol());
        }
    });
    self.price = ko.observable({
        label: self.symbol(),
        data: [],
        color: 'rgba(51, 120, 190, 1)',
        lines: {
            fill: true,
            fillColor: 'rgba(51, 120, 190, 0.09)'
        }
    });

    // TA Fast
    self.showTaFast = ko.observable(defaultBooleanValue(true, url.param('showTaFast')));
    self.taFastType = ko.observable(defaultValue('SMA', url.param('taFastType')));
    self.taFastTypeOpposite = ko.computed(function () {
        if (self.taFastType() === 'EMA') {
            return 'SMA';
        } else {
            return 'EMA';
        }
    });
    self.taFastestPeriod = ko.observable(defaultNumberValue(5, url.param('maFastestPeriod')));
    self.taFastest = ko.observable({
        label: self.taFastType() + '(' + self.taFastestPeriod() + ')',
        data: [],
        color: 'rgba(51, 120, 190, 0.4)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });
    self.taFastPeriod = ko.observable(defaultNumberValue(14, url.param('maFastPeriod')));
    self.taFast = ko.observable({
        label: self.taFastType() + '(' + self.taFastPeriod() + ')',
        data: [],
        color: 'rgba(178, 56, 59, 0.4)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });

    // TA Slow
    self.showTaSlow = ko.observable(defaultBooleanValue(true, url.param('showTaSlow')));
    self.taSlowType = ko.observable(defaultValue('SMA', url.param('taSlowType')));
    self.taSlowTypeOpposite = ko.computed(function () {
        if (self.taSlowType() === 'EMA') {
            return 'SMA';
        } else {
            return 'EMA';
        }
    });
    self.taSlowPeriod = ko.observable(defaultNumberValue(50, url.param('maSlowPeriod')));
    self.taSlow = ko.observable({
        label: self.taSlowType() + '(' + self.taSlowPeriod() + ')',
        data: [],
        color: 'rgba(0, 0, 0, 0.4)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });
    self.taSlowerPeriod = ko.observable(defaultNumberValue(100, url.param('maSlowerPeriod')));
    self.taSlower = ko.observable({
        label: self.taSlowType() + '(' + self.taSlowerPeriod() + ')',
        data: [],
        color: 'rgba(0, 0, 0, 0.2)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });
    self.taSlowestPeriod = ko.observable(defaultNumberValue(200, url.param('maSlowestPeriod')));
    self.taSlowest = ko.observable({
        label: self.taSlowType() + '(' + self.taSlowestPeriod() + ')',
        data: [],
        color: 'rgba(0, 0, 0, 0.1)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });

    // Volume
    self.hasVolume = ko.computed(function () {
        if (self.flotFinanceSymbol()) {
            return self.flotFinanceSymbol().hasVolume();
        }
    });
    self.showVolume = ko.observable(defaultBooleanValue(true, url.param('showVolume')));
    self.volume = ko.observable({
        label: 'Volume',
        data: [],
        color: 'grey',
        shadowSize: 1,
        bars: {
            show: true,
            align: 'center'
        }
    });

    // RSI
    self.showRsi = ko.observable(defaultBooleanValue(false, url.param('showRsi')));
    self.rsiPeriod = ko.observable(defaultNumberValue(14, url.param('rsiPeriod')));
    self.rsi = ko.observable({
        label: 'RSI(' + self.rsiPeriod() + ')',
        data: [],
        color: 'rgba(51, 120, 190, 1)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });

    // MACD
    self.showMacd = ko.observable(defaultBooleanValue(false, url.param('showMacd')));
    self.macdFastPeriod = ko.observable(defaultNumberValue(12, url.param('macdFastPeriod')));
    self.macdSlowPeriod = ko.observable(defaultNumberValue(26, url.param('macdSlowPeriod')));
    self.macd = ko.observable({
        label: 'MACD(' + self.macdFastPeriod() + ',' + self.macdSlowPeriod() + ')',
        data: [],
        color: 'rgba(51, 120, 190, 0.4)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });
    self.macdSignalPeriod = ko.observable(defaultNumberValue(9, url.param('macdSignalPeriod')));
    self.macdSignal = ko.observable({
        label: 'Signal(' + self.macdSignalPeriod() + ')',
        data: [],
        color: 'rgba(178, 56, 59, 0.4)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });
    self.macdDivergence = ko.observable({
        label: 'Divergence',
        data: [],
        color: 'rgba(56, 174, 17, 0.2)',
        shadowSize: 1,
        yaxis: 2,
        lines: {
            show: true,
            lineWidth: 1,
            fill: true,
            fillColor: 'rgba(56, 174, 17, 0.09)'
        }

    });

    self.enableSplitDetection = ko.observable(defaultBooleanValue(false, url.param('enableSplitDetection')));
    self.scale = ko.observable(defaultValue('days', url.param('scale')));
    self.scaleTimePeriodAll = ko.observable('days');
    self.timePeriod = ko.observable(defaultValue('3years', url.param('timePeriod')));
    self.zoomHistory = ko.observableArray([]);
    self.toDate = ko.observable();
    self.toDateFormatted = ko.computed(function () {
        if (self.toDate() === undefined) {
            return '';
        }
        $('#to-date').datepicker('setDate', self.toDate().toDate());
        return formatDate(self.toDate());
    });
    self.fromDate = ko.observable();
    self.fromDateFormatted = ko.computed(function () {
        if (self.fromDate() === undefined) {
            return '';
        }
        $('#from-date').datepicker('setDate', self.fromDate().toDate());
        return formatDate(self.fromDate());
    });
    self.settings = {
        showXaxisTicksInGrid: true,
        paddingFactor: 0.05
    };
    self.commonPlotOptions = {
        xaxis: {
            mode: 'time',
            reserveSpace: true,
            min: null,
            max: null
        },
        yaxes: [{
                position: 'left',
                reserveSpace: true,
                labelWidth: 30,
                tickFormatter: function (value, axis) {
                    return formatPrice(value, axis.tickDecimals);
                }
            }, {
                position: 'right',
                reserveSpace: true,
                labelWidth: 30,
                color: 'rgba(10, 100, 0, 0.33)',
                tickColor: 'rgba(10, 100, 0, 0.33)',
                tickFormatter: function (value, axis) {
                    return formatPrice(value, axis.tickDecimals);
                }
            }
        ],
        selection: {
            mode: 'x',
            color: 'rgba(0, 0, 0, 0.3)'
        },
        crosshair: {
            mode: 'x',
            color: '#428bca',
            lineWidth: 3
        },
        grid: {
            hoverable: true,
            autoHighlight: false
        },
        legend: {
            labelBoxBorderColor: 'transparent',
            backgroundColor: 'transparent',
            noColumns: 1,
            position: 'nw',
            labelFormatter: function (label) {
                if (label === self.symbolName()) {
                    return '<span class="legend-label">' + label + '</span> <span class="legend-label-value" data-bind="text: hoverPriceFormatted, visible: hoverPrice"></span>';
                } else if (label === self.taFastType() + '(' + self.taFastestPeriod() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverTaFastestFormatted, visible: hoverTaFastest"></span>';
                } else if (label === self.taFastType() + '(' + self.taFastPeriod() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverTaFastFormatted, visible: hoverTaFast"></span>';
                } else if (label === self.taSlowType() + '(' + self.taSlowPeriod() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverTaSlowFormatted, visible: hoverTaSlow"></span>';
                } else if (label === self.taSlowType() + '(' + self.taSlowerPeriod() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverTaSlowerFormatted, visible: hoverTaSlower"></span>';
                } else if (label === self.taSlowType() + '(' + self.taSlowestPeriod() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverTaSlowestFormatted, visible: hoverTaSlowest"></span>';
                } else if (label === 'Volume') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverVolumeFormatted, visible: hoverVolume && hasVolume"></span>';
                } else if (label === 'RSI(' + self.rsiPeriod() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverRsiFormatted, visible: hoverRsi"></span>';
                } else if (label === 'Divergence') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverMacdDivergenceFormatted, visible: hoverMacdDivergence"></span>';
                } else if (label === 'MACD(' + self.macdFastPeriod() + ',' + self.macdSlowPeriod() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverMacdFormatted, visible: hoverMacd"></span>';
                } else if (label === 'Signal(' + self.macdSignalPeriod() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverMacdSignalFormatted, visible: hoverMacdSignal"></span>';
                } else {
                    return label;
                }
            }
        },
        highlightColor: '#428bca'
    };
    self.mainPlotArgs = {
        placeholder: $('#main-plot'),
        series: [],
        options: jQuery.extend(true, {}, self.commonPlotOptions)
    };
    self.volumePlotArgs = {
        placeholder: $('#volume-plot'),
        series: [],
        options: jQuery.extend(true, {}, self.commonPlotOptions)
    };
    self.rsiPlotArgs = {
        placeholder: $('#rsi-plot'),
        series: [],
        options: jQuery.extend(true, {
            grid: {
                markings: [{
                        color: 'rgba(255, 0, 0, 0.5)',
                        lineWidth: 1,
                        yaxis: {from: 30, to: 30}
                    }, {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1,
                        yaxis: {from: 50, to: 50}
                    }, {
                        color: 'rgba(0, 255, 0, 0.5)',
                        lineWidth: 1,
                        yaxis: {from: 70, to: 70}
                    }]
            },
            yaxis: {
                tickColor: 'transparent',
                min: 0,
                max: 100,
                ticks: [30, 50, 70]
            }
        }, self.commonPlotOptions)
    };
    self.macdPlotArgs = {
        placeholder: $('#macd-plot'),
        series: [],
        options: jQuery.extend(true, {
            grid: {
                markings: [{
                        color: 'rgba(51, 120, 190, 0.2)',
                        lineWidth: 1,
                        yaxis: {from: 0, to: 0}
                    }, {
                        color: 'rgba(56, 174, 17, 0.15)',
                        lineWidth: 1,
                        y2axis: {from: 0, to: 0}
                    }]
            }}, self.commonPlotOptions)
    };
    self.$mainPlot = null;
    self.$volumePlot = null;
    self.$rsiPlot = null;
    self.$macdPlot = null;

    self.percent = ko.observable(0);
    self.percentFormatted = ko.computed(function () {
        return formatPercent(self.percent());
    });
    self.percentArrowClass = ko.computed(function () {
        if (self.percent() > 0) {
            return 'fa-arrow-up';
        } else if (self.percent() < 0) {
            return 'fa-arrow-down';
        } else {
            return 'fa-arrow-right';
        }
    });
    self.percentColorClass = ko.computed(function () {
        if (self.percent() > 0) {
            return 'text-success';
        } else if (self.percent() < 0) {
            return 'text-danger';
        } else {
            return '';
        }
    });
    self.highest = ko.observable(0);
    self.highestFormatted = ko.computed(function () {
        return formatPrice(self.highest());
    });
    self.lowest = ko.observable(0);
    self.lowestFormatted = ko.computed(function () {
        return formatPrice(self.lowest());
    });
    self.profit = ko.observable();
    self.profitFormatted = ko.computed(function () {
        return formatPercent(self.profit());
    });
    self.profitColorClass = ko.computed(function () {
        if (self.profit() > 0) {
            return 'text-success';
        } else if (self.profit() < 0) {
            return 'text-danger';
        } else {
            return '';
        }
    });

    // Behaviors
    /* Change Scale */
    self.changeScaleToAuto = function () {
        if (self.scale() !== 'auto') {
            log.info('Changing scale to Auto');
            self.scale('auto');
            self.processData();
            self.plot();
        }
    };
    self.changeScaleToDays = function () {
        if (self.scale() !== 'days') {
            log.info('Changing scale to Days');
            self.scale('days');
            self.processData();
            self.plot();
        }
    };
    self.changeScaleToWeeks = function () {
        if (self.scale() !== 'weeks') {
            log.info('Changing scale to Weeks');
            self.scale('weeks');
            self.processData();
            self.plot();
        }
    };
    self.changeScaleToMonths = function () {
        if (self.scale() !== 'months') {
            log.info('Changing scale to Months');
            self.scale('months');
            self.processData();
            self.plot();
        }
    };
    self.changeScaleToYears = function () {
        if (self.scale() !== 'years') {
            log.info('Changing scale to Years');
            self.scale('years');
            self.processData();
            self.plot();
        }
    };

    /* Change Time Period */
    self.changeTimePeriodToAll = function () {
        log.info('Changing time period to All');
        self.zoomHistory.push({
            fromDate: self.fromDate().clone(),
            toDate: self.toDate().clone(),
            timePeriod: self.timePeriod()
        });
        self.timePeriod('all');
        self.toDate(getLastPriceDate());
        self.fromDate(getFromDateForTimePeriod());
        self.processData();
        self.plot();
    };
    self.changeTimePeriodTo10Years = function () {
        log.info('Changing time period to 10 Years');
        self.zoomHistory.push({
            fromDate: self.fromDate().clone(),
            toDate: self.toDate().clone(),
            timePeriod: self.timePeriod()
        });
        self.timePeriod('10years');
        self.toDate(getLastPriceDate());
        self.fromDate(getFromDateForTimePeriod());
        self.processData();
        self.plot();
    };
    self.changeTimePeriodTo3Years = function () {
        log.info('Changing time period to 3 Years');
        self.zoomHistory.push({
            fromDate: self.fromDate().clone(),
            toDate: self.toDate().clone(),
            timePeriod: self.timePeriod()
        });
        self.timePeriod('3years');
        self.toDate(getLastPriceDate());
        self.fromDate(getFromDateForTimePeriod());
        self.processData();
        self.plot();
    };
    self.changeTimePeriodToYear = function () {
        log.info('Changing time period to Year');
        self.zoomHistory.push({
            fromDate: self.fromDate().clone(),
            toDate: self.toDate().clone(),
            timePeriod: self.timePeriod()
        });
        self.timePeriod('year');
        self.toDate(getLastPriceDate());
        self.fromDate(getFromDateForTimePeriod());
        self.processData();
        self.plot();
    };
    self.changeTimePeriodTo3Months = function () {
        log.info('Changing time period to 3 Month');
        self.zoomHistory.push({
            fromDate: self.fromDate().clone(),
            toDate: self.toDate().clone(),
            timePeriod: self.timePeriod()
        });
        self.timePeriod('3months');
        self.toDate(getLastPriceDate());
        self.fromDate(getFromDateForTimePeriod());
        self.processData();
        self.plot();
    };
    self.changeTimePeriodToMonth = function () {
        log.info('Changing time period to Month');
        self.zoomHistory.push({
            fromDate: self.fromDate().clone(),
            toDate: self.toDate().clone(),
            timePeriod: self.timePeriod()
        });
        self.timePeriod('month');
        self.toDate(getLastPriceDate());
        self.fromDate(getFromDateForTimePeriod());
        self.processData();
        self.plot();
    };
    self.changeTimePeriodToWeek = function () {
        log.info('Changing time period to Week');
        self.zoomHistory.push({
            fromDate: self.fromDate().clone(),
            toDate: self.toDate().clone(),
            timePeriod: self.timePeriod()
        });
        self.timePeriod('week');
        self.toDate(getLastPriceDate());
        self.fromDate(getFromDateForTimePeriod());
        self.processData();
        self.plot();
    };

    /* Toggle */
    self.toggleTaFast = function () {
        if (self.showTaFast() === true) {
            log.info('Hiding TA Fast ' + self.taFastType() + '(' + self.taFastestPeriod() + ',' + self.taFastPeriod() + ')');
            self.showTaFast(false);
        } else {
            log.info('Showing TA Fast ' + self.taFastType() + '(' + self.taFastestPeriod() + ',' + self.taFastPeriod() + ')');
            self.showTaFast(true);
        }
        self.plot();
    };
    self.toggleTaFastType = function () {
        if (self.taFastType() === 'EMA') {
            log.info('Changing TA Fast Type to SMA');
            self.taFastType('SMA');
        } else {
            log.info('Changing TA Fast Type to EMA');
            self.taFastType('EMA');
        }
        self.processData();
        self.plot();
    };
    self.toggleTaSlow = function () {
        if (self.showTaSlow() === true) {
            log.info('Hiding TA Slow ' + self.taSlowType() + '(' + self.taSlowPeriod() + ',' + self.taSlowerPeriod() + ',' + self.taSlowestPeriod() + ')');
            self.showTaSlow(false);
        } else {
            log.info('Showing TA Slow ' + self.taSlowType() + '(' + self.taSlowPeriod() + ',' + self.taSlowerPeriod() + ',' + self.taSlowestPeriod() + ')');
            self.showTaSlow(true);
        }
        self.plot();
    };
    self.toggleTaSlowType = function () {
        if (self.taSlowType() === 'EMA') {
            log.info('Changing TA Slow Type to SMA');
            self.taSlowType('SMA');
        } else {
            log.info('Changing TA Slow Type to EMA');
            self.taSlowType('EMA');
        }
        self.processData();
        self.plot();
    };
    self.toggleVolume = function () {
        if (self.showVolume() === true) {
            log.info('Hiding Volume');
            self.showVolume(false);
        } else {
            log.info('Showing Volume');
            self.showVolume(true);
        }
        self.plot();
    };
    self.toggleRsi = function () {
        if (self.showRsi() === true) {
            log.info('Hiding RSI');
            self.showRsi(false);
        } else {
            log.info('Showing RSI');
            self.showRsi(true);
        }
        self.plot();
    };
    self.toggleMacd = function () {
        if (self.showMacd() === true) {
            log.info('Hiding MACD(' + self.macdFastPeriod() + ',' + self.macdSlowPeriod() + ',' + self.macdSignalPeriod() + ')');
            self.showMacd(false);
        } else {
            log.info('Showing MACD(' + self.macdFastPeriod() + ',' + self.macdSlowPeriod() + ',' + self.macdSignalPeriod() + ')');
            self.showMacd(true);
        }
        self.plot();
    };
    self.toggleSplitDetection = function () {
        if (self.enableSplitDetection() === false) {
            log.info('Enabling Split Detection');
            self.enableSplitDetection(true);
        } else {
            log.info('Disabling Split Detection');
            self.enableSplitDetection(false);
        }
        self.processData();
        self.plot();
    };

    /* Slide */
    self.slideTaFastest = function (viewModel, event) {
        log.trace('Sliding TA Fastest');
        var newPeriod = event.value;
        if (self.taFastestPeriod() !== newPeriod) {
            log.info('Updating TA Fastest to ' + self.taFastType() + '(' + newPeriod + ')');
            self.taFastestPeriod(newPeriod);
            self.processData();
            self.plot();
        }
    };
    self.slideTaFast = function (viewModel, event) {
        log.trace('Sliding TA Fast');
        var newPeriod = event.value;
        if (self.taFastPeriod() !== newPeriod) {
            log.info('Updating TA Fast to ' + self.taFastType() + '(' + newPeriod + ')');
            self.taFastPeriod(newPeriod);
            self.processData();
            self.plot();
        }
    };
    self.slideTaSlow = function (viewModel, event) {
        log.trace('Sliding TA Slow');
        var newPeriod = event.value;
        if (self.taSlowPeriod() !== newPeriod) {
            log.info('Updating TA Slow to ' + self.taSlowType() + '(' + newPeriod + ')');
            self.taSlowPeriod(newPeriod);
            self.processData();
            self.plot();
        }
    };
    self.slideTaSlower = function (viewModel, event) {
        log.trace('Sliding TA Slower');
        var newPeriod = event.value;
        if (self.taSlowerPeriod() !== newPeriod) {
            log.info('Updating TA Slower to ' + self.taSlowType() + '(' + newPeriod + ')');
            self.taSlowerPeriod(newPeriod);
            self.processData();
            self.plot();
        }
    };
    self.slideTaSlowest = function (viewModel, event) {
        log.trace('Sliding TA Slowest');
        var newPeriod = event.value;
        if (self.taSlowestPeriod() !== newPeriod) {
            log.info('Updating TA Slowest to ' + self.taSlowType() + '(' + newPeriod + ')');
            self.taSlowestPeriod(newPeriod);
            self.processData();
            self.plot();
        }
    };
    self.slideRsi = function (viewModel, event) {
        log.trace('Sliding RSI');
        var newPeriod = event.value;
        if (self.rsiPeriod() !== newPeriod) {
            log.info('Updating RSI to RSI(' + newPeriod + ')');
            self.rsiPeriod(newPeriod);
            self.processData();
            self.plot();
        }
    };
    self.slideMacdFast = function (viewModel, event) {
        log.trace('Sliding MACD Fast');
        var newPeriod = event.value;
        if (self.macdFastPeriod() !== newPeriod) {
            log.info('Updating MACD Fast to EMA(' + newPeriod + ')');
            self.macdFastPeriod(newPeriod);
            self.processData();
            self.plot();
        }
    };
    self.slideMacdSlow = function (viewModel, event) {
        log.trace('Sliding MACD Slow');
        var newPeriod = event.value;
        if (self.macdSlowPeriod() !== newPeriod) {
            log.info('Updating MACD Slow to EMA(' + newPeriod + ')');
            self.macdSlowPeriod(newPeriod);
            self.processData();
            self.plot();
        }
    };
    self.slideMacdSignal = function (viewModel, event) {
        log.trace('Sliding MACD Signal');
        var newPeriod = event.value;
        if (self.macdSignalPeriod() !== newPeriod) {
            log.info('Updating MACD Signal to EMA(' + newPeriod + ')');
            self.macdSignalPeriod(newPeriod);
            self.processData();
            self.plot();
        }
    };

    self.updateFromDate = function (date) {
        log.trace('Updating from date');
        var bouncedMillis = null;
        var minDate = self.price().data[0][0];
        if (date.isBefore(minDate)) {
            bouncedMillis = minDate.diff(self.fromDate());
            date = minDate.clone();
        }
        self.fromDate(date);
        return bouncedMillis;
    };
    self.updateToDate = function (date) {
        log.trace('Updating to date');
        var bouncedMillis = null;
        var maxDate = self.price().data[self.price().data.length - 1][0];
        if (date.isAfter(maxDate)) {
            bouncedMillis = maxDate.diff(self.toDate());
            date = maxDate.clone();
        }
        self.toDate(date);
        return bouncedMillis;
    };

    self.changeFromDate = function (viewModel, event) {
        var isFromDateUpdated = !moment(event.date).isSame(self.fromDate());
        if (isFromDateUpdated) {
            $('#from-date').datepicker('hide'); // Close datepicker manually since autoclose: true setting does not seem to work for datepicker
            log.info('Changing From Date to ' + formatDate(moment(event.date)));
            self.updateFromDate(moment(event.date));
            self.timePeriod('custom');
            self.processData();
            self.plot();
        }
    };
    self.changeToDate = function (viewModel, event) {
        var isToDateUpdated = !moment(event.date).isSame(self.toDate());
        if (isToDateUpdated) {
            $('#to-date').datepicker('hide'); // Close datepicker manually since autoclose: true setting does not seem to work for datepicker
            log.info('Changing To Date to ' + formatDate(moment(event.date)));
            self.updateToDate(moment(event.date));
            self.timePeriod('custom');
            self.processData();
            self.plot();
        }
    };

    self.zoomSelectionFrom = null;
    self.zoomSelectionTo = null;
    self.mouseDown = function (viewModel, event) {
        log.trace('Mouse key pressed, which = ' + event.which);
        if (event.which === 1) {
            log.trace('Left mouse key pressed');
            self.zoomSelectionFrom = event.clientX;
        }
    };
    self.mouseMove = function (viewModel, event) {
        if (event.which === 1) {
            log.trace('Mouse is moved with left mouse key pressed');
            self.zoomSelectionTo = event.clientX;
        }
    };
    self.zoomSelection = function (viewModel, event, ranges) {
        log.trace('Zooming selection');
        var zoomDirection = (self.zoomSelectionTo - self.zoomSelectionFrom) < 0 ? 'left' : 'right';
        var fromIndex = self.findClosestDatapoint(ranges.xaxis.from);
        var toIndex = self.findClosestDatapoint(ranges.xaxis.to);
        if (zoomDirection === 'left') {
            self.undoZoom();
        } else if (zoomDirection === 'right') {
            if ((toIndex - fromIndex) >= 2) {
                self.zoomHistory.push({
                    fromDate: self.fromDate().clone(),
                    toDate: self.toDate().clone(),
                    timePeriod: self.timePeriod()
                });
                var from = self.price().data[fromIndex][0].clone();
                var to = self.price().data[toIndex][0].clone();
                log.info('Zooming selected from ' + formatDate(from) + ' to ' + formatDate(to));
                self.updateFromDate(from);
                self.updateToDate(to);
                self.timePeriod('custom');
                self.processData();
                self.plot();
            }
        }
        if (ranges !== null) {
            self.$mainPlot.clearSelection();
            if (self.showMacd()) {
                self.$macdPlot.clearSelection();
            }
            if (self.showVolume() && self.hasVolume()) {
                self.$volumePlot.clearSelection();
            }
            if (self.showRsi()) {
                self.$rsiPlot.clearSelection();
            }
        }
    };
    self.syncSelectionInPlot = function (viewModel, event, ranges) {
        if (ranges !== null) {
            if (event.currentTarget.id !== 'main-plot') {
                self.$mainPlot.setSelection(ranges, true);
            }
            if (event.currentTarget.id !== 'volume-plot') {
                if (self.showVolume() && self.hasVolume()) {
                    self.$volumePlot.setSelection(ranges, true);
                }
            }
            if (event.currentTarget.id !== 'rsi-plot') {
                if (self.showRsi()) {
                    self.$rsiPlot.setSelection(ranges, true);
                }
            }
            if (event.currentTarget.id !== 'macd-plot') {
                if (self.showMacd()) {
                    self.$macdPlot.setSelection(ranges, true);
                }
            }
        }
    };

    self.scrollPanZoom = _.throttle(function (viewModel, event) {
        if (event.altKey) {
            log.debug('Scroll zooming');
            var SCROLL_ZOOM_THRESHOLD = 2;
            if (event.originalEvent.wheelDeltaY < -SCROLL_ZOOM_THRESHOLD) {
                self.zoomOut();
            } else if (event.originalEvent.wheelDeltaY > SCROLL_ZOOM_THRESHOLD) {
                self.zoomIn();
            } else if (event.originalEvent.wheelDeltaX < -SCROLL_ZOOM_THRESHOLD) {
                self.panRight();
            } else if (event.originalEvent.wheelDeltaX > SCROLL_ZOOM_THRESHOLD) {
                self.panLeft();
            }
            return false;
        }
        return true;
    });
    self.undoZoom = function () {
        log.info('Undoing zoom', self.zoomHistory());
        var lastZoomHistory = self.zoomHistory.pop();
        if (lastZoomHistory !== undefined) {
            self.updateFromDate(lastZoomHistory.fromDate);
            self.updateToDate(lastZoomHistory.toDate);
            self.timePeriod(lastZoomHistory.timePeriod);
            self.processData();
            self.plot();
        }
    };
    self.zoomOut = function () {
        log.info('Zooming out ' + getDeltaForTimePeriod(12).value + ' ' + getDeltaForTimePeriod(12).timeUnit);
        self.zoomHistory.push({
            fromDate: self.fromDate().clone(),
            toDate: self.toDate().clone(),
            timePeriod: self.timePeriod()
        });
        var delta = getZoomOutDeltaForTimePeriod();
        if (self.toDate().isSame(self.price().data[self.price().data.length - 1][0])) {
            self.updateFromDate(self.fromDate().subtract(delta.value * 2, delta.timeUnit));
        } else if (self.fromDate().isSame(self.price().data[0][0])) {
            self.updateToDate(self.toDate().add(delta.value * 2, delta.timeUnit));
        } else {
            self.updateFromDate(self.fromDate().subtract(delta.value, delta.timeUnit));
            self.updateToDate(self.toDate().add(delta.value, delta.timeUnit));
        }
        self.timePeriod('custom');
        self.processData();
        self.plot();
    };
    self.zoomIn = function () {
        log.info('Zooming in ' + getDeltaForTimePeriod(14).value + ' ' + getDeltaForTimePeriod(14).timeUnit);
        self.zoomHistory.push({
            fromDate: self.fromDate().clone(),
            toDate: self.toDate().clone(),
            timePeriod: self.timePeriod()
        });
        var delta = getZoomInDeltaForTimePeriod();
        if (self.toDate().isSame(self.price().data[self.price().data.length - 1][0])) {
            self.updateFromDate(self.fromDate().add(delta.value * 2, delta.timeUnit));
        } else if (self.fromDate().isSame(self.price().data[0][0])) {
            self.updateToDate(self.toDate().subtract(delta.value * 2, delta.timeUnit));
        } else {
            self.updateFromDate(self.fromDate().add(delta.value, delta.timeUnit));
            self.updateToDate(self.toDate().subtract(delta.value, delta.timeUnit));
        }
        self.timePeriod('custom');
        self.processData();
        self.plot();
    };

    self.panLeft = function () {
        log.info('Panning left');
        self.zoomHistory.push({
            fromDate: self.fromDate().clone(),
            toDate: self.toDate().clone(),
            timePeriod: self.timePeriod()
        });
        var delta = getPanDeltaForTimePeriod();
        var bouncedDuration = self.updateFromDate(self.fromDate().clone().subtract(delta.value, delta.timeUnit));
        if (bouncedDuration !== null) {
            self.updateToDate(self.toDate().clone().add(bouncedDuration));
        } else {
            self.updateToDate(self.toDate().clone().subtract(delta.value, delta.timeUnit));
        }
        self.timePeriod('custom');
        self.processData();
        self.plot();
    };
    self.panRight = function () {
        log.info('Panning right');
        self.zoomHistory.push({
            fromDate: self.fromDate().clone(),
            toDate: self.toDate().clone(),
            timePeriod: self.timePeriod()
        });
        var delta = getPanDeltaForTimePeriod();
        var bouncedDuration = self.updateToDate(self.toDate().clone().add(delta.value, delta.timeUnit));
        if (bouncedDuration !== null) {
            self.updateFromDate(self.fromDate().clone().add(bouncedDuration));
        } else {
            self.updateFromDate(self.fromDate().clone().add(delta.value, delta.timeUnit));
        }
        self.timePeriod('custom');
        self.processData();
        self.plot();
    };
    self.altKeyDown = false;
    self.keyboardShortcutsHandler = _.throttle(function (viewModel, event) {
        if (event.target.tagName === 'INPUT') {
            return true;
        }
        var keyCode = (event.which ? event.which : event.keyCode);
        log.trace('Handling keyboard shortcuts (keyCode = ' + keyCode + ')');
        if (keyCode === 37) { // Left arrow
            log.trace('Left arrow key pressed');
            self.panLeft();
            return false;
        } else if (keyCode === 39) { // Right arrow
            log.trace('Right arrow key pressed');
            self.panRight();
            return false;
        } else if (keyCode === 40) { // Down arrow
            log.trace('Down arrow key pressed');
            self.zoomOut();
            return false;
        } else if (keyCode === 38) { // Up arrow
            log.trace('Up arrow key pressed');
            self.zoomIn();
            return false;
        } else if (keyCode === 189) { // Minus sign
            log.trace('Minus sign key pressed');
            self.zoomOut();
            return false;
        } else if (keyCode === 187) { // Plus sign
            log.trace('Plus sign key pressed');
            self.zoomIn();
            return false;
        } else if (keyCode === 86) { // V key
            log.trace('V key pressed');
            self.toggleVolume();
            return false;
        } else if (keyCode === 82) { // R key
            log.trace('R key pressed');
            self.toggleRsi();
            return false;
        } else if (keyCode === 70) { // F key
            if (event.altKey) {
                log.trace('Alt + F key pressed');
                self.toggleTaFastType();
                return false;
            } else {
                log.trace('F key pressed');
                self.toggleTaFast();
                return false;
            }
        } else if (keyCode === 83) { // S key
            if (event.altKey) {
                log.trace('Alt + S key pressed');
                self.toggleTaSlowType();
                return false;
            } else {
                log.trace('S key pressed');
                self.toggleTaSlow();
                return false;
            }
        } else if (keyCode === 77) { // M key
            log.trace('M key pressed');
            self.toggleMacd();
            return false;
        } else if (keyCode === 27) { // Escape
            log.trace('Escape key pressed');
            if ($('.datepicker-dropdown:visible').length) {
                $('#from-date').datepicker('hide');
                $('#to-date').datepicker('hide');
                return false;
            }
            if ($('#time-periods :focus').length) {
                $('#time-period-all-button').focus();
            }
            self.changeTimePeriodToAll();
            return false;
        } else if (keyCode === 8) { // Backspace
            log.trace('Backspace key pressed');
            self.undoZoom();
            return false;
        } else if (keyCode === 18) { // Alt
            log.trace('Alt key pressed');
            self.altKeyDown = true;
            self.hoverDate(self.hoverDate()); // Refresh hover date
            return true;
        }
        return true;
    });
    self.resetAltKeyDown = _.throttle(function (viewModel, event) {
        var keyCode = (event.which ? event.which : event.keyCode);
        if (keyCode === 18) { // Alt
            log.debug('Alt key released');
            self.altKeyDown = false;
            self.hoverDate(self.hoverDate()); // Refresh hover date
            return true;
        }
        return true;
    });

    self.previousPriceInfoIndex = null;
    self.hoverPercent = ko.observable('');
    self.hoverPercentFormatted = ko.computed(function () {
        return formatPercent(self.hoverPercent());
    });
    self.hoverPercentArrowClass = ko.computed(function () {
        if (self.hoverPercent() > 0) {
            return 'fa-arrow-up';
        } else if (self.hoverPercent() < 0) {
            return 'fa-arrow-down';
        } else {
            return 'fa-arrow-right';
        }
    });
    self.hoverPercentColorClass = ko.computed(function () {
        if (self.hoverPercent() > 0) {
            return 'text-success';
        } else if (self.hoverPercent() < 0) {
            return 'text-danger';
        } else {
            return '';
        }
    });
    self.hoverPrice = ko.observable();
    self.hoverPriceFormatted = ko.computed(function () {
        return formatPrice(self.hoverPrice());
    });
    self.hoverTaFastest = ko.observable();
    self.hoverTaFastestFormatted = ko.computed(function () {
        return formatPrice(self.hoverTaFastest());
    });
    self.hoverTaFast = ko.observable();
    self.hoverTaFastFormatted = ko.computed(function () {
        return formatPrice(self.hoverTaFast());
    });
    self.hoverTaSlow = ko.observable();
    self.hoverTaSlowFormatted = ko.computed(function () {
        return formatPrice(self.hoverTaSlow());
    });
    self.hoverTaSlower = ko.observable();
    self.hoverTaSlowerFormatted = ko.computed(function () {
        return formatPrice(self.hoverTaSlower());
    });
    self.hoverTaSlowest = ko.observable();
    self.hoverTaSlowestFormatted = ko.computed(function () {
        return formatPrice(self.hoverTaSlowest());
    });
    self.hoverVolume = ko.observable();
    self.hoverVolumeFormatted = ko.computed(function () {
        return formatNumber(self.hoverVolume());
    });
    self.hoverRsi = ko.observable();
    self.hoverRsiFormatted = ko.computed(function () {
        return formatPrice(self.hoverRsi());
    });
    self.hoverMacd = ko.observable();
    self.hoverMacdFormatted = ko.computed(function () {
        return formatPrice(self.hoverMacd());
    });
    self.hoverMacdSignal = ko.observable();
    self.hoverMacdSignalFormatted = ko.computed(function () {
        return formatPrice(self.hoverMacdSignal());
    });
    self.hoverMacdDivergence = ko.observable();
    self.hoverMacdDivergenceFormatted = ko.computed(function () {
        return formatPrice(self.hoverMacdDivergence());
    });
    self.hoverDate = ko.observable();
    self.hoverDateFormatted = ko.computed(function () {
        if (self.hoverDate() === undefined) {
            return '';
        } else if (self.altKeyDown) {
            // Show detailed format
            return formatLongDate(self.hoverDate());
        } else {
            return formatDate(self.hoverDate());
        }
    });

    self.showPriceInfo = function (viewModel, event, pos) {
        if (self.$mainPlot) {
            var priceInfoIndex = self.findClosestDatapoint(pos.x);
            if (priceInfoIndex === self.previousPriceInfoIndex) {
                // No changes to update
                return;
            }
            log.trace('Showing price info');
            if (self.price().data[priceInfoIndex][0].isBefore(self.fromDate())) {
                // Do not hover dates before from date
                priceInfoIndex = self.findClosestDatapoint(self.fromDate());
            }
            if (self.price().data[priceInfoIndex][0].isAfter(self.toDate())) {
                // Do not hover dates after to date
                priceInfoIndex = self.findClosestDatapoint(self.toDate());
            }
            self.$mainPlot.unhighlight(0, self.previousPriceInfoIndex);
            var date = self.mainPlotArgs.series[0].data[priceInfoIndex][0];
            var price = self.mainPlotArgs.series[0].data[priceInfoIndex][1];
            var priceToTheLeft = priceInfoIndex > 0 ? self.mainPlotArgs.series[0].data[priceInfoIndex - 1][1] : null;

            // Lock the crosshair to the closest data point being hovered
            self.$mainPlot.lockCrosshair({
                x: date,
                y: price
            });
            if (self.showVolume() && self.hasVolume() && self.$volumePlot) {
                self.$volumePlot.lockCrosshair({
                    x: date,
                    y: price
                });
            }
            if (self.showRsi() && self.$rsiPlot) {
                self.$rsiPlot.lockCrosshair({
                    x: date,
                    y: price
                });
            }
            if (self.showMacd() && self.$macdPlot) {
                self.$macdPlot.lockCrosshair({
                    x: date,
                    y: price
                });
            }
            self.$mainPlot.highlight(0, priceInfoIndex);

            var percent = null;
            if (priceToTheLeft !== null) {
                percent = (price - priceToTheLeft) / priceToTheLeft;
            }
            self.hoverPercent(percent);
            self.hoverPrice(price);
            self.hoverTaFastest(self.mainPlotArgs.series[1].data[priceInfoIndex][1]);
            self.hoverTaFast(self.mainPlotArgs.series[2].data[priceInfoIndex][1]);
            self.hoverTaSlow(self.mainPlotArgs.series[3].data[priceInfoIndex][1]);
            self.hoverTaSlower(self.mainPlotArgs.series[4].data[priceInfoIndex][1]);
            self.hoverTaSlowest(self.mainPlotArgs.series[5].data[priceInfoIndex][1]);
            if (self.hasVolume() && self.$volumePlot) {
                self.hoverVolume(self.volumePlotArgs.series[0].data[priceInfoIndex][1]);
            }
            if (self.showRsi() && self.$rsiPlot) {
                self.hoverRsi(self.rsiPlotArgs.series[0].data[priceInfoIndex][1]);
            }
            if (self.showMacd() && self.$macdPlot) {
                self.hoverMacdDivergence(self.macdPlotArgs.series[0].data[priceInfoIndex][1]);
                self.hoverMacd(self.macdPlotArgs.series[1].data[priceInfoIndex][1]);
                self.hoverMacdSignal(self.macdPlotArgs.series[2].data[priceInfoIndex][1]);
            }
            self.hoverDate(date);
            $('#hover-info').fadeIn(200);
            self.previousPriceInfoIndex = priceInfoIndex;
        }
    };
    self.hidePriceInfo = function (viewModel, event) {
        if (self.$mainPlot) {
            if ($('#hover-info').is(event.toElement)) {
                // Do not hide hover info if it is hovered
                return;
            }
            self.$mainPlot.clearCrosshair();
            self.$mainPlot.unhighlight(0, self.previousPriceInfoIndex);
            if (self.showVolume() && self.hasVolume() && self.$volumePlot) {
                self.$volumePlot.clearCrosshair();
            }
            if (self.showRsi() && self.$rsiPlot) {
                self.$rsiPlot.clearCrosshair();
            }
            if (self.showMacd() && self.$macdPlot) {
                self.$macdPlot.clearCrosshair();
            }
            $('#hover-info').stop(true, true);
            $('#hover-info').hide();
            self.previousPriceInfoIndex = null;
        }
    };

    // Functions
    self.init = function () {
        self.symbol(defaultValue('^OMX', url.param('symbol')));
        $('#symbol').select2({
            width: '200px',
            data: function () {
                var data = [];
                $(self.symbols()).each(function (index, symbol) {
                    data.push(symbol);
                });
                return {text: 'text', results: data};
            },
            createSearchChoice: function (term, data) {
                if ($(data).filter(function () {
                    return this.text.localeCompare(term) === 0;
                }).length === 0) {
                    return {id: term, text: term};
                }
            }
        });
        $('#symbol').select2('val', self.symbol()).on('select2-close', function () {
            setTimeout(function () {
                $('.select2-container-active').removeClass('select2-container-active');
                // Manually blur search input on close to let placeholder reappear
                // See https://github.com/ivaynberg/select2/issues/1545
                $(':focus').blur();
            }, 1);
        });
        $('#symbol').on('change', async(function (event) {
            self.symbol(event.val);
            self.scaleTimePeriodAll('days');
            if (self.timePeriod() === 'custom') {
                if (self.fromDate().isSame(getFirstPriceDate())) {
                    self.fromDate(undefined);
                }
                if (self.toDate().isSame(getLastPriceDate())) {
                    self.toDate(undefined);
                }
            } else {
                self.fromDate(undefined);
                self.toDate(undefined);
            }
            self.processData();
            self.plot();
        }));
        self.processData();
        self.plot();
        $('#progress-info').fadeOut('slow');
        $('#ta-plots').mousemove(function (event) {
            var mouseOffsetX = 40;
            var mouseOffsetY = -40;
            var hoverInfoWidth = $('#hover-info').outerWidth();

            var type = 'right';
            if (type === 'left') {
                var distanceToPlotLeft = event.clientX - mouseOffsetX;
                if (distanceToPlotLeft < hoverInfoWidth) {
                    $('#hover-info').css({
                        top: event.clientY + mouseOffsetY,
                        left: event.clientX + mouseOffsetX
                    });
                } else {
                    $('#hover-info').css({
                        top: event.clientY + mouseOffsetY,
                        left: event.clientX - (hoverInfoWidth + mouseOffsetX)
                    });
                }
            } else if (type === 'right') {
                var distanceToPlotRight = $(window).width() - (event.clientX + mouseOffsetX);
                if (distanceToPlotRight < hoverInfoWidth) {
                    $('#hover-info').css({
                        top: event.clientY + mouseOffsetY,
                        left: event.clientX - (mouseOffsetX + hoverInfoWidth)
                    });
                } else {
                    $('#hover-info').css({
                        top: event.clientY + mouseOffsetY,
                        left: event.clientX + mouseOffsetX
                    });
                }
            }
        });

        // Do not reset time period to all when escape is pressed and menu is open
        $('.btn-group').keydown(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 27) { // Escape key
                if ($('.btn-group.open .dropdown-toggle').length > 0) {
                    $('.btn-group.open .dropdown-toggle').dropdown('toggle');
                    $(':focus').blur();
                    event.stopPropagation();
                }
            }
        });

        $('.slider').slider({
            handle: 'square',
            tooltip: 'hide'
        });

        $('#from-to-date').datepicker({
            format: 'yyyy-mm-dd',
            todayBtn: 'linked',
            calendarWeeks: true,
            autoclose: true, // Closing datepicker manually since autoclose: true setting does not seem to work for datepicker
            todayHighlight: true
        });
        $('#from-date-button').on('click', function () {
            $('#from-date').datepicker('show');
        });
        $('#to-date-button').on('click', function () {
            $('#to-date').datepicker('show');
        });

        $(document).on('click', '.dropdown-menu', function (e) {
            if($(this).hasClass('dropdown-menu-keep-open')) {
                e.stopPropagation();
            }
        });
    };

    self.processData = function () {
        log.debug('Processing data');
        var start = moment().valueOf();

        self.mainPlotArgs.series = [];
        self.price().data = self.flotFinanceSymbol().getClosePrice(self.computeScale(), self.enableSplitDetection());

        if (self.scale() === 'auto' && self.timePeriod() === 'all') {
            // Set time period all and reload data
            self.scaleTimePeriodAll(self.computeScaleForZoom(getFirstPriceDate(), getLastPriceDate()));
            self.price().data = (self.flotFinanceSymbol().getClosePrice(self.computeScale(), self.enableSplitDetection()));
        }

        if (self.toDate() === undefined) {
            self.toDate(getLastPriceDate());
        } else if (self.toDate().isAfter(getLastPriceDate())) {
            self.toDate(getLastPriceDate());
        }
        if (self.fromDate() === undefined) {
            self.fromDate(getFromDateForTimePeriod());
        } else if (self.fromDate().isBefore(getFirstPriceDate())) {
            self.fromDate(getFirstPriceDate());
        }

        // Get Price
        self.price().label = self.symbolName();
        self.mainPlotArgs.series.push(self.price());

        // Calculate TA Fastest
        if (self.taFastType() === 'EMA') {
            self.taFastest().data = self.flotFinanceSymbol().getEmaPrice(self.taFastestPeriod(), self.computeScale(), self.enableSplitDetection());
        } else {
            self.taFastest().data = self.flotFinanceSymbol().getSmaPrice(self.taFastestPeriod(), self.computeScale(), self.enableSplitDetection());
        }
        self.mainPlotArgs.series.push(self.taFastest());

        // Calculate TA Fast
        if (self.taFastType() === 'EMA') {
            self.taFast().data = self.flotFinanceSymbol().getEmaPrice(self.taFastPeriod(), self.computeScale(), self.enableSplitDetection());
        } else {
            self.taFast().data = self.flotFinanceSymbol().getSmaPrice(self.taFastPeriod(), self.computeScale(), self.enableSplitDetection());
        }
        self.mainPlotArgs.series.push(self.taFast());

        // Calculate TA Slow
        if (self.taSlowType() === 'EMA') {
            self.taSlow().data = self.flotFinanceSymbol().getEmaPrice(self.taSlowPeriod(), self.computeScale(), self.enableSplitDetection());
        } else {
            self.taSlow().data = self.flotFinanceSymbol().getSmaPrice(self.taSlowPeriod(), self.computeScale(), self.enableSplitDetection());
        }
        self.mainPlotArgs.series.push(self.taSlow());

        // Calculate TA Slower
        if (self.taSlowType() === 'EMA') {
            self.taSlower().data = self.flotFinanceSymbol().getEmaPrice(self.taSlowerPeriod(), self.computeScale(), self.enableSplitDetection());
        } else {
            self.taSlower().data = self.flotFinanceSymbol().getSmaPrice(self.taSlowerPeriod(), self.computeScale(), self.enableSplitDetection());
        }
        self.mainPlotArgs.series.push(self.taSlower());

        // Calculate TA Slowest
        if (self.taSlowType() === 'EMA') {
            self.taSlowest().data = self.flotFinanceSymbol().getEmaPrice(self.taSlowestPeriod(), self.computeScale(), self.enableSplitDetection());
        } else {
            self.taSlowest().data = self.flotFinanceSymbol().getSmaPrice(self.taSlowestPeriod(), self.computeScale(), self.enableSplitDetection());
        }
        self.mainPlotArgs.series.push(self.taSlowest());

        // Get Volume
        if (self.flotFinanceSymbol().hasVolume()) {
            self.volume().data = self.flotFinanceSymbol().getVolume(self.computeScale(), self.enableSplitDetection());
            self.volumePlotArgs.series.push(self.volume());
        }

        // Get RSI
        self.rsi().data = self.flotFinanceSymbol().getRsi(self.rsiPeriod(), self.computeScale(), self.enableSplitDetection());
        self.rsiPlotArgs.series.push(self.rsi());

        // Calculate MACD
        self.macd().data = self.flotFinanceSymbol().getMacd(self.macdFastPeriod(), self.macdSlowPeriod(), self.macdSignalPeriod(), self.computeScale(), self.enableSplitDetection());
        self.macdPlotArgs.series.push(self.macd());

        // Calculate MACD Signal
        self.macdSignal().data = self.flotFinanceSymbol().getMacdSignal(self.macdFastPeriod(), self.macdSlowPeriod(), self.macdSignalPeriod(), self.computeScale(), self.enableSplitDetection());
        self.macdPlotArgs.series.push(self.macdSignal());

        // Calculate MACD Divergence
        self.macdDivergence().data = self.flotFinanceSymbol().getMacdDivergence(self.macdFastPeriod(), self.macdSlowPeriod(), self.macdSignalPeriod(), self.computeScale(), self.enableSplitDetection());
        self.macdPlotArgs.series.push(self.macdDivergence());

        var stop = moment().valueOf();
        var executionTime = stop - start;
        log.debug('Processing data data took ' + executionTime + ' milliseconds');
    };

    self.plot = function () {
        log.debug('Plotting');
        var start = moment().valueOf();
        self.plotMain();
        self.plotVolume();
        self.plotRsi();
        self.plotMacd();
        var stop = moment().valueOf();
        var executionTime = stop - start;
        log.debug('Plotting took ' + executionTime + ' milliseconds');
    };

    self.plotMain = function () {
        log.debug('Plotting Main');
        self.updatePlotAxisMinAndMax();
        self.updatePercentAndHighestAndLowest();
        if (self.showTaFast()) {
            self.taFastest().lines.show = true;
            self.taFastest().label = self.taFastType() + '(' + self.taFastestPeriod() + ')';
            self.taFast().lines.show = true;
            self.taFast().label = self.taFastType() + '(' + self.taFastPeriod() + ')';
        } else {
            self.taFastest().lines.show = false;
            self.taFastest().label = null;
            self.taFast().lines.show = false;
            self.taFast().label = null;
        }
        if (self.showTaSlow()) {
            self.taSlow().lines.show = true;
            self.taSlow().label = self.taSlowType() + '(' + self.taSlowPeriod() + ')';
            self.taSlower().lines.show = true;
            self.taSlower().label = self.taSlowType() + '(' + self.taSlowerPeriod() + ')';
            self.taSlowest().lines.show = true;
            self.taSlowest().label = self.taSlowType() + '(' + self.taSlowestPeriod() + ')';
        } else {
            self.taSlow().lines.show = false;
            self.taSlow().label = null;
            self.taSlower().lines.show = false;
            self.taSlower().label = null;
            self.taSlowest().lines.show = false;
            self.taSlowest().label = null;
        }
        if (self.settings.showXaxisTicksInGrid) {
            self.mainPlotArgs.options.xaxis.tickColor = null;
        } else {
            self.mainPlotArgs.options.xaxis.tickColor = 'transparent';
        }
        if (self.showMacd() || (self.showVolume() && self.hasVolume()) || self.showRsi()) {
            self.mainPlotArgs.options.xaxis.font = {color: 'transparent'};
        } else {
            self.mainPlotArgs.options.xaxis.font = null;
        }
        self.$mainPlot = $.plot(self.mainPlotArgs.placeholder, self.mainPlotArgs.series, self.mainPlotArgs.options);
        $('#hover-info-main-plot').html($('#main-plot .legend tbody').clone());
        $('#main-plot .legend-label-value').remove();
        ko.applyBindings(self, $('#main-plot .legend')[0]);
        ko.applyBindings(self, $('#hover-info-main-plot tbody')[0]);
    };

    self.plotVolume = function () {
        log.debug('Plotting Volume');
        self.updateVolumePlotAxisMinAndMax();
        if (self.showMacd() || self.showRsi()) {
            self.volumePlotArgs.options.xaxis.font = {color: 'transparent'};
        } else {
            self.volumePlotArgs.options.xaxis.font = null;
        }
        if (self.showVolume() && self.hasVolume()) {
            if (self.computeScale() === 'days') {
                self.volume().bars.barWidth = 72000000; // 86400000 == 24h // a day in milliseconds
            } else if (self.computeScale() === 'weeks') {
                self.volume().bars.barWidth = 518400000; // 604800000 == 7 days // a week in milliseconds
            } else if (self.computeScale() === 'months') {
                self.volume().bars.barWidth = 2246400000; // 2419200000 == 28 days // a month in milliseconds
            } else if (self.computeScale() === 'years') {
                self.volume().bars.barWidth = 31017600000; // 31536000000 == 356 days // a year in milliseconds
            }

            if (self.settings.showXaxisTicksInGrid) {
                self.volumePlotArgs.options.xaxis.tickColor = null;
            } else {
                self.volumePlotArgs.options.xaxis.tickColor = 'transparent';
            }

            self.volumePlotArgs.series = [self.volume()];
            $('#volume-plot').css('margin-top', '-26px');
            $('#volume-plot').slideDown('fast', function () {
                self.$volumePlot = $.plot(this, self.volumePlotArgs.series, self.volumePlotArgs.options);
                $('#hover-info-volume-plot').html($('#volume-plot .legend tbody').clone());
                $('#volume-plot .legend-label-value').remove();
                ko.applyBindings(self, $('#volume-plot .legend')[0]);
                ko.applyBindings(self, $('#hover-info-volume-plot tbody')[0]);
            });
        } else {
            $('#volume-plot').slideUp('fast', function () {
                $('#volume-plot').html('');
            });
        }
    };

    self.plotRsi = function () {
        log.debug('Plotting RSI');
        self.updateRsiPlotAxisMinAndMax();
        if (self.showMacd()) {
            self.rsiPlotArgs.options.xaxis.font = {color: 'transparent'};
        } else {
            self.rsiPlotArgs.options.xaxis.font = null;
        }
        if (self.showRsi()) {
            if (self.settings.showXaxisTicksInGrid) {
                self.rsiPlotArgs.options.xaxis.tickColor = null;
            } else {
                self.rsiPlotArgs.options.xaxis.tickColor = 'transparent';
            }
            self.rsi().label = 'RSI(' + self.rsiPeriod() + ')';
            self.rsiPlotArgs.series = [self.rsi()];
            $('#rsi-plot').css('margin-top', '-26px');
            $('#rsi-plot').slideDown('fast', function () {
                self.$rsiPlot = $.plot(this, self.rsiPlotArgs.series, self.rsiPlotArgs.options);
                $('#hover-info-rsi-plot').html($('#rsi-plot .legend tbody').clone());
                $('#rsi-plot .legend-label-value').remove();
                ko.applyBindings(self, $('#rsi-plot .legend')[0]);
                ko.applyBindings(self, $('#hover-info-rsi-plot tbody')[0]);
            });
        } else {
            $('#rsi-plot').slideUp('fast', function () {
                $('#rsi-plot').html('');
            });
        }
    };

    self.plotMacd = function () {
        log.debug('Plotting MACD');
        self.updateMacdPlotAxisMinAndMax();
        if (self.showMacd()) {
            if (self.settings.showXaxisTicksInGrid) {
                self.macdPlotArgs.options.xaxis.tickColor = null;
            } else {
                self.macdPlotArgs.options.xaxis.tickColor = 'transparent';
            }

            self.macd().label = 'MACD(' + self.macdFastPeriod() + ',' + self.macdSlowPeriod() + ')';
            self.macdSignal().label = 'Signal(' + self.macdSignalPeriod() + ')';

            self.macdPlotArgs.series = [self.macdDivergence(), self.macd(), self.macdSignal()];
            $('#macd-plot').css('margin-top', '-26px');
            $('#macd-plot').slideDown('fast', function () {
                self.$macdPlot = $.plot(this, self.macdPlotArgs.series, self.macdPlotArgs.options);
                self.updateProfit();
                $('#hover-info-macd-plot').html($('#macd-plot .legend tbody').clone());
                $('#macd-plot .legend-label-value').remove();
                ko.applyBindings(self, $('#macd-plot .legend')[0]);
                ko.applyBindings(self, $('#hover-info-macd-plot tbody')[0]);
            });
        } else {
            $('#macd-plot').slideUp('fast', function () {
                $('#macd-plot').html('');
            });
        }
    };

    self.updatePlotAxisMinAndMax = function () {
        log.trace('updatePlotAxisMinAndMax()');
        // Update xaxis min/max
        self.mainPlotArgs.options.xaxis.min = self.fromDate();
        self.mainPlotArgs.options.xaxis.max = self.toDate();

        // Find yaxis min/max
        var yaxisMinMax = findYaxisMinMax(self.price(), self.fromDate(), self.toDate());
        if (self.showTaFast()) {
            yaxisMinMax = findYaxisMinMax([self.taFastest(), self.taFast()], self.fromDate(), self.toDate(), yaxisMinMax);
        }
        if (self.showTaSlow()) {
            yaxisMinMax = findYaxisMinMax([self.taSlow(), self.taSlower(), self.taSlowest()], self.fromDate(), self.toDate(), yaxisMinMax);
        }
        yaxisMinMax = addPaddingsToYaxisMinMax(yaxisMinMax, self.settings.paddingFactor);

        // Update yaxis min/max
        if (yaxisMinMax.min < 0) {
            self.mainPlotArgs.options.yaxes[0].min = 0;
        } else {
            self.mainPlotArgs.options.yaxes[0].min = yaxisMinMax.min;
        }
        self.mainPlotArgs.options.yaxes[0].max = yaxisMinMax.max;
    };

    self.updateMacdPlotAxisMinAndMax = function () {
        log.trace('updateMacdPlotAxisMinAndMax()');
        // Update xaxis min/max
        self.macdPlotArgs.options.xaxis.min = self.fromDate();
        self.macdPlotArgs.options.xaxis.max = self.toDate();

        // Find yaxis min/max for left yaxis
        var yaxisLeftMinMax = findYaxisMinMax([self.macd(), self.macdSignal()], self.fromDate(), self.toDate());
        yaxisLeftMinMax = addPaddingsToYaxisMinMax(yaxisLeftMinMax, self.settings.paddingFactor);

        // Update yaxis min/max for left yaxis
        self.macdPlotArgs.options.yaxes[0].min = yaxisLeftMinMax.min;
        self.macdPlotArgs.options.yaxes[0].max = yaxisLeftMinMax.max;

        // Find yaxis min/max for right yaxis
        var yaxisRightMinMax = findYaxisMinMax(self.macdDivergence(), self.fromDate(), self.toDate());
        yaxisRightMinMax = addPaddingsToYaxisMinMax(yaxisRightMinMax, self.settings.paddingFactor);

        // Update yaxis min/max for right yaxis
        self.macdPlotArgs.options.yaxes[1].min = yaxisRightMinMax.min;
        self.macdPlotArgs.options.yaxes[1].max = yaxisRightMinMax.max;
    };

    self.updateVolumePlotAxisMinAndMax = function () {
        log.trace('updateVolumePlotAxisMinAndMax()');
        // Update xaxis min/max
        self.volumePlotArgs.options.xaxis.min = self.fromDate();
        self.volumePlotArgs.options.xaxis.max = self.toDate();

        // Find yaxis min/max for left yaxis
        var yaxisLeftMinMax = findYaxisMinMax(self.volume(), self.fromDate(), self.toDate());
        yaxisLeftMinMax = addPaddingsToYaxisMinMax(yaxisLeftMinMax, self.settings.paddingFactor);

        // Update yaxis min/max for left yaxis
        self.volumePlotArgs.options.yaxes[0].min = 0;
        self.volumePlotArgs.options.yaxes[0].max = yaxisLeftMinMax.max;
    };

    self.updateRsiPlotAxisMinAndMax = function () {
        log.trace('updateRsiPlotAxisMinAndMax()');
        // Update xaxis min/max
        self.rsiPlotArgs.options.xaxis.min = self.fromDate();
        self.rsiPlotArgs.options.xaxis.max = self.toDate();
    };

    self.findClosestDatapoint = function (date) {
        log.trace('findClosestDatapoint()');
        var data = self.mainPlotArgs.series[0].data;
        var minIndex = 0;
        var maxIndex = data.length - 1;
        var currentIndex;
        var currentDate;
        var currentDateToLeft;
        var currentDateToRight;

        while (minIndex <= maxIndex) {
            currentIndex = Math.floor((minIndex + maxIndex) / 2);
            if (data[currentIndex - 1] === undefined) {
                return 0;
            } else if (data[currentIndex + 1] === undefined) {
                return data.length - 1;
            }

            currentDate = data[currentIndex][0].valueOf();
            currentDateToLeft = currentDate - (currentDate - data[currentIndex - 1][0].valueOf()) / 2;
            currentDateToRight = currentDate + (data[currentIndex + 1][0].valueOf() - currentDate) / 2;

            if (date < currentDateToLeft) {
                maxIndex = currentIndex - 1;
            } else if (date >= currentDateToRight) {
                minIndex = currentIndex + 1;
            } else {
                return currentIndex;
            }
        }
        return null;
    };

    self.highestIndex = null;
    self.lowestIndex = null;
    self.updatePercentAndHighestAndLowest = function () {
        log.trace('updateLowestAndHighest()');

        // Find highest and lowest
        var first;
        var last;
        var highest;
        var lowest;
        var data = self.mainPlotArgs.series[0].data;
        $.each(data, function (index, value) {
            if (first === undefined && value[0].valueOf() >= self.mainPlotArgs.options.xaxis.min.valueOf()) {
                first = value[1];
            }
            if (value[0].valueOf() <= self.mainPlotArgs.options.xaxis.max.valueOf()) {
                last = value[1];
            }

            // Check if value is within current time period
            if (value[0].valueOf() >= self.mainPlotArgs.options.xaxis.min.valueOf() && value[0].valueOf() <= self.mainPlotArgs.options.xaxis.max.valueOf()) {
                // Set initial min/max values
                if (highest === undefined) {
                    highest = value[1];
                    self.highestIndex = index;
                    lowest = value[1];
                    self.lowestIndex = index;
                }
                // Update min and max if current value is a new min or max
                if (value[1] > highest) {
                    highest = value[1];
                    self.highestIndex = index;
                } else if (value[1] < lowest) {
                    lowest = value[1];
                    self.lowestIndex = index;
                }
            }
        });
        self.percent((last - first) / first);
        self.highest(highest);
        self.lowest(lowest);
    };

    self.updateProfit = function () {
        log.trace('updateProfit()');

        // Find highest and lowest
        var lastMacd;
        var macd;
        var stocks = 0;
        var money = 1000;
        var profit;
        var data = self.mainPlotArgs.series[0].data;
        $.each(data, function (index, value) {
            if (value[0].valueOf() < self.mainPlotArgs.options.xaxis.min.valueOf() || value[0].valueOf() > self.mainPlotArgs.options.xaxis.max.valueOf()) {
                return true;
            }
            if (index === 0 || self.macdDivergence().data[index][1] === null) {
                return true;
            }
            if (lastMacd === undefined) {
                lastMacd = self.macdDivergence().data[index][1];
                return true;
            }

            macd = self.macdDivergence().data[index][1];
            if (lastMacd < 0 && macd > 0) {
                log.trace('positive trend detected');
                if (money !== 0) {
                    stocks = money / value[1];
                    money = 0;
                    log.trace('bougth for price ' + value[1] + ' on ' + value[0].format());
                }
            } else if (lastMacd > 0 && macd < 0) {
                log.trace('negative trend detected');
                if (stocks !== 0) {
                    money = stocks * value[1];
                    profit = money / 1000 - 1;
                    stocks = 0;
                    log.trace('sold for price ' + value[1] + ' on ' + value[0].format() + ' with profit ' + numeral(profit).format('0.00%'));
                }
            }
            lastMacd = self.macdDivergence().data[index][1];
        });
        self.profit(profit);
    };
    self.computeScale = function () {
        if (self.scale() === 'auto') {
            if (self.timePeriod() === 'all') {
                return self.scaleTimePeriodAll();
            } else if (self.timePeriod() === '10years') {
                return 'months';
            } else if (self.timePeriod() === '3years') {
                return 'months';
            } else if (self.timePeriod() === 'year') {
                return 'weeks';
            } else if (self.timePeriod() === '3months') {
                return 'days';
            } else if (self.timePeriod() === 'month') {
                return 'days';
            } else if (self.timePeriod() === 'week') {
                return 'days';
            } else {
                return self.computeScaleForZoom(self.fromDate(), self.toDate());
            }
        } else {
            return self.scale();
        }
    };

    self.computeScaleForZoom = function (fromDate, toDate) {
        if (toDate.diff(fromDate, 'years', true) >= 50) {
            return 'years';
        } else if (toDate.diff(fromDate, 'years', true) >= 3) {
            return 'months';
        } else if (toDate.diff(fromDate, 'years', true) >= 1) {
            return 'weeks';
        } else {
            return 'days';
        }
    };

    function getFirstPriceDate() {
        return self.price().data[0][0].clone();
    }
    function getLastPriceDate() {
        return self.price().data[self.price().data.length - 1][0].clone();
    }
    function getFromDateForTimePeriod() {
        if (self.timePeriod() === 'all') {
            return getFirstPriceDate();
        } else if (self.timePeriod() === '10years') {
            var tenYearsAgo = self.toDate().clone().subtract(10, 'years');
            if (tenYearsAgo.isBefore(getFirstPriceDate())) {
                return getFirstPriceDate();
            }
            return tenYearsAgo;
        } else if (self.timePeriod() === '3years') {
            var threeYearsAgo = self.toDate().clone().subtract(3, 'years');
            if (threeYearsAgo.isBefore(getFirstPriceDate())) {
                return getFirstPriceDate();
            }
            return threeYearsAgo;
        } else if (self.timePeriod() === 'year') {
            var aYearAgo = self.toDate().clone().subtract(1, 'years');
            if (aYearAgo.isBefore(getFirstPriceDate())) {
                return getFirstPriceDate();
            }
            return aYearAgo;
        } else if (self.timePeriod() === '3months') {
            var threeMonthsAgo = self.toDate().clone().subtract(3, 'months');
            if (threeMonthsAgo.isBefore(getFirstPriceDate())) {
                return getFirstPriceDate();
            }
            return threeMonthsAgo;
        } else if (self.timePeriod() === 'month') {
            var aMonthAgo = self.toDate().clone().subtract(1, 'months');
            if (aMonthAgo.isBefore(getFirstPriceDate())) {
                return getFirstPriceDate();
            }
            return aMonthAgo;
        } else if (self.timePeriod() === 'week') {
            var aWeekAgo = self.toDate().clone().subtract(1, 'weeks');
            if (aWeekAgo.isBefore(getFirstPriceDate())) {
                return getFirstPriceDate();
            }
            return aWeekAgo;
        } else {
            if (self.fromDate() === undefined) {
                return getFirstPriceDate();
            }
            return self.fromDate().clone();
        }
    }
    function getDeltaForTimePeriod(factor) {
        var delta = self.toDate().diff(self.fromDate()) / factor;
        if (moment.duration(delta).asYears() > 1) {
            return {
                timeUnit: 'years',
                value: Math.round(moment.duration(delta).asYears())
            };
        } else if (moment.duration(delta).asMonths() > 1) {
            return {
                timeUnit: 'months',
                value: Math.round(moment.duration(delta).asMonths())
            };
        } else if (moment.duration(delta).asWeeks() > 1) {
            return {
                timeUnit: 'weeks',
                value: Math.round(moment.duration(delta).asWeeks())
            };
        } else if (moment.duration(delta).asDays() > 1) {
            return {
                timeUnit: 'days',
                value: Math.round(moment.duration(delta).asDays())
            };
        } else {
            return {
                timeUnit: 'days',
                value: 1
            };
        }
    }
    function getZoomInDeltaForTimePeriod() {
        return getDeltaForTimePeriod(14);
    }
    function getZoomOutDeltaForTimePeriod() {
        return getDeltaForTimePeriod(12);
    }
    function getPanDeltaForTimePeriod() {
        return getZoomOutDeltaForTimePeriod();
    }
}

console.time('loadingtime');
var viewModel = new ViewModel();
ko.applyBindings(viewModel);
viewModel.init();
console.timeEnd('loadingtime');
