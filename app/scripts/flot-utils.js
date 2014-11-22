function findYaxisMinMax(series, from, to, currentYaxisMinMax) {
    if (!$.isArray(series)) {
        series = [series];
    }
    // Calculate yaxis min/max between from and to xaxis values
    var yaxisMin;
    var yaxisMax;
    if (currentYaxisMinMax !== undefined) {
        yaxisMin = currentYaxisMinMax.min;
        yaxisMax = currentYaxisMinMax.max;
    }

    $.each(series, function (index, serie) {
        $.each(serie.data, function (index, value) {
            // Check for min and max only if value xaxis is between from and to
            if (value[0] > from && value[0] < to && value[1] !== null) {
                // Set initial min/max values
                if (yaxisMin === undefined) {
                    yaxisMin = value[1];
                    yaxisMax = value[1];
                }
                // Update min and max if current value is a new min or max
                if (value[1] < yaxisMin) {
                    yaxisMin = value[1];
                } else if (value[1] > yaxisMax) {
                    yaxisMax = value[1];
                }
            }
        });
    });

    return {min: yaxisMin, max: yaxisMax};
}

function addPaddingsToYaxisMinMax(yaxisMinMax, paddingFactor) {
    var padding = (yaxisMinMax.max - yaxisMinMax.min) * paddingFactor;
    return {
        min: yaxisMinMax.min - padding,
        max: yaxisMinMax.max + padding
    };
}