//*******************************************************************
//
//   File: Login.js               Folder: components
//
//   Author: Honeycomb, Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        7/18/23 (AGH): moved the timeline variables for contOMST
//                       test_trials from ./trials (stim_set, trialorder,
//                       run, twochoice, selfpaced, orderfile);
//                       set up each as state variables defined when the
//                       user submits the Login page
//                       changed the resp_mode selection from a trial (in
//                       /trials/setRepType) to a state variable
//                       moved exptBlock1 from /config/experiment so that
//                       the experiment conditions are updated based on
//                       the user selection of the state variables on Login
//                       (now calls the function loadExptBlock1 from
//                       /config/experiment)
//        7/21/23 (AGH): reformatted login page in App.css
//
//   --------------------
//   This file creates a Login screen that logs in the participant
//   and allows selection of experiment options (stim_set, trialorder,
//   run, twochoice, selfpaced, orderfile, resp_mode).
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
console.log('login 1');
import { deepCopy } from '../lib/utils';
console.log('login 2');

import {
  /* checkStimset, checkTrialorder, checkRun, checkTwochoice, checkSelfpaced, */ writeOrderfile,
  loadOrderfile /*, checkRespmode*/,
} from '../config/cont';
import { loadExptBlock1 } from '../config/experiment';
import { defaultBlockSettings } from '../config/main';
import { refresh_instr_trials } from '../trials/instructions';
console.log('login 3');

//----------------------- 2 ----------------------
//------------------- VARIABLES ------------------

var stim_set = '1';
var trialorder = '1';
var run = '1';
var twochoice = '0';
var selfpaced = '1';
var orderfile = './jsOrders/cMST_Imbal2_orders_1_1_1';
var resp_mode = 'button';

var trial_stim;
var exptBlock1 = deepCopy(defaultBlockSettings);

//----------------------- 3 ----------------------
//------------------- FUNCTIONS ------------------

