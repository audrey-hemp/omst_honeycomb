//*******************************************************************
//
//   File: electron.js               Folder: public
//
//   Author: Honeycomb, Audrey Hempel
//   --------------------
//
//   Changes:
//        7/10/23 (AGH): made changes to getSavePath to make sure
//                       the data saves on the first iteration of
//                       a participantID and studyID
//                       added saveDataandQuit to save data if window
//                       is closed before experiment end
//        7/24/23 (AGH): added fsExtra and made changes 
//                       saveDataandQuit to correct for stream errors
//        8/3/23  (AGH): added initializeCsvWriter(), and made corresponding
//                       chnages to getSavePath, ipc.on('data') and
//                       ipc.on('will-quit') to save data in a csv
//                       file as well as json
//        8/4/23  (AGH): made changes to getSavePath and added 
//                       getFormattedDate() to save both csv and json data 
//                       files to a timestamped folder within the date
//                       folder
//                       removed git info from the data
//        8/9/23  (AGH): continued additions to csv data
//
//   --------------------
//   This file handles the Electron framework integration for the 
//   application, managing data storage, event handling, etc. This version
//   in the branch csv_unfinished does create a csv file but causes
//   the app to crash at unexpected points after certain tasks.
//   NEEDS TO BE FIXED! (All of the changes are in the csv initialization
//   at the top of the file and in getSavePath, ipc.on('data') and
//   app.on('will-quit').
//
//*******************************************************************

// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const ipc = require('electron').ipcMain;
const _ = require('lodash');
const fs = require('fs-extra');
const log = require('electron-log');
const fsExtra = require('fs-extra'); // 7/24/23 (AGH) ADDED

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

let csvWriter;

const initializeCsvWriter = (participantID, studyID, jsonFolderPath) => {
  if (participantID !== '' && studyID !== '') {
    const desktop = app.getPath('desktop');
    const date = today.toISOString().slice(0, 10);
    const csvFilename = `pid_${participantID}_${today.getTime()}.csv`;
    const csvFilePath = path.join(jsonFolderPath, csvFilename);

    // Create the folders if they don't exist
    fsExtra.ensureDirSync(path.join(desktop, studyID));
    fsExtra.ensureDirSync(path.join(desktop, studyID, participantID));
    fsExtra.ensureDirSync(path.join(desktop, studyID, participantID, date));

    // Define the CSV headers with labels and corresponding data keys
    const csvHeaders = [
      { id: 'login', title: 'Login Options' },
      { id: 'consent', title: 'Consent' },
      { id: 'demog', title: 'Demographics' },
      { id: 'pcon', title: 'Perceptual Control Task' },
      { id: 'cont', title: 'Continuous oMST' },
    ];

   // Create the CSV writer with custom formatting function
    csvWriter = createCsvWriter({
      path: csvFilePath,
      header: csvHeaders,
    });
  }
};

const getFormattedTimestamp = () => {
  const options = {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  };

  const time = today.toLocaleTimeString(undefined, options);

  return `${time}`;
};
// Event Trigger
const { eventCodes, vendorId, productId, comName } = require('./config/trigger');
const { getPort, sendToPort } = require('event-marker');

// handle windows installer set up
if (require('electron-squirrel-startup')) app.quit();

// Define default environment variables
let USE_EEG = false;
let VIDEO = false;

