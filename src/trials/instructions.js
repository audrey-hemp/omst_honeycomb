// <!DOCTYPE html>
// <html>
//   <!--
//   Task: Perceptual-baseline control task in cMST
//   Author: Gavin Stark
//   Forked from main cMST-Online on 11/20/19 and modified for mobile / Cordova
//   Forked again on 8/20/20, pulled out Cordova, and setup for JATOS

// Revised: November 20, 2019 (CELS) for Cordova
//    11/22/19 (CELS) - cleanup parameter section
//    11/25 (CELS): Button size increase
//    12/4/19 (CELS): Using .replace not .href and will take you back to index.html if the end
//    12/5/19 (CELS): Styles to alter text/button sizes, ensuring deviceready, meta-tag
//    12/6/19 (CELS): Shifted data saving to savedata.js and setup to allow local backup save on iOS
//    4/13/20 (CELS): Goes to end.html if this is the last phase
//    4/16/20 (CELS): Will detect if on SONA and go back there for credit
//    8/20/20 (CELS): Forked off and reworked for JATOS
//    8/24/20 (CELS): Fixed jumping stimuli when using button response mode
//    5/31/22 (CELS): Added bit about blank screen in main task
//    10/21/22 (CELS): Updated default to buttons
//    2/28/23 (CELS): Updated to jsPsych7

//   Optional parameters:
//   [sid=##]: Subject ID -- used for data file name (default=1234)
//   [resp=X]: Response mode -- set to 'keyboard' to use keys, anything else to use buttons (default=button)
//   [rand=#]: Should which stimuli are shown as repeats vs. lures be randomized? (default=0)
//   [q_pcon=pagename]: Base of HTML filename to add into the queue after this task (default=null)

//  -->

// <head>
//   <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap:  'unsafe-inline' 'unsafe-eval'
//     https://fonts.gstatic.com http://www.stark-labs.com/exp/jsPsych/mobile_cMST/append_log.php http://www.stark-labs.com/exp/jsPsych/mobile_cMST/write_data_file.php;
//     style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/css; media-src *;
//     img-src 'self' data: content:;">

//   <script type="text/javascript" src="jatos.js"></script>
//   <script type="text/javascript" src="js/index.js"></script>
//   <script src="js/jspsych_731/dist/jspsych.js"></script>
//   <script src="js/jspsych_731/dist/plugin-html-keyboard-response.js"></script>
//   <script src="js/jspsych_731/dist/plugin-html-button-response.js"></script>
//   <script src="js/jspsych_731/dist/plugin-categorize-image.js"></script>
//   <script src="js/plugin-categorize-image-buttons.js"></script>
//   <link rel="stylesheet" href="css/jspsych.css"></link>
//   <style>
//     .jspsych-display-element {
//       font-size: 200%;
//     }
//     .jspsych-btn {
//       font-size: 150%;
//     }
//   </style>
// </head>
// <script>

//was below

// jatos.onLoad(function() {
//   const phasename='cmst_instr_contOSN';
//   var sid=jatos.studySessionData['sid'];
//   if (typeof sid === 'undefined') {
//     sid=1234;
//   }

//   var jsPsych = initJsPsych({on_finish: function() {
//       if (0) { jsPsych.data.displayData(); }
//       else {
//         var order=jatos.studySessionData["order"];
//         jatos.studySessionData["taskindex"] += 1;
//         var expdata = jsPsych.data.get().json();
//         // Submit results to JATOS and queue the end or next task
//         if (typeof order === 'undefined' || order.length == jatos.studySessionData["taskindex"]) {
//           // we're done
//           // Check if this came from SONA - should have URL.sid and .sona
//           if (typeof jatos.urlQueryParameters.sid === 'undefined' || typeof jatos.urlQueryParameters.sona === 'undefined' ||
//               typeof jatos.studyJsonInput['experiment_id'] === 'undefined' || typeof jatos.studyJsonInput['credit_token'] === 'undefined') {
//             jatos.submitResultData(expdata,jatos.endStudy);
//           }
//           else {
//             var redirect='https://uci.sona-systems.com/webstudy_credit.aspx?experiment_id='+jatos.studyJsonInput['experiment_id']+
//               '&credit_token='+jatos.studyJsonInput['credit_token']+'&survey_code='+jatos.urlQueryParameters.sid;
//             jatos.endStudyAndRedirect(redirect,expdata);
//           }
//         }
//         else {
//           // submit and start the next
//           jatos.submitResultData(expdata, () => { jatos.startComponentByPos(order[jatos.studySessionData["taskindex"]]) });
//         }
//       }
//     }
//   });

