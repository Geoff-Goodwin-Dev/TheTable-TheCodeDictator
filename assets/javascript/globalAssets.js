/*=================================================================================================================
WEB SPEECH API VAR DECLARATIONS:
* The purpose of the below variable declarations is to help facilitate the Web Speech API to work in both Chrome
  as well as Firefox

* Chrome needs the "webkit" prefix to work whereas Firefox understands these variables without the prefix
__________________________________________________________________________________________________________________*/
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
/*================================================================================================================*/

//GLOBAL VARIABLE DECLARATIONS:
let validatorWindowExpanded = false;
let multiWord;
let elementObjectIndex;
let sentenceArray = [];
let ofEqualsArray = ['of', 'equals', 'is'];
let versionsOfId = ['id', 'ID', 'Id', 'I.D.', 'i.d.', 'identifier'];
let versionsOfClass =  ['class', 'Class'];
let elementMatchCount = 0;
let elementCreatedCounter = 1;
let idText;
let classText;
let submittedChat;
let elementTreeData = ""; //must be initialized as empty string or else validator logic breaks
let final;
let interim;
let recognizing;

/*=================================================================================================================
SPLIT INTO ARRAY:
* The purpose of the below function is to take in a raw string and split it on space characters and save it to an
  array which is then returned to the calling function
__________________________________________________________________________________________________________________*/
const splitIntoArray = (string) => {
  sentenceArray = string.split(' ');
  return sentenceArray;
};
/*================================================================================================================*/


/*=================================================================================================================
GET TIMESTAMP:
* The purpose of the below function is to grab the current time snapshot using Moment.js and return it to the
  calling function
__________________________________________________________________________________________________________________*/
const getTimestamp = () => {
  return moment().format('hh:mm:ss a');
};
/*================================================================================================================*/


/*=================================================================================================================
SANITIZE SENTENCE:
* The purpose of the below function is to take a provided string and remove any instances of special characters
  using regex from a pre-defined list: . , \ / # ! ? $ % \ ^ & \ * ; : { } = \ - _ ` ~ ( )

* Because only special characters were removed, it then has to go back and look for replace multiple spaces with
  single spaces
__________________________________________________________________________________________________________________*/
const sanitizeSentence = (string) => {
  return string.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").toLowerCase();
};
/*================================================================================================================*/


/*=================================================================================================================
CREATE CHAT LINE ITEM:
* The purpose of the below function is to take two arguments indicating who was initiating the chat and what the
  contents of the message submitted and then call the getTimestamp function which are all the elements that make
  up a chat line item

* Based on who is submitting the chat as indicated in the arguments, classes are added to control color-coding
  through CSS

* Lastly, the rendered chat item will cause the window to scroll to bottom with jQuery animation
__________________________________________________________________________________________________________________*/
const createChatLineItem = (who, what) => {
  let chatDisplay = $('#chatDisplay');
  let itemWho = $('<span>');
  if (who === 'You') {
    itemWho.addClass('userChat');
  }
  else {
    itemWho.addClass('computerChat');
  }
  itemWho.text(who);
  let itemWhen = $('<span>');
  itemWhen.addClass('timestamp').text(' (' + getTimestamp() + '): ');
  chatDisplay.append(itemWho, itemWhen, what, '<br>')
    .animate({
      scrollTop: chatDisplay[0].scrollHeight - chatDisplay[0].clientHeight
    }, 300);
};
/*================================================================================================================*/


/*=================================================================================================================
CHAT SUBMIT HANDLER:
* The purpose of the below function is to take the text contents from the chat text entry div and submit the
  contents for processing

* It first starts by clearing the voice recognition variable from the voice to text transcription

* Next, it grabs the text contents, stores the contents to submittedChat, and empties the chat text entry div

* The submitted chat contents are then sent on a call to the createChatLineItem function for addition to the chat
  display

* Lastly, the submitted chat is sent either via a call to the spellCheck function or to the knownCommandsCheck
  function dependent on the "perform spell check" checkbox status
__________________________________________________________________________________________________________________*/
const chatSubmitHandler = () => {
  recognition = '';
  let chatTextArea = $('#chatTextArea');
  submittedChat = chatTextArea.text().trim();
  chatTextArea.empty();
  createChatLineItem('You', submittedChat);
  splitIntoArray(submittedChat); //need to come back and move this to its proper location
  if ($('#doSpellCheck').prop('checked') === true) {
    spellCheck(submittedChat);
  }
  else {
    knownCommandsCheck();
    console.log('no spell-check sentence array:', sentenceArray);
  }
};
/*================================================================================================================*/


/*=================================================================================================================
GET ELEMENT TREE TEXT:
* The purpose of the below function is to grab the text contents of each div with a class of "CodeMirror-Line" that
  is found in the Code Mirror IDE window and store it on its own line to the elementTreeData variable for return to
  the calling function
__________________________________________________________________________________________________________________*/
const getElementTreeText = () => {
  elementTreeData = '';
  $('.CodeMirror-line').map((i, line) => {
    elementTreeData = elementTreeData + $(line).text() + '\n';
  });
  return elementTreeData;
};
/*================================================================================================================*/

/*=================================================================================================================
SELECT ELEMENT:
* The purpose of the below function is to select the text contents of a particular element based on the supplied
  element ID argument
__________________________________________________________________________________________________________________*/
const selectText = (element) => {
  let doc = document, text = doc.getElementById(element), range, selection;
  if (doc.body.createTextRange) {
    range = document.body.createTextRange();
    range.moveToElementText(text);
    range.select();
  } else if (window.getSelection) {
    selection = window.getSelection();
    range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
/*================================================================================================================*/

console.log('Initiated! Global Assets are loaded');