// Override product ID if environment variable set
const activeProductId = process.env.EVENT_MARKER_PRODUCT_ID || productId;
const activeComName = process.env.EVENT_MARKER_COM_NAME || comName;
if (activeProductId) {
  log.info('Active product ID', activeProductId);
} else {
  log.info('COM Name', activeComName);
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// 7/10/23 (AGH) ADDED: this function was added to allow the application to save data if the window is
// closed before the completion of the experiment
const saveDataAndQuit = () => {
  if (stream) {
    stream.end(']');
    stream.on('finish', () => {
      if (preSavePath && savePath) {
        const filename = `pid_${participantID}_${today.getTime()}.json`; // Generate a unique filename using the current timestamp
        const fullPath = getFullPath(filename); // Set the full path for the data file

        // Ensure that the savePath directory exists before moving the file
        fsExtra.ensureDirSync(savePath); //7/24/23 (AGH) ADDED

        fsExtra.move(preSavePath, fullPath, (err) => { //7/24/23 (AGH) CHANGED
          if (err) {
            console.error('Error moving data file:', err);
          } else {
            console.log('Data file saved:', fullPath);
          }
          app.quit(); // Quit the app after the data is saved
        });
      } else {
        app.quit(); // Quit the app if preSavePath or savePath is missing
      }
    });
  } else {
    app.quit(); // Quit the app if the stream is not available
  }
};
// END OF ADDED SECTION

function createWindow() {
  // Create the browser window.
  if (process.env.ELECTRON_START_URL) {
    // in dev mode, disable web security to allow local file loading
    console.log(process.env.ELECTRON_START_URL);
    mainWindow = new BrowserWindow({
      width: 1500,
      height: 900,
      icon: './favicon.ico',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  } else {
    mainWindow = new BrowserWindow({
      fullscreen: true,
      icon: './favicon.ico',
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: true,
        contextIsolation: false,
      },
    });

    mainWindow.on('closed', function () { //7/24/23 (AGH) ADDED
      saveDataAndQuit();
      mainWindow = null;
    });
  }

  // and load the index.html of the app.
  const startUrl =
    process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../build/index.html')}`;
  log.info(startUrl);
  mainWindow.loadURL(startUrl);

  // Open the DevTools.
  process.env.ELECTRON_START_URL && mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    saveDataAndQuit(); // 7/10/23 (AGH) ADDED
    mainWindow = null;
  });
}

// TRIGGER PORT HELPERS
let triggerPort;
let portAvailable;
let SKIP_SENDING_DEV = false;

const setUpPort = async () => {
  let p;
  if (activeProductId) {
    p = await getPort(vendorId, activeProductId);
  } else {
    p = await getPort(activeComName);
  }
  if (p) {
    triggerPort = p;
    portAvailable = true;

    triggerPort.on('error', (err) => {
      log.error(err);
      const buttons = ['OK'];
      if (process.env.ELECTRON_START_URL) {
        buttons.push('Continue Anyway');
      }
      dialog
        .showMessageBox(mainWindow, {
          type: 'error',
          message: 'Error communicating with event marker.',
          title: 'Task Error',
          buttons,
          defaultId: 0,
        })
        .then((opt) => {
          if (opt.response === 0) {
            app.exit();
          } else {
            SKIP_SENDING_DEV = true;
            portAvailable = false;
            triggerPort = false;
          }
        });
    });
  } else {
    triggerPort = false;
    portAvailable = false;
  }
};

const handleEventSend = (code) => {
  if (!portAvailable && !SKIP_SENDING_DEV) {
    const message = 'Event Marker not connected';
    log.warn(message);

    const buttons = ['Quit', 'Retry'];
    if (process.env.ELECTRON_START_URL) {
      buttons.push('Continue Anyway');
    }
    dialog
      .showMessageBox(mainWindow, {
        type: 'error',
        message,
        title: 'Task Error',
        buttons,
        defaultId: 0,
      })
      .then((resp) => {
        const opt = resp.response;
        if (opt === 0) {
          // quit
          app.exit();
        } else if (opt === 1) {
          // retry
          setUpPort().then(() => handleEventSend(code));
        } else if (opt === 2) {
          SKIP_SENDING_DEV = true;
        }
      });
  } else if (!SKIP_SENDING_DEV) {
    sendToPort(triggerPort, code);
  }
};

// Update env variables with buildtime values from frontend
ipc.on('updateEnvironmentVariables', (event, args) => {
  USE_EEG = args.USE_EEG;
  VIDEO = args.USE_CAMERA;
  if (USE_EEG) {
    setUpPort().then(() => handleEventSend(eventCodes.test_connect));
  }
});

// EVENT TRIGGER

ipc.on('trigger', (event, args) => {
  const code = args;
  if (code !== undefined) {
    log.info(`Event: ${_.invert(eventCodes)[code]}, code: ${code}`);
    if (USE_EEG) {
      handleEventSend(code);
    }
  }
});

