//Time function library

function getCurrentTimeString() {
    // current date-time
    let currDate = new Date();
    // get hours and seconds
    let hours = currDate.getHours().toString();
    hours = hours.length > 1 ? hours : '0' + hours;
    let minutes = currDate.getMinutes().toString();
    minutes = minutes.length > 1 ? minutes : "0" + minutes;
    
    return hours + ":" + minutes;
}

function getCurrentDateString() {
    // current date-time
    let currDate = new Date();
    // Year
    let year = currDate.getFullYear();
    // Month
    let month = (currDate.getMonth() + 1).toString();
    month = month.length > 1 ? month : '0' + month;
    // Day
    let day = currDate.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    // return MM/DD/YYYY
    return month + "/" + day + "/" + year;
}

function getMsSinceMidnight(timeStr) {
    // Get current date in string
    let curDateStr = getCurrentDateString();
    // create date with input hours
    let currdate = new Date(curDateStr + " " + timeStr.trim());
    // get the date at zeor hours
    let midnight = new Date(
        currdate.getFullYear(),
        currdate.getMonth(),
        currdate.getDate(),
        0, 0, 0
    )
    // Return milli seconds since midnight
    return currdate.getTime() - midnight.getTime();
}

function getSecondsSinceMidnight(timeStr) {
    let msMidnight = getMsSinceMidnight(timeStr);
    return msMidnight / 1000;
}

function getTimeStr(msSinceMidnight) {
    // Get time componenets
    let totalSeconds = msSinceMidnight / 1000
    // Hours
    let hours = (Math.floor(totalSeconds / 3600)).toString();
    hours = hours.length > 1 ? hours : '0' + hours;
    // Minutes
    totalSeconds %= 3600;
    let minutes = (Math.floor(totalSeconds / 60)).toString();
    minutes = minutes.length > 1 ? minutes : "0" + minutes;
    // seconds
    let seconds = totalSeconds % 60;

    // return HH:MM
    return hours + ":" + minutes;
}

function getMinutesInHours(totalMinutes) {
    
    let timeString = '';

    if (totalMinutes > 60) {
        let hours = (Math.floor(totalMinutes / 60)).toString();
        hours = hours.length > 1 ? hours : '0' + hours;
        let minutes = (totalMinutes - (hours * 60)).toString();
        minutes = minutes.length > 1 ? minutes : "0" + minutes;
        // HH:MM
        timeString = hours + ":" + minutes;
    } else {
        let minutes = totalMinutes.toString();
        minutes = minutes.length > 1 ? minutes : "0" + minutes;
        timeString = minutes;
    }

    // return HH:MM
    return timeString;
}