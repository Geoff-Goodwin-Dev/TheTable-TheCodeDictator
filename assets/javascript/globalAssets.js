var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

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

console.log('Initiated! Assets loaded');

function splitIntoArray(string) {
  sentenceArray = string.split(' ');
  return sentenceArray;
}

function getTimestamp() {
  return moment().format('hh:mm:ss a');
}

function sanitizeSentence(rawSentence) {
  // removes special characters
  let submittedChatPostSpellCheckSpecialCharsRemoved = rawSentence.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"");
  console.log('sentence post spell check and special chars removed:', submittedChatPostSpellCheckSpecialCharsRemoved);
  // removes extra spaces from between words
  let sanitizedSentenceExtraSpacesRemoved = submittedChatPostSpellCheckSpecialCharsRemoved.replace(/\s{2,}/g," ");
  console.log('sentence post spell check and special chars and extra spaces removed:', sanitizedSentenceExtraSpacesRemoved);
  // converts to lower case before returning sanitized sentence to check for matches
  return sanitizedSentenceExtraSpacesRemoved.toLowerCase()
}

function createChatLineItem(who, what) {
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
}

function chatSubmitHandler() {
  let chatTextArea = $('#chatTextArea');
  submittedChat = chatTextArea.text().trim();
  chatTextArea.empty();
  console.log(submittedChat);
  createChatLineItem('You', submittedChat);
  splitIntoArray(submittedChat);
  if ($('#doSpellCheck').prop('checked') === true) {
    // console.log("spellcheck enabled");
    spellCheck();
  }
  else {
    // console.log("spell check not enabled")
    knownCommandsCheck();
    recognition = '';
  }
  console.log(sentenceArray);
}

function getElementTreeText() {
  elementTreeData = '';
  $('.CodeMirror-line').each(function () {
    elementTreeData = elementTreeData + $(this).text() + '\n';
  });
  return elementTreeData;
}

// selects text of item based on supplied element ID
function selectText(element) {
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
}