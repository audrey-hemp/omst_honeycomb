//*******************************************************************
//
//   File: main.js               Folder: timelines
//
//   Author: Honeycomb, Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        6/26/23 (AGH): added contOmst preload, instructions, debrief blocks
//        6/28/23 (AGH): added contOmst repeating trials in testBlock(exptBlock1)
//        7/6/23 (AGH):  deleted preload
//        7/7/23 (AGH):  created consented and notConsented conditional timelines
//                       to progress based on participant consent
//        7/9/23 (AGH):  added conditional timelines based on user
//                       consent
//        7/10/23 (AGH): added end_message
//        7/18/23 (AGH): removed select_resp_type trial, changed import of resp_mode,
//                       and exptBlock1 to /components/Login
//
//   --------------------
//   This file builds the primaryTimeline from all of the trials.
//   It also contains two conditional timelines based on user consent
//   that are pushed to the primaryTimeline.
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------

import { config } from '../config/main';

import { select_pref_lang } from '../trials/selectLanguage';
import { consent_trial, consentGiven, not_consented } from '../trials/consent_trial';
import { demogform } from '../trials/demographics';
import {
  key_intro,
  button_intro,
  new1,
  key_new2,
  button_new2,
  key_new3,
  button_new3,
  key_repeat1,
  button_repeat1,
  key_lure1,
  button_lure1,
  key_side_by_side1,
  button_side_by_side1,
  key_new4,
  button_new4,
  key_new5,
  button_new5,
  key_repeat2,
  button_repeat2,
  key_lure2,
  button_lure2,
  key_side_by_side2,
  button_side_by_side2,
  key_outtro,
  button_outtro,
} from '../trials/instructions';
import { key_instr1_trial, button_instr1_trial, debrief_block } from '../trials/contOmst';
import { exptBlock1, resp_mode } from '../components/Login';
import testBlock from './testBlock';
import { end_message } from '../trials/end';

import preamble from './preamble';
import taskBlock from './taskBlock';
import { tutorialBlock } from '../config/tutorial';

//----------------------- 2 ----------------------
//-------------------- OPTIONS -------------------

// Add your jsPsych options here.
// Honeycomb will combine these custom options with other options needed by Honyecomb.

const jsPsychOptions = {
  on_trial_finish: function (data) {
    console.log('A trial just ended, here are the latest data:');
    console.log(data);
  },
  default_iti: 250,
};

//----------------------- 3 ----------------------
//-------------------- TIMELINE ------------------

// Add your jsPsych timeline here.
// Honeycomb will call this function for us after the subject logs in, and run the resulting timeline.
// The instance of jsPsych passed in will include jsPsychOptions above, plus other options needed by Honeycomb.
const buildTimeline = () => (config.USE_MTURK ? mturkTimeline : buildPrimaryTimeline());

const buildPrimaryTimeline = () => {
  const primaryTimeline = [select_pref_lang, consent_trial];

  // conditional timeline that runs the experiment if consent is given
  var consented = {
    timeline: [
      demogform, // demographics
    ],
    conditional_function: function () {
      // if consent was given in consent trial, run above timeline
      if (consentGiven) {
        return true;
      } else {
        return false;
      }
    },
  };

  // timeline for all the keyboard response trials
  var keyboard = {
    timeline: [
      // instructions
      key_intro,
      ///key_new1,
      new1,
      key_new2,
      key_new3,
      key_repeat1,
      key_lure1,
      key_side_by_side1,
      key_new4,
      key_new5,
      key_repeat2,
      key_lure2,
      key_side_by_side2,
      key_outtro,

      // continuous omst
      key_instr1_trial, // instructions
      testBlock(exptBlock1), // looping trials
      debrief_block, // thank you

      end_message, // final thank you message
    ],
    conditional_function: function () {
      // if consent was given in consent trial and keyboard response type run above timeline
      if (consentGiven && resp_mode == 'keyboard') {
        return true;
      } else {
        return false;
      }
    },
  };

  // timeline for all the button response trials
  var buttons = {
    timeline: [
      // instructions
      button_intro,
      ///button_new1,
      new1,
      button_new2,
      button_new3,
      button_repeat1,
      button_lure1,
      button_side_by_side1,
      button_new4,
      button_new5,
      button_repeat2,
      button_lure2,
      button_side_by_side2,
      button_outtro,

      // continuous omst
      button_instr1_trial, // instructions
      testBlock(exptBlock1), // looping trials
      debrief_block, // thank you

      end_message, // final thank you message
    ],
    conditional_function: function () {
      // if consent was given in consent trial and button response type run above timeline
      if (consentGiven && resp_mode == 'button') {
        return true;
      } else {
        return false;
      }
    },
  };

  // conditional timeline that runs ending message if participant does not consent
  var notConsented = {
    timeline: [not_consented],
    conditional_function: function () {
      if (!consentGiven) {
        return true;
      } else {
        return false;
      }
    },
  };

  // add conditional timelines to primary
  primaryTimeline.push(consented, keyboard, buttons, notConsented);
  return primaryTimeline;
};

// for future mturk use??
const mturkTimeline = [
  preamble,
  //countdown({ message: lang.countdown.message1 }),
  taskBlock(tutorialBlock),
  //countdown({ message: lang.countdown.message2 }),
  taskBlock(exptBlock1),
  // showMessage(config, {
  //   duration: 5000,
  //   message: lang.task.end,
  // }),
];

//----------------------- 4 ----------------------
//-------------------- EXPORTS -------------------

// include these options, get the timeline from this function.
export { jsPsychOptions, buildTimeline };