// <studyID> will be created on Desktop and used as root folder for saving data.
// data save format is ~/Desktop/<studyID>/<participantID>/<date>/<filename>.json
// it is also incrementally saved to the user's app data folder (logged to console)

// INCREMENTAL FILE SAVING
let stream = false;
let fileCreated = false;
let preSavePath = '';
let savePath = '';
let participantID = '';
let studyID = '';
const images = [];
let startTrial = -1;
const today = new Date();

/**
 * Abstracts constructing the filepath for saving data for this participant and study.
 * @returns {string} The filepath.
 */
const getSavePath = (participantID, studyID) => {
  if (participantID !== '' && studyID !== '') {
    const desktop = app.getPath('desktop');
    const date = today.toISOString().slice(0, 10);
    const timestamp = getFormattedTimestamp(); 
    
    // 7/10/23 (AGH) ADDED: This section was added for the omst to ensure that data was saved on the first iteration of a studyID and participant ID
    const folderPath = path.join(desktop, studyID, participantID, date, timestamp);

    // Create the folders if they don't exist
    fs.mkdirSync(path.join(desktop, studyID), { recursive: true });
    fs.mkdirSync(path.join(desktop, studyID, participantID), { recursive: true });
    fs.mkdirSync(path.join(desktop, studyID, participantID, date), { recursive: true });
        fs.mkdirSync(path.join(desktop, studyID, participantID, date, timestamp), { recursive: true });

    return folderPath;
    // END OF ADDED SECTION
  }
};

const getFullPath = (fileName) => {
  return path.join(savePath, fileName);
};

// Read version file (git sha and branch)
const git = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config/version.json')));

// Get Participant Id and Study Id from environment
ipc.on('syncCredentials', (event) => {
  event.returnValue = {
    envParticipantId: process.env.REACT_APP_PARTICIPANT_ID,
    envStudyId: process.env.REACT_APP_STUDY_ID,
  };
});

