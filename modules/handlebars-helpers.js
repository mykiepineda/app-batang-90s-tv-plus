function ifEquals(value1, value2, options) {
    if (String(value1) === String(value2)) {
        return options.fn(this);
    }
    return options.inverse(this);
}

function truncate(value) {
    if (String(value).length > 50) {
        return `${value.substr(0, 50)}...`;
    }
    return value;
}

module.exports = {
    ifEquals,
    truncate
};