function Login({ handleLogin, initialParticipantID, initialStudyID, validationFunction }) {
  // State variables for login screen
  const [participantId, setParticipant] = useState(initialParticipantID);
  const [studyId, setStudy] = useState(initialStudyID);
  const [isError, setIsError] = useState(false);

  const [chooseStimset, setStimset] = useState('1'); // set default as 1
  const [chooseTrialorder, setTrialorder] = useState('1'); // set default as 1
  const [chooseRun, setRun] = useState('1'); // set default as 1
  const [chooseRespmode, setRespmode] = useState('button'); // set default as buttons
  const [chooseTwochoice, setTwochoice] = useState(false); // set default as false
  const [chooseSelfpaced, setSelfpaced] = useState(false); // set default as false

  // Function to log in participant
  function handleSubmit(e) {
    e.preventDefault();
    // Logs user in if a valid participant/study id combination is given
    validationFunction(participantId, studyId).then((isValid) => {
      setIsError(!isValid);
      if (isValid) handleLogin(participantId, studyId);
    });
  }

  // Function to check the states of all the options and assign chosen values to each variable
  function checkConfigOptions() {
    // [set=#]: Stimulus set -- 1-6 (1=default) -- used in loading the order file
    stim_set = chooseStimset;
    console.log('stimset = ' + chooseStimset);

    //  [trialorder=#]: Which base order file? (1-4, 1=default)  -- controls ordering of conditions in a run
    trialorder = chooseTrialorder;
    console.log('trialorder = ' + chooseTrialorder);

    // [run=#]: Which particular run? (1-1, 1=default) -- controls which actual stimuli in that set are plugged into the order
    run = chooseRun;
    console.log('run = ' + chooseRun);

    // [resp_mode='']: Respond with buttons or keyboard? (default = button)
    resp_mode = chooseRespmode;
    console.log('respmode = ' + chooseRespmode);

    // [twochoice=#]: 0=OSN, 1=ON response choices (0=default)
    twochoice = chooseTwochoice;
    console.log('twochoice = ' + chooseTwochoice);

    // [selfpaced=#]: Should we allow infinite time with blank screen to make the response? (default =1)
    selfpaced = chooseSelfpaced;
    console.log('selfpaced = ' + chooseSelfpaced);

    // load trial stim from jsOrders file
    // both writeOrderfile and loadOrderfil defined in /config/cont.js
    orderfile = writeOrderfile(stim_set, trialorder, run);
    trial_stim = loadOrderfile(orderfile);

    // load exptBlock conditions from timeline variables
    // in /config/experiment.js
    exptBlock1 = loadExptBlock1(trial_stim, stim_set);
    console.log('calling refresh of instr trials');
    refresh_instr_trials();
  }

  //----------------------- 4 ----------------------
  //--------------------LOGIN FORM -----------------

  return (
    <div className='centered-h-v'>
      <div className='width-50'>
        <Form className='centered-h-v' onSubmit={handleSubmit}>
          <Form.Group className='login' size='lg' controlId='participantId'>
            <Form.Label>Participant ID</Form.Label>
            <Form.Control
              autoFocus
              type='participantId'
              value={participantId}
              onChange={(e) => setParticipant(e.target.value)}
            />
          </Form.Group>
          <Form.Group className='login' size='lg' controlId='studyId'>
            <Form.Label>Study ID</Form.Label>
            <Form.Control
              type='studyId'
              value={studyId}
              onChange={(e) => setStudy(e.target.value)}
            />
          </Form.Group>

          <div className='options-container'>
            <div className='login-options'>
              <Form.Group controlId='stim_set'>
                <Form.Label>Stimulus set:</Form.Label>
                <Form.Control
                  as='select'
                  value={chooseStimset}
                  onChange={(e) => setStimset(e.target.value)}
                >
                  <option value='1'>1</option>
                  <option value='2'>2</option>
                  <option value='3'>3</option>
                  <option value='4'>4</option>
                  <option value='5'>5</option>
                  <option value='6'>6</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId='trialorder'>
                <Form.Label>Trial order:</Form.Label>
                <Form.Control
                  as='select'
                  value={chooseTrialorder}
                  onChange={(e) => setTrialorder(e.target.value)}
                >
                  <option value='1'>1</option>
                  <option value='2'>2</option>
                  <option value='3'>3</option>
                  <option value='4'>4</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId='run'>
                <Form.Label>Run:</Form.Label>
                <Form.Control
                  as='select'
                  value={chooseRun}
                  onChange={(e) => setRun(e.target.value)}
                >
                  <option value='1'>1</option>
                </Form.Control>
              </Form.Group>
            </div>

            <div className='response-options'>
              <Form.Group controlId='respmode'>
                <Form.Label>Response mode:</Form.Label>
                <Form.Control
                  as='select'
                  value={chooseRespmode}
                  onChange={(e) => setRespmode(e.target.value)}
                >
                  <option value='button'>Buttons</option>
                  <option value='keyboard'>Keyboard</option>
                </Form.Control>
              </Form.Group>
            </div>
          </div>

          <div className='checkboxes-container'>
            <div className='checkbox-option'>
              <Form.Group controlId='twochoice'>
                <Form.Check
                  type='checkbox'
                  label='Two choice'
                  checked={chooseTwochoice}
                  onChange={(e) => setTwochoice(e.target.checked)}
                />
              </Form.Group>
            </div>
            <div className='checkbox-option'>
              <Form.Group controlId='selfpaced'>
                <Form.Check
                  type='checkbox'
                  label='Selfpaced'
                  checked={chooseSelfpaced}
                  onChange={(e) => setSelfpaced(e.target.checked)}
                />
              </Form.Group>
            </div>
          </div>

          <Button
            style={{ width: '100%' }}
            block
            size='lg'
            type='submit'
            disabled={participantId.length === 0 || studyId.length === 0}
            onClick={checkConfigOptions}
          >
            Log In
          </Button>
        </Form>
        {isError ? (
          <div className='alert alert-danger' role='alert'>
            No matching experiment found for this participant and study
          </div>
        ) : null}
      </div>
    </div>
  );
}

//----------------------- 5 ----------------------
//---------------------EXPORTS -------------------
console.log('login 4');

export {
  Login,
  stim_set,
  trialorder,
  run,
  resp_mode,
  twochoice,
  selfpaced,
  orderfile,
  trial_stim,
  exptBlock1,
};
