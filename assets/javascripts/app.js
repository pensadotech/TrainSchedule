// Train Schedule java scripts

// Firebase Configuration
var config = {
    apiKey: "AIzaSyDSKdLUm9h_eqDEGcn6XIrKUWhP11MIKCA",
    authDomain: "trainschedule-ec927.firebaseapp.com",
    databaseURL: "https://trainschedule-ec927.firebaseio.com",
    projectId: "trainschedule-ec927",
    storageBucket: "",
    messagingSenderId: "754223858796"
};

// Initialize Firebase
firebase.initializeApp(config);

// create a variable named database to store your db connection
const db = firebase.database();

// Create a reference to train scheulde folder
let trainSchRef = db.ref('trainSchedule');

function addTrainSchedule() {

    // Control default behavior for "submit" button
    event.preventDefault();

    // Retreive data from screen
    let trainName = document.getElementById("tName").value.trim();
    let trainDestination = document.getElementById("tDestination").value.trim();
    let fstTrainTime = document.getElementById("tFirstTime").value.trim();
    let trainFreq = document.getElementById("tFreq").value.trim();

    // create nnew train scheduel obj
    let newTrainSchedule = {
        trainName: trainName,
        destination: trainDestination,
        fstTrainTime: fstTrainTime,
        frequency: trainFreq
    }

    // add new record into the database
    trainSchRef.push(newTrainSchedule);

    // Logs everything to console
    console.log(newTrainSchedule.trainName);
    console.log(newTrainSchedule.destination);
    console.log(newTrainSchedule.firstTmeUTC);
    console.log(newTrainSchedule.frequency);

    // Clears all of the text-boxes
    document.getElementById("tName").value = '';
    document.getElementById("tDestination").value = '';
    document.getElementById("tFirstTime").value = '';
    document.getElementById("tFreq").value = '';

    // Collapse panel
    var addTrainButton = document.getElementById("addButton");
    addTrainButton.click();
}

trainSchRef.on('child_added', data => {

    // use val() to retrieve the objects
    const trainSchedule = data.val();
    // console.log(trainSchedule);

    if (trainSchedule != null) {
        // Store everything into a variable.
        let trainName = trainSchedule.trainName;
        let destination = trainSchedule.destination;
        let fstTrainTime = trainSchedule.fstTrainTime;
        let frequency = trainSchedule.frequency;
        let nextArrival = 0;
        let minAway = 0;

        // Employee Info
        console.log(trainName);
        console.log(destination);
        console.log(fstTrainTime);
        console.log(frequency);

        // create a new table row
        let tblRow = document.createElement('tr');
        //Train Name
        let tblCellTrainName = tblRow.appendChild(document.createElement('td'));
        tblCellTrainName.innerHTML = trainName;
        //Destination
        let tblCellDestination = tblRow.appendChild(document.createElement('td'));
        tblCellDestination.innerHTML = destination; 
        // Next arrival   
        let tblCellNextArrival = tblRow.appendChild(document.createElement('td'));
        tblCellNextArrival.innerHTML = nextArrival;   
        // Minutes Away
        let tblCellMinAway = tblRow.appendChild(document.createElement('td'));
        tblCellMinAway.innerHTML = minAway;   
        // Frequency  
        let tblCellFrequency = tblRow.appendChild(document.createElement('td'));
        tblCellFrequency.innerHTML = frequency;   

        // Append card to div
        document.getElementById('train-schedule-data').appendChild(tblRow);
    }
})

// TST
var firstTime = "9:00";
var freq = "30"

// now: seconds since midnight
var currdate = new Date("09/09/2018 " + firstTime);
console.log(currdate.toString('mm/dd/yyyy HH:mm'))
var midnight = new Date(
    currdate.getFullYear(),
    currdate.getMonth(),
    currdate.getDate(),
    0, 0, 0
)
var msSinceMidnight = currdate.getTime() - midnight.getTime();
console.log(msSinceMidnight);

let totalSeconds = msSinceMidnight / 1000
console.log(totalSeconds);

// Conver seconds since midnight to time string
let hours = Math.floor(totalSeconds / 3600);
totalSeconds %= 3600;
let minutes = Math.floor(totalSeconds / 60);
let seconds = totalSeconds % 60;
let timeStr = hours.toString() + ":" + minutes.toString();
console.log("hours:" + hours)
console.log("minutes:" + minutes)
console.log("seconds:" + seconds)
console.log("Time:" + timeStr)

// Add commputed time string into current date
var currentDateStr = moment().format('MM/DD/YYYY')
currentDateStr = currentDateStr + " " + timeStr;
console.log(currentDateStr);

// create a starimg point with todays date and staring time
var startmoment = moment(currentDateStr);
var starMomentUTC = moment(currentDateStr).format("X"); // convert ot UTC
console.log(moment.unix(starMomentUTC).format('MM/DD/YYYY HH:mm:ss'))
console.log(starMomentUTC)

// current moment
var curMoment = moment();
var curMomentUTC = moment().format('X') // convert ot UTC
console.log(moment.unix(curMomentUTC).format('MM/DD/YYYY HH:mm:ss'))
console.log(curMomentUTC)

// Get next arrival and minutes away
let nextArrival = null;
let minAway = null;

// Increment by frequencey until next exit is greater or equal
while(starMomentUTC < curMomentUTC) {
    startmoment.add(freq,'minutes');
    starMomentUTC = moment(startmoment).format("X");
    console.log(moment.unix(starMomentUTC).format('MM/DD/YYYY HH:mm:ss'))
}

if (starMomentUTC === curMomentUTC) {
    nextArrival = moment.unix(starMomentUTC).format('hh:mm:ss a');
    minAway = 0;
}
else if (starMomentUTC > curMomentUTC) {
    nextArrival = moment.unix(starMomentUTC).format('hh:mm:ss a');
    minAway = startmoment.diff(curMoment, "minutes") + 1;
}

console.log(moment().format('hh:mm:ss a'))
console.log(nextArrival)
console.log(minAway)

// convert to hpours
if (minAway > 60) {
    var hoursAway = Math.floor( minAway / 60);
    var remMinAway = minAway - (hoursAway * 60 )
    console.log(hoursAway)
    console.log(remMinAway)
}


// Using moment 
// var zeroMoment = moment('09/09/2018', "MM/DD/YYYY")
// var curMoment = moment('09/09/2018 9:00', "MM/DD/YYYY HH:mm")
// console.log(zeroMoment)
// console.log(curMoment)

// var momentDif = curMoment.diff(zeroMoment, "seconds");
// console.log(momentDif);

// console.log(myTime.diff(zeroHours, "seconds"))
// console.log(moment.unix(timeDif).format("MM/DD/YYY HH:mm"))

// console.log(moment('09/09/2018', "MM/DD/YYYY").add(timeDif).format('LLL') )