// listener for new data
ipc.on('data', (event, args) => {
  // initialize file - we got a participant_id to save the data to
  if (args.participant_id && args.study_id && !fileCreated) {
    const dir = app.getPath('userData');
    participantID = args.participant_id;
    studyID = args.study_id;
    preSavePath = path.resolve(dir, `pid_${participantID}_${today.getTime()}.json`);
    startTrial = args.trial_index;
    log.warn(preSavePath);
    stream = fs.createWriteStream(preSavePath, { flags: 'ax+' });
    stream.write('[');
    fileCreated = true;
  }

  if (savePath === '') {
    savePath = getSavePath(participantID, studyID);
  }

  // we have a set up stream to write to, write to it!
  if (stream) {
    // write intermediate commas
    if (args.trial_index > startTrial) {
      stream.write(',');
    }

    // write the Json data
    data = JSON.stringify({ ...args});
    data = data.replace('{"summary"', ',{"summary"');
    stream.write(data); 

    // Copy provocation images to participant's data folder
    if (args.trial_type === 'image-keyboard-response') images.push(args.stimulus.slice(7));
  }

  // csv data writing below
  
  // Login options
  let startDate = args.login_data.start_date;
  let order = `${args.login_data.stimset}.${args.login_data.sublist}`;
  let resp = args.login_data.respmode;
  let lang = args.login_data.language;
  let incl_con = args.login_data.include_consent;
    if (args.login_data.include_consent == true) {
      incl_con = 'Consent included';
    } else {
      incl_con = 'Consent not included';
    }
  let incl_demog = args.login_data.include_demog;
    if (args.login_data.include_demog == true) {
      incl_demog = 'Demographics included';
    } else {
      incl_demog = 'Demographics not included';
    }
  let incl_pcon = args.login_data.include_pcon;
    if (args.login_data.include_pcon == true) {
      incl_pcon = 'Pcon included';
    } else {
      incl_pcon = 'Pcon not included';
    }
  let incl_instr = args.login_data.include_instr;
    if (args.login_data.include_demog == true) {
      incl_instr = 'Instructions included';
    } else {
      incl_instr = 'Instructions not included';
    }
  let twochoice = args.login_data.twochoice;
    if (args.login_data.include_demog == true) {
      twochoice = 'Old New task (two choice)';
    } else {
      twochoice = 'Old Similar New task (three choice)';
    }
  let selfpaced = args.login_data.selfpaced;
    if (args.login_data.include_demog == true) {
      selfpaced = 'Selfpaced experiment (selfpaced = true)';
    } else {
      selfpaced = 'Timed experiment (selfpaced = false)';
    }


  //Check if Consent Form is included and whether the participant consented
  let consentTask = 'N/A';
  
  if (args.task == 'consent' && args.response == 0) {
    consentTask = 'Consented';
  } else if (args.task == 'consent' && args.response == 1) {
    consentTask = 'Not consented';
  } else {
    consentTask - 'N/A';
  }

  // Check if Demographics Form is included and extract demographics data
  let demogName = 'N/A';
  let demogDOB = 'N/A';
  let demogGender = 'N/A';
  let demogEthnicity = 'N/A';
  let demogRace = 'N/A';
  if (args.task == 'demographics') {
    const demographicsForm = args.response;
    demogName = demographicsForm.fullname;
    demogDOB = demographicsForm.dob;
    demogGender = demographicsForm.gender;
    demogEthnicity = demographicsForm.ethnicity;
    demogRace = demographicsForm.race;
  }


  // Create an object with the data fields you want to include in the CSV
  const csvData = {
    login: `Start date: ${startDate}\nOrder: ${order}\nResponse: ${resp}\nLanguage: ${lang}\n${incl_con}\n${incl_demog}\n${incl_pcon}\n${incl_instr}\n${twochoice}\n${selfpaced}\n`,
    consent: `${incl_con}\n${consentTask}`,
    demog: `${incl_demog}\nName: ${demogName}\nDob: ${demogDOB}\nGender: ${demogGender}\nEthnicity: ${demogEthnicity}\nRace: ${demogRace}\n`,
    // pcon: `${incl_pcon}\nPcon summary: ${pcon_sum}\n`,
    // cont: `Cont summary: ${cont_sum}\n`,
  };

    // Write to CSV file
    if (csvWriter) {
      csvWriter.writeRecords([csvData]).then(() => {
        console.log('Data written to CSV file successfully.');
      }).catch((err) => {
        console.error('Error writing to CSV:', err);
      });
    }
  
});

// Save Video
ipc.on('save_video', (event, videoFileName, buffer) => {
  if (savePath === '') {
    savePath = getSavePath(participantID, studyID);
  }

  if (VIDEO) {
    const fullPath = getFullPath(videoFileName);
    fs.outputFile(fullPath, buffer, (err) => {
      if (err) {
        event.sender.send('ERROR', err.message);
      } else {
        event.sender.send('SAVED_FILE', fullPath);
        console.log(fullPath);
      }
    });
  }
});

// EXPERIMENT END
ipc.on('end', () => {
  // quit app
  //app.quit();
});

// Error state sent from front end to back end (e.g. wrong number of images)
ipc.on('error', (event, args) => {
  log.error(args);
  const buttons = ['OK'];
  if (process.env.ELECTRON_START_URL) {
    buttons.push('Continue Anyway');
  }
  const opt = dialog.showMessageBoxSync(mainWindow, {
    type: 'error',
    message: args,
    title: 'Task Error',
    buttons,
  });

  if (opt === 0) app.exit();
});

// log uncaught exceptions
process.on('uncaughtException', (error) => {
  // Handle the error
  log.error(error);

  // this isn't dev, throw up a dialog
  if (!process.env.ELECTRON_START_URL) {
    dialog.showMessageBoxSync(mainWindow, { type: 'error', message: error, title: 'Task Error' });
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
});
// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// EXPERIMENT END
app.on('will-quit', () => {
  if (fileCreated) {
    // finish writing file
    stream.write(']');
    stream.end();
    stream = false;

    // copy file to config location
    fs.mkdir(savePath, { recursive: true }, (err) => {
      log.error(err);
      fs.copyFileSync(preSavePath, getFullPath(`pid_${participantID}_${today.getTime()}.json`));
    });
  }
    //reset csvWriter
    if (csvWriter) {
    csvWriter = null;
  }
});
