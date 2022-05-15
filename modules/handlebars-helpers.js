function ifEquals(value1, value2, options) {
    if (String(value1) === String(value2)) {
        return options.fn(this);
    }
    return options.inverse(this);
}

function truncate(value) {
    if (String(value).length > 50) {
        return `${value.substr(0, 50)}... <u>more</u>`;
    }
    return value;
}

function formatDate(date) {

    // Wrap in Date object
    const serialisedDate = new Date(date);
    const yearComponent = serialisedDate.getFullYear();
    const dayComponent = serialisedDate.getDate();
    const monthComponent = serialisedDate.getMonth() + 1;
    const monthLongDescriptions = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const monthShortDescriptions = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    let dayString = String(dayComponent);
    if (dayComponent < 10) {
        dayString = dayString.padStart(2, "0");
    }

    let monthString = String(monthComponent);
    if (monthComponent < 10) {
        monthString = monthString.padStart(2, "0");
    }

    // Month DD, YYYY
    return `${monthShortDescriptions[monthComponent-1]} ${dayString}, ${yearComponent}`;
}

function getSeasonsDescription(array, index, stripWhitespace) {

    let description = "";

    for (let i = 0; array.length; i++) {
        if (i === index - 1) {
            description = array[i];
            break;
        }
    }

    if (stripWhitespace) {
        return description.replace(/\s/g, '');
    }
    return description;
}

module.exports = {
    ifEquals,
    truncate,
    formatDate,
    getSeasonsDescription
};