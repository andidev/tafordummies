function defaultValue(defaultValue, data) {
    if (data === undefined) {
        return defaultValue;
    } else {
        return data;
    }
}

function defaultBooleanValue(defaultValue, data) {
    if (data === undefined) {
        return defaultValue;
    } else {
        if (data === "true") {
            return true;
        }
        return false;
    }
}

function defaultNumberValue(defaultValue, data) {
    if (data === undefined) {
        return defaultValue;
    } else {
        return parseInt(data);
    }
}