$(document).ready(function(){

  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
  var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

  let dictationResultOutput = $('#result');
  let convertedOutput = $('#output');
  let submitToChat = $('#submitToChat');
  let chatTextArea = $('#finalDictationText');
  let interimTextDisplay = $('#interimDictation');
  let dictationButton = $('#dictationButton');

  let sentenceArray = [];
  let ofEqualsArray = ['of', 'equals', 'is'];
  let idText;
  let classText;
  let submittedChat;

  let final;
  let interim;
  let recognizing;

  let recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  reset();

  recognition.onend = reset;

  recognition.onresult = function(e) {
    final = '';
    interim = '';
    for (let i = 0; i < e.results.length; ++i) {
      if (e.results[i].isFinal) {
        final += e.results[i][0].transcript;
      } else {
        interim += e.results[i][0].transcript;
      }
    }
    chatTextArea.text(final);
    interimTextDisplay.text(interim);
  };

  function reset() {
    recognizing = false;
    dictationButton.text('Click to Speak');
  }

  function toggleStartStop() {
    if (recognizing) {
      recognition.stop();
      reset();
    } else {
      recognition.start();
      recognizing = true;
      dictationButton.text('Click to Stop');
      chatTextArea.text('');
      interimTextDisplay.text('');
    }
  }

  function splitIntoArray(string) {
    sentenceArray = string.split(' ');
  }

  function emptyChatEntry(){
    chatTextArea.val('');
    reset();
  }

  dictationButton.on('click', function(){
    toggleStartStop();
  });

  submitToChat.on('click', function() {
    event.preventDefault();
    submittedChat = chatTextArea.val().trim();
    emptyChatEntry();
    console.log(submittedChat);
    splitIntoArray(submittedChat);
    console.log(sentenceArray);
  });

  function tagConstructor (elementTag, elementID, elementClass) {
    // NEEDS DEFINITITION
  }

  // ==============================NEEDS TO BE WORKED INTO ABOVE=========
  if (sentenceArray.includes('division') && speechResult.includes('ID') && speechResult.includes('class')) {
    let idIndex = sentenceArray.indexOf('ID');
    if (ofEqualsArray.includes(sentenceArray[idIndex + 1]) === true) {
      idText = sentenceArray[idIndex + 2];
    }
    else {
      idText = sentenceArray[idIndex + 1];
    }
    let classIndex = sentenceArray.indexOf('class');
    if (ofEqualsArray.includes(sentenceArray[classIndex + 1]) === true) {
      classText = sentenceArray[classIndex + 2];
    }
    else {
      classText = sentenceArray[classIndex + 1];
    }
    dictationResultOutput.text('<div id="' + idText + '" class="' + classText +'"></div>').css('backgroundColor', 'lime');
  }

  else if (sentenceArray.includes('division') && speechResult.includes('class')) {
    let classIndex = sentenceArray.indexOf('class');
    if (ofEqualsArray.includes(sentenceArray[classIndex + 1]) === true) {
      classText = sentenceArray[classIndex + 2];
    }
    else {
      classText = sentenceArray[classIndex + 1];
    }
    dictationResultOutput.text('<div class="' + classText +'"></div>').css('backgroundColor', 'lime');
  }

  else if (sentenceArray.includes('division') && speechResult.includes('ID')) {
    let idIndex = sentenceArray.indexOf('ID');
    if (ofEqualsArray.includes(sentenceArray[idIndex + 1]) === true) {
      idText = sentenceArray[idIndex + 2];
    }
    else {
      idText = sentenceArray[idIndex + 1];
    }
    dictationResultOutput.text('<div id="' + idText + '"></div>').css('backgroundColor', 'lime');
  }
  else if (sentenceArray.includes('division')) {
    dictationResultOutput.text('<div></div>').css('backgroundColor', 'lime');
  }
  else {
    dictationResultOutput.text('That didn\'t sound right.').css('backgroundColor', 'red');
  }


});