//   jsPsychData.addProperties({
//     task: phasename,
//     subject: sid,
//   });

//*******************************************************************
//
//   File: instructions.js               Folder: trials
//
//   Author: Gavin Stark, Craig Stark, Audrey Hempel
//   --------------------
//
//   Changes:
//        6/12/23 (AGH): forked honeycomb, began to transfer trials from
//                       cmst_instr_contOSN.html into template (adding imports,
//                       exports, removing JATOS code)
//        6/14/23 (AGH): loaded images into ../assets and imported { images }
//                       from ../lib/utils
//        6/16/23 (AGH): created and imported custom plugins in ./uniqueplugins
//                       adpated from Craig's create-image-buttons plugin
//        6/20/23 (AGH): created ./selectLanguage and imported { lang }
//                       created ./selectRespType and imported { resp_mode }
//        6/22/23 (AGH): converted all the trial parameters dependent on lang
//                       and resp-mode into dynamic parameters
//        7/13/23 (AGH): added task as data property to each trial
//        7/14/23 (AGH): created button and key trials for each trial to allow
//                       response selection (trial types cannot be dynamic)
//
//   --------------------
//   These trials are the instruction trials that explain to the
//   participant how to partake in the experiment and provide user
//   feedback.
//
//*******************************************************************

//----------------------- 1 ----------------------
//-------------------- IMPORTS -------------------
console.log('inside instructions.js');
// importing jspysch plugins
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import jsPsychCategorizeImage from '@jspsych/plugin-categorize-image';

// importing unique plugins
import { jsPsychCategorizeImageButtons } from './uniquePlugins/plugin-categorize-image-buttons.js';
import { jsPsychCategorizeMultipleImageKeyboard } from './uniquePlugins/plugin-categorize-multiple-image-keyboard.js';
import { jsPsychCategorizeMultipleImageButtons } from './uniquePlugins/plugin-categorize-multiple-image-buttons.js';

// importing languages, images object, and response-mode
import { lang } from './selectLanguage.js';
import { images } from '../lib/utils.js';
import { resp_mode } from '../components/Login';

//----------------------- 2 ----------------------
//----------------- HELPER METHODS ---------------
// These methods house the dynamic parameters of the trials below. Each is a function that
// when called will determine the values of lang and resp_type to incorporate different
// languages and response types. EVERYTIME lang OR resp_type ARE USED, THEY MUST BE INSIDE
// A FUNCTION.

// var to store the task name (data property)
const phasename = 'cmst_instr_contOSN';

var instr_choice = function () {
  if (resp_mode == 'button') {
    return [lang.instructions.button.instr_choice];
  } else {
    return lang.instructions.key.instr_choice;
  }
};

var prompt0 = function () {
  if (resp_mode == 'button') {
    return lang.instructions.button.prompt0;
  } else {
    return lang.instructions.key.prompt0;
  }
};

var prompt_new = function () {
  if (resp_mode == 'button') {
    return lang.instructions.button.prompt_new;
  } else {
    return lang.instructions.key.prompt_new;
  }
};

var inc_new = function () {
  if (resp_mode == 'button') {
    return lang.instructions.button.inc_new;
  } else {
    return lang.instructions.key.inc_new;
  }
};

var cor_new = function () {
  return lang.instructions.cor_new;
};

var prompt_rep = function () {
  if (resp_mode == 'button') {
    return lang.instructions.button.prompt_rep;
  } else {
    return lang.instructions.key.prompt_rep;
  }
};

