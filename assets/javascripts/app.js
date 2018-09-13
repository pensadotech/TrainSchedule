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

// Variables
var pauseRefreshInterval = false;
var updateMode = false;
var trainToUpdateKey = '';

// Display time in header
DisplayTime();

function DisplayTime() {
    let curretnTime = moment().format('hh:mm a');
    document.getElementById('currTime').innerHTML = 'Time : ' + curretnTime;
}

function displayTrainSchedule(recKey, trainSchedule) {

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

    // Delete Button
    let tblCellDelBtn = tblRow.appendChild(document.createElement('td'));
    tblCellDelBtn.innerHTML = `
    <button class="btn btn-primary rowBtn" data-toggle="tooltip" title="Delete" 
            onclick="deleteTrainSchedule('${recKey}','${trainName}')">
    <i class="fas fa-calendar-times"></i>
    </button>
    `

    // update button
    let tblCellUpdBtn = tblRow.appendChild(document.createElement('td'));
    tblCellUpdBtn.innerHTML = `
    <button class="btn btn-primary rowBtn" data-toggle="tooltip" title="Edit" 
            onclick="updateTrainSchedule('${recKey}','${trainName}')">
    <i class="fas fa-edit"></i>
    </button>
    `

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

function refreshTrainschedule() {
    document.getElementById('train-schedule-data').innerHTML = '';
    // process all records in database
    trainSchRef.on('value', data => {
        //loop over all nodes
        data.forEach(elementNode => {
            // get node key and data
            var recKey = elementNode.key;
            var trainSchedule = elementNode.val();
            // refresh data
            displayTrainSchedule(recKey, trainSchedule);
        });
    })
}

function doesTrainExist(trainName) {
    let availableTrain = false;
    // Look for the trains that match the name
    trainSchRef.orderByChild('trainName').equalTo(trainName).on('value', data => {
        data.forEach(elementNode => {
            // If one record exist with the name, is enough
            availableTrain = true;
        });
    })

    return availableTrain;
}
// EVENT: Database record child added event ..................................
trainSchRef.on('child_added', data => {
    // it will only retreive teh child node that was added
    if (data.val() != null) {
        displayTrainSchedule(data.key, data.val());
    }
})

// EVENT: refresh contents every 2 minute ..........................
var intervalHandler = setInterval(function () {
    if (!pauseRefreshInterval) {
        // refresh data
        refreshTrainschedule();
        // Display time in header
        DisplayTime();
    }
}, 1000)

function resetTrainScheduleInput() {

    // Clears all of the text-boxes
    document.getElementById("tName").value = '';
    document.getElementById("tDestination").value = '';
    document.getElementById("tFirstTime").value = '';
    document.getElementById("tFreq").value = '';

    pauseRefreshInterval = !pauseRefreshInterval;
}

// EVENT: Button Addd schedule .......................................
function SubmitTrainSchedule() {

    // Control default behavior for "submit" button
    event.preventDefault();

    // reset possible errors
    document.getElementById("trainNameErr").innerHTML = '';
    document.getElementById("destErr").innerHTML = '';
    document.getElementById("fstTimeErr").innerHTML = '';
    document.getElementById("frqErr").innerHTML = '';

    // Retreive data from screen
    let trainName = document.getElementById("tName").value.trim();
    let trainDestination = document.getElementById("tDestination").value.trim();
    let fstTime = document.getElementById("tFirstTime").value.trim();
    let trainFreq = document.getElementById("tFreq").value.trim();

    let errFound = false;

    if (trainName === '') {
        document.getElementById("trainNameErr").innerHTML = ' - Missing data';
        errFound = true;
    }

    if (trainDestination === '') {
        document.getElementById("destErr").innerHTML = ' - Missing data';
        errFound = true;
    }

    if (fstTime === '') {
        document.getElementById("fstTimeErr").innerHTML = ' - Missing data';
        errFound = true;
    }

    if (trainFreq === '') {
        document.getElementById("frqErr").innerHTML = ' - Missing data';
        errFound = true;
    }

    // IS train anme already in schedule?
    let trainFound = doesTrainExist(trainName);
    if (!updateMode && trainFound) {
        document.getElementById("trainNameErr").innerHTML = ' - Train already exist';
        errFound = true;
    }

    if (!errFound) {

        // get time in ms since midnight
        let fstTimeMS = getMsSinceMidnight(fstTime);

        // create new train scheduel obj
        let newTrainSchedule = {
            trainName: trainName,
            destination: trainDestination,
            fstTimeMS: fstTimeMS,
            frequency: trainFreq
        }

        if (!updateMode) {
            // ADD train schedule
            trainSchRef.push(newTrainSchedule);
        } else {
            // UPDATE train schedule
            trainSchRef.child(trainToUpdateKey).remove();
            trainSchRef.push(newTrainSchedule);
        }

        // Clears all of the text-boxes
        resetTrainScheduleInput();
         
        if (updateMode) {
            document.getElementById('train-schedule-data').innerHTML = '';
            refreshTrainschedule();
        }

        // Collapse panel
        var addTrainButton = document.getElementById("addButton");
        addTrainButton.click();
    }
    
    // Turn off update mode
    updateMode = false;
    trainToUpdateKey = '';

}

// EVENT: Delete schedule .......................................
function deleteTrainSchedule(recKey, trainName) {

    // Look for the trains that match the name
    trainSchRef.orderByChild('trainName').equalTo(trainName).on('value', data => {
        data.forEach(elementNode => {
            // For the record with matching keys, delete it
            if (elementNode.key === recKey) {
                // Delete object
                trainSchRef.child(recKey).remove();
            }
        });
    })

    document.getElementById('train-schedule-data').innerHTML = '';
    refreshTrainschedule();
}

// EVENT: Update schedule ..........................................
function updateTrainSchedule(recKey, trainName) {

    console.log(recKey + " " + trainName);

    let destination = '';
    let fstTimeMS = '';
    let frequency = '';

    // Look for the trains that match the name
    trainSchRef.orderByChild('trainName').equalTo(trainName).on('value', data => {
        data.forEach(elementNode => {
            // For the record with matching keys, delete it
            if (elementNode.key === recKey) {
                // Active update mode
                updateMode = true;
                trainToUpdateKey = recKey;
                // Capture train Schedule to update
                let trainSchedule = elementNode.val();
                destination = trainSchedule.destination;
                fstTimeMS = trainSchedule.fstTimeMS;
                frequency = trainSchedule.frequency;
            }
        });
    })

 
    if (updateMode) {

        // Open panel
        let addTrainButton = document.getElementById("addButton");
        addTrainButton.click();

        // Populate data
        document.getElementById("tName").value = trainName;
        document.getElementById("tDestination").value = destination;
        document.getElementById("tFirstTime").value = getTimeStr(fstTimeMS);
        document.getElementById("tFreq").value = frequency;
    }
}