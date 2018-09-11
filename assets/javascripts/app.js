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

// Add Button event .............................................
function addTrainSchedule() {

    // Control default behavior for "submit" button
    event.preventDefault();

    // Retreive data from screen
    let trainName = document.getElementById("tName").value.trim();
    let trainDestination = document.getElementById("tDestination").value.trim();
    let fstTime = document.getElementById("tFirstTime").value.trim();
    let trainFreq = document.getElementById("tFreq").value.trim();

    // get time in ms since midnight
    let fstTimeMS = getMsSinceMidnight(fstTime);

    // create nnew train scheduel obj
    let newTrainSchedule = {
        trainName: trainName,
        destination: trainDestination,
        fstTimeMS: fstTimeMS,
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

// Database record added event ..................................
trainSchRef.on('child_added', data => {

    // use val() to retrieve the objects
    const trainSchedule = data.val();

    if (trainSchedule != null) {

        // Store everything into a variable.
        let trainName = trainSchedule.trainName;
        let destination = trainSchedule.destination;
        let fstTimeMS = trainSchedule.fstTimeMS;
        let frequency = trainSchedule.frequency;

        let fstTime = getTimeStr(fstTimeMS);
        var startDatetimeString = getCurrentDateString();
        // Start date-time: MM/DD/YYYY HH:MM
        startDatetimeString = startDatetimeString + " " + fstTime;
        
        // Get starmoment
        var startmoment = moment(startDatetimeString);
        var curMoment = moment();

        var starMomentUTC = startmoment.format("X");
        var curMomentUTC = curMoment.format('X');

        let nextArrival = 0;
        let minAway = 0;

        // Increment by frequencey until next exit is greater or equal
        while (starMomentUTC < curMomentUTC) {
            startmoment.add(frequency, 'minutes');
            starMomentUTC = startmoment.format("X");
        }

        if (starMomentUTC === curMomentUTC) {
            nextArrival = moment.unix(starMomentUTC).format('hh:mm a');
            minAway = 0;
        } else if (starMomentUTC > curMomentUTC) {
            nextArrival = moment.unix(starMomentUTC).format('hh:mm a');
            minAway = startmoment.diff(curMoment, "minutes") + 1;
        }

        // convert minutes to hours, if apply
        minAway = getMinutesInHours(minAway);
        
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