var inc_rep = function () {
  if (resp_mode == 'button') {
    return lang.instructions.button.inc_rep;
  } else {
    return lang.instructions.key.inc_rep;
  }
};

var cor_rep = function () {
  return lang.instructions.cor_rep;
};

var prompt_lure = function () {
  if (resp_mode == 'button') {
    return lang.instructions.button.prompt_lure;
  } else {
    return lang.instructions.key.prompt_lure;
  }
};

var inc_lure = function () {
  if (resp_mode == 'button') {
    return lang.instructions.button.inc_lure;
  } else {
    return lang.instructions.key.inc_lure;
  }
};

var cor_lure = function () {
  return lang.instructions.cor_lure;
};

var side_by_side = function () {
  if (resp_mode == 'button') {
    return lang.instructions.side_by_side + lang.instructions.button.continue;
  } else {
    return lang.instructions.side_by_side + lang.instructions.key.continue;
  }
};

var prompt_test = function () {
  if (resp_mode == 'button') {
    return lang.instructions.prompt_test + lang.instructions.button.trial_txt;
  } else {
    return lang.instructions.prompt_test + lang.instructions.key.trial_txt;
  }
};

var trial_choices = function () {
  if (resp_mode == 'button') {
    return [
      `${lang.instructions.button.trial_choices.old}`,
      `${lang.instructions.button.trial_choices.sim}`,
      `${lang.instructions.button.trial_choices.new}`,
    ];
  } else {
    return [
      `${lang.instructions.key.trial_choices.old}`,
      `${lang.instructions.key.trial_choices.sim}`,
      `${lang.instructions.key.trial_choices.new}`,
    ];
  }
};

//----------------------- 3 ----------------------
//-------------------- TRIALS --------------------
// These trials call the functions housing the parameter information.
// There is one keyboard version and one button version for everytrial that will be
// conditionally added to the main timeline depending on the resp_mode selection

//---------------intro---------------
var key_intro = {
  type: jsPsychHtmlKeyboardResponse,
  choices: instr_choice,
  prompt: prompt0,
  stimulus: function () {
    return lang.instructions.txt0;
  },
  data: { task: phasename },
};

var button_intro = {
  type: jsPsychHtmlButtonResponse,
  choices: instr_choice,
  prompt: prompt0,
  stimulus: function () {
    return lang.instructions.txt0;
  },
  data: { task: phasename },
};

//----------------new1----------------
// var key_new1 = {
//   type: jsPsychCategorizeImage,
//   stimulus: images['foil_1032.jpg'],
//   key_answer: function () {
//     return lang.instructions.key.trial_choices.new;
//   },
//   button_answer: 2,
//   choices: trial_choices,
//   prompt: prompt_new,
//   force_correct_button_press: true,
//   incorrect_text: inc_new,
//   correct_text: cor_new,
//   data: { task: phasename },
// };

// var button_new1 = {
//   type: jsPsychCategorizeImageButtons,
//   stimulus: images['foil_1032.jpg'],
//   key_answer: function () {
//     return lang.instructions.key.trial_choices.new;
//   },
//   button_answer: 2,
//   choices: trial_choices,
//   prompt: prompt_new,
//   force_correct_button_press: true,
//   incorrect_text: inc_new,
//   correct_text: cor_new,
//   data: { task: phasename },
// };

var new1 = {};
function refresh_instr_trials() {
  console.log('refreshing...');
  new1 = {
    type: resp_mode == 'button' ? jsPsychCategorizeImageButtons : jsPsychCategorizeImage,
    stimulus: images['foil_1032.jpg'],
    key_answer: function () {
      return lang.instructions.key.trial_choices.new;
    },
    button_answer: 2,
    choices: trial_choices,
    prompt: prompt_new,
    force_correct_button_press: true,
    incorrect_text: inc_new,
    correct_text: cor_new,
    data: { task: phasename },
  };
  console.log('refreshed instr trials');
}

