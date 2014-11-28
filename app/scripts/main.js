'use strict';
/* global _ */
/* global flotFinance */
/* global ko */
/* global log */
/* global moment */
/* global numeral */
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
    self.symbolName = ko.computed(function() {
        var symbolName = self.symbol();
        $.each(self.symbols(), function(index, symbol) {
            if (symbol.id === self.symbol()) {
                symbolName = symbol.text;
                return;
            }
        });
        return symbolName;
    });
    self.flotFinanceSymbol = ko.computed(function() {
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
    self.showMa5Ma14 = ko.observable(defaultBooleanValue(true, url.param('showMa5Ma14')));
    self.maFastestDatumPoints = ko.observable(defaultNumberValue(5, url.param('maFastestDatumPoints')));
    self.maFastest = ko.observable({
        label: 'MA(' + self.maFastestDatumPoints() + ')',
        data: [],
        color: 'rgba(51, 120, 190, 0.4)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });
    self.maFastDatumPoints = ko.observable(defaultNumberValue(14, url.param('maFastDatumPoints')));
    self.maFast = ko.observable({
        label: 'MA(' + self.maFastDatumPoints() + ')',
        data: [],
        color: 'rgba(178, 56, 59, 0.4)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });

    self.showMa50Ma100Ma200 = ko.observable(defaultBooleanValue(true, url.param('showMa50Ma100Ma200')));
    self.maSlowDatumPoints = ko.observable(defaultNumberValue(50, url.param('maSlowDatumPoints')));
    self.maSlow = ko.observable({
        label: 'MA(' + self.maSlowDatumPoints() + ')',
        data: [],
        color: 'rgba(0, 0, 0, 0.4)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });
    self.maSlowerDatumPoints = ko.observable(defaultNumberValue(100, url.param('maSlowerDatumPoints')));
    self.maSlower = ko.observable({
        label: 'MA(' + self.maSlowerDatumPoints() + ')',
        data: [],
        color: 'rgba(0, 0, 0, 0.2)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });
    self.maSlowestDatumPoints = ko.observable(defaultNumberValue(200, url.param('maSlowestDatumPoints')));
    self.maSlowest = ko.observable({
        label: 'MA(' + self.maSlowestDatumPoints() + ')',
        data: [],
        color: 'rgba(0, 0, 0, 0.1)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });
    self.showMacd = ko.observable(defaultBooleanValue(false, url.param('showMacd')));
    self.macd = ko.observable({
        label: 'MACD(12,26)',
        data: [],
        color: 'rgba(51, 120, 190, 0.4)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });
    self.macdSignal = ko.observable({
        label: 'Signal(9)',
        data: [],
        color: 'rgba(178, 56, 59, 0.4)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });
    self.macdHistogram = ko.observable({
        label: 'Histogram',
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
    self.hasVolume = ko.computed(function() {
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
    self.showRsi = ko.observable(defaultBooleanValue(false, url.param('showRsi')));
    self.rsiDatumPoints = ko.observable(defaultNumberValue(14, url.param('rsiDatumPoints')));
    self.rsi = ko.observable({
        label: 'RSI(' + self.rsiDatumPoints() + ')',
        data: [],
        color: 'rgba(51, 120, 190, 1)',
        shadowSize: 1,
        lines: {
            show: true,
            lineWidth: 1
        }
    });
    self.enableSplitDetection = ko.observable(defaultBooleanValue(false, url.param('enableSplitDetection')));
    self.scale = ko.observable(defaultValue('days', url.param('scale')));
    self.scaleTimePeriodAll = ko.observable('days');
    self.timePeriod = ko.observable(defaultValue('3years', url.param('timePeriod')));
    self.zoomHistory = ko.observableArray([]);
    self.toDate = ko.observable();
    self.toDateFormatted = ko.computed(function() {
        if (self.toDate() === undefined) {
            return '';
        }
        $('#to-date').datepicker('setDate', self.toDate().toDate());
        return formatDate(self.toDate());
    });
    self.fromDate = ko.observable();
    self.fromDateFormatted = ko.computed(function() {
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
                tickFormatter: function(value, axis){
                    return formatPrice(value, axis.tickDecimals);
                }
            }, {
                position: 'right',
                reserveSpace: true,
                labelWidth: 30,
                color: 'rgba(56, 174, 17, 0.5)',
                tickColor: 'rgba(56, 174, 17, 0.5)',
                tickFormatter: function(value, axis){
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
            position: 'nw',
            labelFormatter: function(label) {
                if (label === self.symbolName()) {
                    return '<span class="legend-label">' + label + '</span> <span class="legend-label-value" data-bind="text: hoverPriceFormatted, visible: hoverPrice"></span>';
                } else if (label === 'MA(' + self.maFastestDatumPoints() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverMaFastestFormatted, visible: hoverMaFastest"></span>';
                } else if (label === 'MA(' + self.maFastDatumPoints() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverMaFastFormatted, visible: hoverMaFast"></span>';
                } else if (label === 'MA(' + self.maSlowDatumPoints() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverMaSlowFormatted, visible: hoverMaSlow"></span>';
                } else if (label === 'MA(' + self.maSlowerDatumPoints() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverMaSlowerFormatted, visible: hoverMaSlower"></span>';
                } else if (label === 'MA(' + self.maSlowestDatumPoints() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverMaSlowestFormatted, visible: hoverMaSlowest"></span>';
                } else if (label === 'Volume') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverVolumeFormatted, visible: hoverVolume"></span>';
                } else if (label === 'RSI(' + self.rsiDatumPoints() + ')') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverRsiFormatted, visible: hoverRsi"></span>';
                } else if (label === 'Histogram') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverMacdFormatted, visible: hoverMacd"></span>';
                } else if (label === 'MACD(12,26)') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverMacdSignalFormatted, visible: hoverMacdSignal"></span>';
                } else if (label === 'Signal(9)') {
                    return '<span class="legend-label">' + label + '</span>  <span class="legend-label-value" data-bind="text: hoverMacdHistogramFormatted, visible: hoverMacdHistogram"></span>';
                } else {
                    return label;
                }
            }
        },
        highlightColor: '#428bca'
    };
    self.plotArgs = {
        placeholder: $('#plot'),
        series: [],
        options: jQuery.extend(true, {}, self.commonPlotOptions)
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
    self.$plot = null;
    self.$macdPlot = null;
    self.$volumePlot = null;
    self.$rsiPlot = null;

    self.percent = ko.observable(0);
    self.percentFormatted = ko.computed(function() {
        return formatPercent(self.percent());
    });
    self.percentArrowClass = ko.computed(function() {
        if (self.percent() > 0) {
            return 'fa-arrow-up';
        } else if (self.percent() < 0) {
            return 'fa-arrow-down';
        } else {
            return 'fa-arrow-right';
        }
    });
    self.percentColorClass = ko.computed(function() {
        if (self.percent() > 0) {
            return 'text-success';
        } else if (self.percent() < 0) {
            return 'text-danger';
        } else {
            return '';
        }
    });
    self.highest = ko.observable(0);
    self.highestFormatted = ko.computed(function() {
        return formatPrice(self.highest());
    });
    self.lowest = ko.observable(0);
    self.lowestFormatted = ko.computed(function() {
        return formatPrice(self.lowest());
    });
    self.profit = ko.observable();
    self.profitFormatted = ko.computed(function() {
        return formatPercent(self.profit());
    });
    self.profitColorClass = ko.computed(function() {
        if (self.profit() > 0) {
            return 'text-success';
        } else if (self.profit() < 0) {
            return 'text-danger';
        } else {
            return '';
        }
    });

    // Behaviors
    self.changeScaleToAuto = function() {
        if (self.scale() !== 'auto') {
            log.info('Changing scale to Auto');
            self.scale('auto');
            self.processData();
            self.plot();
        }
    };
    self.changeScaleToDays = function() {
        if (self.scale() !== 'days') {
            log.info('Changing scale to Days');
            self.scale('days');
            self.processData();
            self.plot();
        }
    };
    self.changeScaleToWeeks = function() {
        if (self.scale() !== 'weeks') {
            log.info('Changing scale to Weeks');
            self.scale('weeks');
            self.processData();
            self.plot();
        }
    };
    self.changeScaleToMonths = function() {
        if (self.scale() !== 'months') {
            log.info('Changing scale to Months');
            self.scale('months');
            self.processData();
            self.plot();
        }
    };
    self.changeScaleToYears = function() {
        if (self.scale() !== 'years') {
            log.info('Changing scale to Years');
            self.scale('years');
            self.processData();
            self.plot();
        }
    };

    self.changeTimePeriodToAll = function() {
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
    self.changeTimePeriodTo10Years = function() {
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
    self.changeTimePeriodTo3Years = function() {
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
    self.changeTimePeriodToYear = function() {
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
    self.changeTimePeriodTo3Months = function() {
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
    self.changeTimePeriodToMonth = function() {
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
    self.changeTimePeriodToWeek = function() {
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

    self.toggleVolume = function() {
        if (self.showVolume() === true) {
            log.info('Hiding Volume');
            self.showVolume(false);
        } else {
            log.info('Showing Volume');
            self.showVolume(true);
        }
        self.plot();
    };
    self.toggleRsi = function() {
        if (self.showRsi() === true) {
            log.info('Hiding RSI');
            self.showRsi(false);
        } else {
            log.info('Showing RSI');
            self.showRsi(true);
        }
        self.plot();
    };
    self.toggleSplitDetection = function() {
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
    self.toggleMa5Ma14 = function() {
        if (self.showMa5Ma14() === true) {
            log.info('Hiding MA(' + self.maFastestDatumPoints() + ',' + self.maFastDatumPoints() + ')');
            self.showMa5Ma14(false);
        } else {
            log.info('Showing MA(' + self.maFastestDatumPoints() + ',' + self.maFastDatumPoints() + ')');
            self.showMa5Ma14(true);
        }
        self.plot();
    };
    self.toggleMa50Ma100Ma200 = function() {
        if (self.showMa50Ma100Ma200() === true) {
            log.info('Hiding MA(' + self.maSlowDatumPoints() + ',' + self.maSlowerDatumPoints() + ',' + self.maSlowestDatumPoints() + ')');
            self.showMa50Ma100Ma200(false);
        } else {
            log.info('Showing MA(' + self.maSlowDatumPoints() + ',' + self.maSlowerDatumPoints() + ',' + self.maSlowestDatumPoints() + ')');
            self.showMa50Ma100Ma200(true);
        }
        self.plot();
    };
    self.toggleMacd = function() {
        if (self.showMacd() === true) {
            log.info('Hiding MACD(12,26,9)');
            self.showMacd(false);
        } else {
            log.info('Showing MACD(12,26,9)');
            self.showMacd(true);
        }
        self.plot();
    };


    self.slideRsi = function(viewModel, event) {
        log.trace('Sliding RSI');
        var newDatumPoints = event.value;
        if (self.rsiDatumPoints() !== newDatumPoints) {
            log.info('Updating RSI to RSI(' + newDatumPoints + ')');
            self.rsiDatumPoints(newDatumPoints);
            self.processData();
            self.plot();
        }
    };
    self.slideMaFastest = function(viewModel, event) {
        log.trace('Sliding MA Fastest');
        var newDatumPoints = event.value;
        if (self.maFastestDatumPoints() !== newDatumPoints) {
            log.info('Updating MA Fastest to MA(' + newDatumPoints + ')');
            self.maFastestDatumPoints(newDatumPoints);
            self.processData();
            self.plot();
        }
    };
    self.slideMaFast = function(viewModel, event) {
        log.trace('Sliding MA Fast');
        var newDatumPoints = event.value;
        if (self.maFastDatumPoints() !== newDatumPoints) {
            log.info('Updating MA Fast to MA(' + newDatumPoints + ')');
            self.maFastDatumPoints(newDatumPoints);
            self.processData();
            self.plot();
        }
    };
    self.slideMaSlow = function(viewModel, event) {
        log.trace('Sliding MA Slow');
        var newDatumPoints = event.value;
        if (self.maSlowDatumPoints() !== newDatumPoints) {
            log.info('Updating MA Slow to MA(' + newDatumPoints + ')');
            self.maSlowDatumPoints(newDatumPoints);
            self.processData();
            self.plot();
        }
    };
    self.slideMaSlower = function(viewModel, event) {
        log.trace('Sliding MA Slower');
        var newDatumPoints = event.value;
        if (self.maSlowerDatumPoints() !== newDatumPoints) {
            log.info('Updating MA Slower to MA(' + newDatumPoints + ')');
            self.maSlowerDatumPoints(newDatumPoints);
            self.processData();
            self.plot();
        }
    };
    self.slideMaSlowest = function(viewModel, event) {
        log.trace('Sliding MA Slowest');
        var newDatumPoints = event.value;
        if (self.maSlowestDatumPoints() !== newDatumPoints) {
            log.info('Updating MA Slowest to MA(' + newDatumPoints + ')');
            self.maSlowestDatumPoints(newDatumPoints);
            self.processData();
            self.plot();
        }
    };

    self.updateFromDate = function(date) {
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
    self.updateToDate = function(date) {
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

    self.changeFromDate = function(viewModel, event) {
        var isFromDateUpdated = !moment(event.date).isSame(self.fromDate());
        if (isFromDateUpdated) {
            log.info('Changing From Date to ' + formatDate(moment(event.date)));
            self.updateFromDate(moment(event.date));
            self.timePeriod('custom');
            self.processData();
            self.plot();
        }
    };
    self.changeToDate = function(viewModel, event) {
        var isToDateUpdated = !moment(event.date).isSame(self.toDate());
        if (isToDateUpdated) {
            log.info('Changing To Date to ' + formatDate(moment(event.date)));
            self.updateToDate(moment(event.date));
            self.timePeriod('custom');
            self.processData();
            self.plot();
        }
    };

    self.zoomSelectionFrom = null;
    self.zoomSelectionTo = null;
    self.mouseDown = function(viewModel, event) {
        log.trace('Mouse key pressed, which = ' + event.which);
        if (event.which === 1) {
            log.trace('Left mouse key pressed');
            self.zoomSelectionFrom = event.clientX;
        }
    };
    self.mouseMove = function(viewModel, event) {
        if (event.which === 1) {
            log.trace('Mouse is moved with left mouse key pressed');
            self.zoomSelectionTo = event.clientX;
        }
    };
    self.zoomSelection = function(viewModel, event, ranges) {
        log.trace('Zooming selection');
        var zoomDirection = (self.zoomSelectionTo - self.zoomSelectionFrom) < 0 ? 'left' : 'right';
        var fromIndex = self.findClosestDatapoint(ranges.xaxis.from);
        var toIndex = self.findClosestDatapoint(ranges.xaxis.to);
        if ((toIndex - fromIndex) >= 2) {
            if (zoomDirection === 'left') {
                self.undoZoom();
            } else if (zoomDirection === 'right'){
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
            self.$plot.clearSelection();
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
    self.syncSelectionInPlot = function(viewModel, event, ranges) {
        if (ranges !== null) {
            if (event.currentTarget.id !== 'plot') {
                self.$plot.setSelection(ranges, true);
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

    self.scrollPanZoom = _.throttle(function(viewModel, event) {
        if (event.ctrlKey) {
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
    self.undoZoom = function() {
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
    self.zoomOut = function() {
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
    self.zoomIn = function() {
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

    self.panLeft = function() {
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
    self.panRight = function() {
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
    self.ctrlKeyDown = false;
    self.keyboardShortcutsHandler = _.throttle(function(viewModel, event) {
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
        } else if (keyCode === 27) { // Escape
            log.trace('Escape key pressed');
            self.changeTimePeriodToAll();
            return false;
        } else if (keyCode === 8) { // Backspace
            log.trace('Backspace key pressed');
            self.undoZoom();
            return false;
        } else if (keyCode === 17) { // Ctrl
            log.trace('Ctrl key pressed');
            self.ctrlKeyDown = true;
            self.hoverDate(self.hoverDate()); // Refresh hover date
            return true;
        }
        return true;
    });
    self.resetCtrlKeyDown = _.throttle(function(viewModel, event) {
        var keyCode = (event.which ? event.which : event.keyCode);
        if (keyCode === 17) { // Ctrl
            log.debug('Ctrl key released');
            self.ctrlKeyDown = false;
            self.hoverDate(self.hoverDate()); // Refresh hover date
            return true;
        }
        return true;
    });

    self.previousPriceInfoIndex = null;
    self.hoverPercent = ko.observable('');
    self.hoverPercentFormatted = ko.computed(function() {
        return formatPercent(self.hoverPercent());
    });
    self.hoverPercentArrowClass = ko.computed(function() {
        if (self.hoverPercent() > 0) {
            return 'fa-arrow-up';
        } else if (self.hoverPercent() < 0) {
            return 'fa-arrow-down';
        } else {
            return 'fa-arrow-right';
        }
    });
    self.hoverPercentColorClass = ko.computed(function() {
        if (self.hoverPercent() > 0) {
            return 'text-success';
        } else if (self.hoverPercent() < 0) {
            return 'text-danger';
        } else {
            return '';
        }
    });
    self.hoverPrice = ko.observable();
    self.hoverPriceFormatted = ko.computed(function() {
        return formatPrice(self.hoverPrice());
    });
    self.hoverMaFastest = ko.observable();
    self.hoverMaFastestFormatted = ko.computed(function() {
        return formatPrice(self.hoverMaFastest());
    });
    self.hoverMaFast = ko.observable();
    self.hoverMaFastFormatted = ko.computed(function() {
        return formatPrice(self.hoverMaFast());
    });
    self.hoverMaSlow = ko.observable();
    self.hoverMaSlowFormatted = ko.computed(function() {
        return formatPrice(self.hoverMaSlow());
    });
    self.hoverMaSlower = ko.observable();
    self.hoverMaSlowerFormatted = ko.computed(function() {
        return formatPrice(self.hoverMaSlower());
    });
    self.hoverMaSlowest = ko.observable();
    self.hoverMaSlowestFormatted = ko.computed(function() {
        return formatPrice(self.hoverMaSlowest());
    });
    self.hoverVolume = ko.observable();
    self.hoverVolumeFormatted = ko.computed(function() {
        return formatNumber(self.hoverVolume());
    });
    self.hoverRsi = ko.observable();
    self.hoverRsiFormatted = ko.computed(function() {
        return formatPrice(self.hoverRsi());
    });
    self.hoverMacd = ko.observable();
    self.hoverMacdFormatted = ko.computed(function() {
        return formatPrice(self.hoverMacd());
    });
    self.hoverMacdSignal = ko.observable();
    self.hoverMacdSignalFormatted = ko.computed(function() {
        return formatPrice(self.hoverMacdSignal());
    });
    self.hoverMacdHistogram = ko.observable();
    self.hoverMacdHistogramFormatted = ko.computed(function() {
        return formatPrice(self.hoverMacdHistogram());
    });
    self.hoverDate = ko.observable();
    self.hoverDateFormatted = ko.computed(function() {
        if (self.hoverDate() === undefined) {
            return '';
        } else if (self.ctrlKeyDown) {
            // Show detailed format
            return formatLongDate(self.hoverDate());
        } else {
            return formatDate(self.hoverDate());
        }
    });
    self.showPriceInfo = function(viewModel, event, pos) {
        if (self.$plot) {
            var priceInfoIndex = self.findClosestDatapoint(pos.x);
            if (priceInfoIndex !== self.previousPriceInfoIndex) {
                log.trace('Showing price info');
                self.$plot.unhighlight(0, self.previousPriceInfoIndex);
                var date = self.plotArgs.series[0].data[priceInfoIndex][0];
                var price = self.plotArgs.series[0].data[priceInfoIndex][1];
                var priceToTheLeft = priceInfoIndex > 0 ? self.plotArgs.series[0].data[priceInfoIndex - 1][1] : null;

                // Lock the crosshair to the closest data point being hovered
                self.$plot.lockCrosshair({
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
                self.$plot.highlight(0, priceInfoIndex);

                var percent = null;
                if (priceToTheLeft !== null) {
                    percent = (price - priceToTheLeft) / priceToTheLeft;
                }
                self.hoverPercent(percent);
                self.hoverPrice(price);
                self.hoverMaFastest(self.plotArgs.series[1].data[priceInfoIndex][1]);
                self.hoverMaFast(self.plotArgs.series[2].data[priceInfoIndex][1]);
                self.hoverMaSlow(self.plotArgs.series[3].data[priceInfoIndex][1]);
                self.hoverMaSlower(self.plotArgs.series[4].data[priceInfoIndex][1]);
                self.hoverMaSlowest(self.plotArgs.series[5].data[priceInfoIndex][1]);
                if (self.showVolume() && self.hasVolume() && self.$volumePlot) {
                    self.hoverVolume(self.volumePlotArgs.series[0].data[priceInfoIndex][1]);
                }
                if (self.showRsi() && self.$rsiPlot) {
                    self.hoverRsi(self.rsiPlotArgs.series[0].data[priceInfoIndex][1]);
                }
                if (self.showMacd() && self.$macdPlot) {
                    self.hoverMacd(self.macdPlotArgs.series[0].data[priceInfoIndex][1]);
                    self.hoverMacdHistogram(self.macdPlotArgs.series[1].data[priceInfoIndex][1]);
                    self.hoverMacdSignal(self.macdPlotArgs.series[2].data[priceInfoIndex][1]);
                }
                self.hoverDate(date);
                $('#hover-info').show();
                self.previousPriceInfoIndex = priceInfoIndex;
            }
        }
    };

    self.hidePriceInfo = function() {
        if (self.$plot) {
            self.$plot.clearCrosshair();
            self.hoverPrice('');
            self.hoverMaFastest('');
            self.hoverMaFast('');
            self.hoverMaSlow('');
            self.hoverMaSlower('');
            self.hoverMaSlowest('');
            if (self.showVolume() && self.hasVolume() && self.$volumePlot) {
                self.$volumePlot.clearCrosshair();
                self.hoverVolume('');
            }
            if (self.showRsi() && self.$rsiPlot) {
                self.$rsiPlot.clearCrosshair();
                self.hoverRsi('');
            }
            if (self.showMacd() && self.$macdPlot) {
                self.$macdPlot.clearCrosshair();
                self.hoverMacd('');
                self.hoverMacdHistogram('');
                self.hoverMacdSignal('');
            }
            self.$plot.unhighlight(0, self.previousPriceInfoIndex);
            $('#hover-info').hide();
            self.previousPriceInfoIndex = null;
        }
    };

    // Functions
    self.init = function() {
        self.symbol(defaultValue('^OMX', url.param('symbol')));
        $('#symbol').select2({
            width: '200px',
            data: function() {
                var data = [];
                $(self.symbols()).each(function(index, symbol) {
                    data.push(symbol);
                });
                return {text: 'text', results: data};
            },
            createSearchChoice: function(term, data) {
                if ($(data).filter(function() {
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
        $('#symbol').on('change', function(event) {
            self.symbol(event.val);
            self.scaleTimePeriodAll('days');
            self.processData();
            self.plot();
        });

        self.processData();
        self.plot();
        $('#ta-plots').mousemove(function (event) {
            var distanceToPlotRight = $(window).width() - (event.pageX + 10);
            var plotHoverWidth = $('#hover-info').outerWidth();
            if (distanceToPlotRight < plotHoverWidth) {
                $('#hover-info').css({
                    top: event.pageY + 10,
                    left: $(window).width() - $('#hover-info').outerWidth()
                });
            } else {
                $('#hover-info').removeAttr('right').css({
                    top: event.pageY + 10,
                    left: event.pageX + 10
                });
            }
        });
    };

    self.processData = function() {
        log.debug('Processing data');
        var start = moment().valueOf();

        self.plotArgs.series = [];
        self.price().data = self.flotFinanceSymbol().getClosePrice(self.computeScale(), self.enableSplitDetection());

        if (self.scale() === 'auto' && self.timePeriod() === 'all') {
            // Set time period all and reload data
            self.scaleTimePeriodAll(self.computeScaleForZoom(getFirstPriceDate(), getLastPriceDate()));
            self.price().data = (self.flotFinanceSymbol().getClosePrice(self.computeScale(), self.enableSplitDetection()));
        }

        if (self.toDate() === undefined) {
            self.toDate(getLastPriceDate());
        }
        if (self.fromDate() === undefined) {
            self.fromDate(getFromDateForTimePeriod());
        }

        // Get Price
        self.price().label = self.symbolName();
        self.plotArgs.series.push(self.price());

        // Get Volume
        if (self.flotFinanceSymbol().hasVolume()) {
            self.volume().data = self.flotFinanceSymbol().getVolume(self.computeScale(), self.enableSplitDetection());
            self.volumePlotArgs.series.push(self.volume());
        }

        // Get RSI
        self.rsi().data = self.flotFinanceSymbol().getRsi(self.rsiDatumPoints(), self.computeScale(), self.enableSplitDetection());
        self.rsiPlotArgs.series.push(self.rsi());

        // Calculate MA Fastest
        self.maFastest().data = self.flotFinanceSymbol().getMaPrice(self.maFastestDatumPoints(), self.computeScale(), self.enableSplitDetection());
        self.plotArgs.series.push(self.maFastest());

        // Calculate MA Fast
        self.maFast().data = self.flotFinanceSymbol().getMaPrice(self.maFastDatumPoints(), self.computeScale(), self.enableSplitDetection());
        self.plotArgs.series.push(self.maFast());

        // Calculate MA Slow
        self.maSlow().data = self.flotFinanceSymbol().getMaPrice(self.maSlowDatumPoints(), self.computeScale(), self.enableSplitDetection());
        self.plotArgs.series.push(self.maSlow());

        // Calculate MA Slower
        self.maSlower().data = self.flotFinanceSymbol().getMaPrice(self.maSlowerDatumPoints(), self.computeScale(), self.enableSplitDetection());
        self.plotArgs.series.push(self.maSlower());

        // Calculate MA Slowest
        self.maSlowest().data = self.flotFinanceSymbol().getMaPrice(self.maSlowestDatumPoints(), self.computeScale(), self.enableSplitDetection());
        self.plotArgs.series.push(self.maSlowest());

        // Calculate MACD
        self.macd().data = self.flotFinanceSymbol().getMacd(26, 12, 9, self.computeScale(), self.enableSplitDetection());
        self.macdPlotArgs.series.push(self.macd());

        // Calculate MACD Signal
        self.macdSignal().data = self.flotFinanceSymbol().getMacdSignal(26, 12, 9, self.computeScale(), self.enableSplitDetection());
        self.macdPlotArgs.series.push(self.macdSignal());

        // Calculate MACD Histogram
        self.macdHistogram().data = self.flotFinanceSymbol().getMacdHistogram(26, 12, 9, self.computeScale(), self.enableSplitDetection());
        self.macdPlotArgs.series.push(self.macdHistogram());

        var stop = moment().valueOf();
        var executionTime = stop - start;
        log.debug('Processing data data took ' + executionTime + ' milliseconds');
    };

    self.plot = function() {
        log.debug('Plotting');
        var start = moment().valueOf();
        self.plotMain();
        self.plotMacd();
        self.plotVolume();
        self.plotRsi();
        var stop = moment().valueOf();
        var executionTime = stop - start;
        log.debug('Plotting took ' + executionTime + ' milliseconds');
    };

    self.plotMain = function() {
        log.debug('Plotting Main');
        self.updatePlotAxisMinAndMax();
        self.updatePercentAndHighestAndLowest();
        if (self.showMa5Ma14()) {
            self.maFastest().lines.show = true;
            self.maFastest().label = 'MA(' + self.maFastestDatumPoints() + ')';
            self.maFast().lines.show = true;
            self.maFast().label = 'MA(' + self.maFastDatumPoints() + ')';
        } else {
            self.maFastest().lines.show = false;
            self.maFastest().label = null;
            self.maFast().lines.show = false;
            self.maFast().label = null;
        }
        if (self.showMa50Ma100Ma200()) {
            self.maSlow().lines.show = true;
            self.maSlow().label = 'MA(' + self.maSlowDatumPoints() + ')';
            self.maSlower().lines.show = true;
            self.maSlower().label = 'MA(' + self.maSlowerDatumPoints() + ')';
            self.maSlowest().lines.show = true;
            self.maSlowest().label = 'MA(' + self.maSlowestDatumPoints() + ')';
        } else {
            self.maSlow().lines.show = false;
            self.maSlow().label = null;
            self.maSlower().lines.show = false;
            self.maSlower().label = null;
            self.maSlowest().lines.show = false;
            self.maSlowest().label = null;
        }
        if (self.settings.showXaxisTicksInGrid) {
            self.plotArgs.options.xaxis.tickColor = null;
        } else {
            self.plotArgs.options.xaxis.tickColor = 'transparent';
        }
        if (self.showMacd() || (self.showVolume() && self.hasVolume()) || self.showRsi()) {
            self.plotArgs.options.xaxis.font = {color: 'transparent'};
        } else {
            self.plotArgs.options.xaxis.font = null;
        }
        self.$plot = $.plot(self.plotArgs.placeholder, self.plotArgs.series, self.plotArgs.options);
        $('#plot').find('.legend').each(function (index, element) {
            ko.applyBindings(self, element);
        });
    };

    self.plotMacd = function() {
        log.debug('Plotting MACD');
        self.updateMacdPlotAxisMinAndMax();
        if (self.showMacd()) {
            if (self.settings.showXaxisTicksInGrid) {
                self.macdPlotArgs.options.xaxis.tickColor = null;
            } else {
                self.macdPlotArgs.options.xaxis.tickColor = 'transparent';
            }

            self.macdPlotArgs.series = [self.macdHistogram(), self.macd(), self.macdSignal()];
            $('#macd-plot').css('margin-top', '-26px');
            $('#macd-plot').slideDown('fast', function() {
                self.$macdPlot = $.plot(this, self.macdPlotArgs.series, self.macdPlotArgs.options);
                self.updateProfit();
                $(this).find('.legend').each(function (index, element) {
                    ko.applyBindings(self, element);
                });
            });
        } else {
            $('#macd-plot').slideUp('fast', function() {
                $('#macd-plot').html('');
            });
        }
    };

    self.plotVolume = function() {
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
            $('#volume-plot').slideDown('fast', function() {
                self.$volumePlot = $.plot(this, self.volumePlotArgs.series, self.volumePlotArgs.options);
                $(this).find('.legend').each(function (index, element) {
                    ko.applyBindings(self, element);
                });
            });
        } else {
            $('#volume-plot').slideUp('fast', function() {
                $('#volume-plot').html('');
            });
        }
    };

    self.plotRsi = function() {
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
            self.rsiPlotArgs.series = [self.rsi()];
            $('#rsi-plot').css('margin-top', '-26px');
            $('#rsi-plot').slideDown('fast', function() {
                self.$rsiPlot = $.plot(this, self.rsiPlotArgs.series, self.rsiPlotArgs.options);
                $(this).find('.legend').each(function (index, element) {
                    ko.applyBindings(self, element);
                });
            });
        } else {
            $('#rsi-plot').slideUp('fast', function() {
                $('#rsi-plot').html('');
            });
        }
    };

    self.updatePlotAxisMinAndMax = function() {
        log.trace('updatePlotAxisMinAndMax()');
        // Update xaxis min/max
        self.plotArgs.options.xaxis.min = self.fromDate();
        self.plotArgs.options.xaxis.max = self.toDate();

        // Find yaxis min/max
        var yaxisMinMax = findYaxisMinMax(self.price(), self.fromDate(), self.toDate());
        if (self.showMa5Ma14()) {
            yaxisMinMax = findYaxisMinMax([self.maFastest(), self.maFast()], self.fromDate(), self.toDate(), yaxisMinMax);
        }
        if (self.showMa50Ma100Ma200()) {
            yaxisMinMax = findYaxisMinMax([self.maSlow(), self.maSlower(), self.maSlowest()], self.fromDate(), self.toDate(), yaxisMinMax);
        }
        yaxisMinMax = addPaddingsToYaxisMinMax(yaxisMinMax, self.settings.paddingFactor);

        // Update yaxis min/max
        self.plotArgs.options.yaxes[0].min = yaxisMinMax.min;
        self.plotArgs.options.yaxes[0].max = yaxisMinMax.max;
    };

    self.updateMacdPlotAxisMinAndMax = function() {
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
        var yaxisRightMinMax = findYaxisMinMax(self.macdHistogram(), self.fromDate(), self.toDate());
        yaxisRightMinMax = addPaddingsToYaxisMinMax(yaxisRightMinMax, self.settings.paddingFactor);

        // Update yaxis min/max for right yaxis
        self.macdPlotArgs.options.yaxes[1].min = yaxisRightMinMax.min;
        self.macdPlotArgs.options.yaxes[1].max = yaxisRightMinMax.max;
    };

    self.updateVolumePlotAxisMinAndMax = function() {
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

    self.updateRsiPlotAxisMinAndMax = function() {
        log.trace('updateRsiPlotAxisMinAndMax()');
        // Update xaxis min/max
        self.rsiPlotArgs.options.xaxis.min = self.fromDate();
        self.rsiPlotArgs.options.xaxis.max = self.toDate();
   };

    self.findClosestDatapoint = function(date) {
        log.trace('findClosestDatapoint()');
        var data = self.plotArgs.series[0].data;
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
    self.updatePercentAndHighestAndLowest = function() {
        log.trace('updateLowestAndHighest()');

        // Find highest and lowest
        var first;
        var last;
        var highest;
        var lowest;
        var data = self.plotArgs.series[0].data;
        $.each(data, function(index, value) {
            if (first === undefined && value[0].valueOf() >= self.plotArgs.options.xaxis.min.valueOf()) {
                first = value[1];
            }
            if (value[0].valueOf() <= self.plotArgs.options.xaxis.max.valueOf()) {
                last = value[1];
            }

            // Check if value is within current time period
            if (value[0].valueOf() >= self.plotArgs.options.xaxis.min.valueOf() && value[0].valueOf() <= self.plotArgs.options.xaxis.max.valueOf()) {
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

    self.updateProfit = function() {
        log.trace('updateProfit()');

        // Find highest and lowest
        var lastMacd;
        var macd;
        var stocks = 0;
        var money = 1000;
        var profit;
        var data = self.plotArgs.series[0].data;
        $.each(data, function(index, value) {
            if (value[0].valueOf() < self.plotArgs.options.xaxis.min.valueOf() || value[0].valueOf() > self.plotArgs.options.xaxis.max.valueOf()) {
                return true;
            }
            if (index === 0 || self.macdHistogram().data[index][1] === null) {
                return true;
            }
            if (lastMacd === undefined) {
                lastMacd = self.macdHistogram().data[index][1];
                return true;
            }

            macd = self.macdHistogram().data[index][1];
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
            lastMacd = self.macdHistogram().data[index][1];
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
            return self.price().data[0][0].clone();
        } else if (self.timePeriod() === '10years') {
            return self.toDate().clone().subtract(10, 'years');
        } else if (self.timePeriod() === '3years') {
            return self.toDate().clone().subtract(3, 'years');
        } else if (self.timePeriod() === 'year') {
            return self.toDate().clone().subtract(1, 'years');
        } else if (self.timePeriod() === '3months') {
            return self.toDate().clone().subtract(3, 'months');
        } else if (self.timePeriod() === 'month') {
            return self.toDate().clone().subtract(1, 'months');
        } else if (self.timePeriod() === 'week') {
            return self.toDate().clone().subtract(1, 'weeks');
        } else {
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
