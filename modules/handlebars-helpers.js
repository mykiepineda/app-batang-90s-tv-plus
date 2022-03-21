function ifEquals(value1, value2, options) {
    if (String(value1) === String(value2)) {
        return options.fn(this);
    }
    return options.inverse(this);
}

module.exports = {
    ifEquals
};