//----------------new2----------------
var key_new2 = {
  type: jsPsychCategorizeImage,
  stimulus: images['foil_1033.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.new;
  },
  button_answer: 2,
  choices: trial_choices,
  prompt: prompt_new,
  force_correct_button_press: true,
  incorrect_text: inc_new,
  correct_text: cor_new,
  data: { task: phasename },
};

var button_new2 = {
  type: jsPsychCategorizeImageButtons,
  stimulus: images['foil_1033.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.new;
  },
  button_answer: 2,
  choices: trial_choices,
  prompt: prompt_new,
  force_correct_button_press: true,
  incorrect_text: inc_new,
  correct_text: cor_new,
  data: { task: phasename },
};

//----------------new3----------------
var key_new3 = {
  type: jsPsychCategorizeImage,
  stimulus: images['pcon026a.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.new;
  },
  button_answer: 2,
  choices: trial_choices,
  prompt: prompt_new,
  force_correct_button_press: true,
  incorrect_text: inc_new,
  correct_text: cor_new,
  data: { task: phasename },
};

var button_new3 = {
  type: jsPsychCategorizeImageButtons,
  stimulus: images['pcon026a.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.new;
  },
  button_answer: 2,
  choices: trial_choices,
  prompt: prompt_new,
  force_correct_button_press: true,
  incorrect_text: inc_new,
  correct_text: cor_new,
  data: { task: phasename },
};

//---------------repeat1---------------
var key_repeat1 = {
  type: jsPsychCategorizeImage,
  stimulus: images['foil_1033.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.old;
  },
  button_answer: 0,
  choices: trial_choices,
  prompt: prompt_rep,
  force_correct_button_press: true,
  incorrect_text: inc_rep,
  correct_text: cor_rep,
  data: { task: phasename },
};

var button_repeat1 = {
  type: jsPsychCategorizeImageButtons,
  stimulus: images['foil_1033.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.old;
  },
  button_answer: 0,
  choices: trial_choices,
  prompt: prompt_rep,
  force_correct_button_press: true,
  incorrect_text: inc_rep,
  correct_text: cor_rep,
  data: { task: phasename },
};

//----------------lure1----------------
var key_lure1 = {
  type: jsPsychCategorizeImage,
  stimulus: images['pcon026b.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.sim;
  },
  button_answer: 1,
  choices: trial_choices,
  prompt: prompt_lure,
  force_correct_button_press: true,
  incorrect_text: inc_lure,
  correct_text: cor_lure,
  data: { task: phasename },
};

var button_lure1 = {
  type: jsPsychCategorizeImageButtons,
  stimulus: images['pcon026b.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.sim;
  },
  button_answer: 1,
  choices: trial_choices,
  prompt: prompt_lure,
  force_correct_button_press: true,
  incorrect_text: inc_lure,
  correct_text: cor_lure,
  data: { task: phasename },
};

//-------------side_by_side1-------------
var key_side_by_side1 = {
  type: jsPsychCategorizeMultipleImageKeyboard,
  key_answer: function () {
    return lang.instructions.key.instr_choice;
  },
  button_answer: 0,
  feedback_duration: 0,
  stimulus: images['pcon026a.jpg'],
  stimulus2: images['pcon026b.jpg'],
  choices: instr_choice,
  prompt: side_by_side,
  data: { task: phasename },
};

var button_side_by_side1 = {
  type: jsPsychCategorizeMultipleImageButtons,
  key_answer: function () {
    return lang.instructions.key.instr_choice;
  },
  button_answer: 0,
  feedback_duration: 0,
  stimulus: images['pcon026a.jpg'],
  stimulus2: images['pcon026b.jpg'],
  choices: instr_choice,
  prompt: side_by_side,
  data: { task: phasename },
};

//----------------new4----------------
var key_new4 = {
  type: jsPsychCategorizeImage,
  stimulus: images['foil_1035.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.new;
  },
  button_answer: 2,
  choices: trial_choices,
  prompt: prompt_test,
  force_correct_button_press: true,
  incorrect_text: inc_new,
  correct_text: cor_new,
  data: { task: phasename },
};

var button_new4 = {
  type: jsPsychCategorizeImageButtons,
  stimulus: images['foil_1035.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.new;
  },
  button_answer: 2,
  choices: trial_choices,
  prompt: prompt_test,
  force_correct_button_press: true,
  incorrect_text: inc_new,
  correct_text: cor_new,
  data: { task: phasename },
};

//----------------new5----------------
var key_new5 = {
  type: jsPsychCategorizeImage,
  stimulus: images['pcon028a.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.new;
  },
  button_answer: 2,
  choices: trial_choices,
  prompt: prompt_test,
  force_correct_button_press: true,
  incorrect_text: inc_new,
  correct_text: cor_new,
  data: { task: phasename },
};

var button_new5 = {
  type: jsPsychCategorizeImageButtons,
  stimulus: images['pcon028a.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.new;
  },
  button_answer: 2,
  choices: trial_choices,
  prompt: prompt_test,
  force_correct_button_press: true,
  incorrect_text: inc_new,
  correct_text: cor_new,
  data: { task: phasename },
};

//---------------repeat2---------------
var key_repeat2 = {
  type: jsPsychCategorizeImage,
  stimulus: images['foil_1035.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.old;
  },
  button_answer: 0,
  choices: trial_choices,
  prompt: prompt_test,
  force_correct_button_press: true,
  incorrect_text: inc_rep,
  correct_text: cor_rep,
  data: { task: phasename },
};

var button_repeat2 = {
  type: jsPsychCategorizeImageButtons,
  stimulus: images['foil_1035.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.old;
  },
  button_answer: 0,
  choices: trial_choices,
  prompt: prompt_test,
  force_correct_button_press: true,
  incorrect_text: inc_rep,
  correct_text: cor_rep,
  data: { task: phasename },
};

//----------------lure2----------------
var key_lure2 = {
  type: jsPsychCategorizeImage,
  stimulus: images['pcon028b.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.sim;
  },
  button_answer: 1,
  choices: trial_choices,
  prompt: prompt_test,
  force_correct_button_press: true,
  incorrect_text: inc_lure,
  correct_text: cor_lure,
  data: { task: phasename },
};

var button_lure2 = {
  type: jsPsychCategorizeImageButtons,
  stimulus: images['pcon028b.jpg'],
  key_answer: function () {
    return lang.instructions.key.trial_choices.sim;
  },
  button_answer: 1,
  choices: trial_choices,
  prompt: prompt_test,
  force_correct_button_press: true,
  incorrect_text: inc_lure,
  correct_text: cor_lure,
  data: { task: phasename },
};

//-------------side_by_side2-------------
var key_side_by_side2 = {
  type: jsPsychCategorizeMultipleImageKeyboard,
  key_answer: function () {
    return lang.instructions.key.instr_choice;
  },
  button_answer: 0,
  feedback_duration: 0,
  stimulus: images['pcon028a.jpg'],
  stimulus2: images['pcon028b.jpg'],
  choices: instr_choice,
  prompt: side_by_side,
  data: { task: phasename },
};

var button_side_by_side2 = {
  type: jsPsychCategorizeMultipleImageButtons,
  key_answer: function () {
    return lang.instructions.key.instr_choice;
  },
  button_answer: 0,
  feedback_duration: 0,
  stimulus: images['pcon028a.jpg'],
  stimulus2: images['pcon028b.jpg'],
  choices: instr_choice,
  prompt: side_by_side,
  data: { task: phasename },
};

//------------------outro------------------
var key_outtro = {
  type: jsPsychHtmlKeyboardResponse,
  choices: instr_choice,
  prompt: prompt0,
  stimulus: function () {
    return lang.instructions.end;
  },
  data: { task: phasename },
};

var button_outtro = {
  type: jsPsychHtmlButtonResponse,
  choices: instr_choice,
  prompt: prompt0,
  stimulus: function () {
    return lang.instructions.end;
  },
  data: { task: phasename },
};

//----------------------- 4 ----------------------
//-------------------- EXPORTS -------------------
// export the trials to be imported to the main timeline

export {
  key_intro,
  button_intro,
  //key_new1, button_new1,
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
  refresh_instr_trials,
};
