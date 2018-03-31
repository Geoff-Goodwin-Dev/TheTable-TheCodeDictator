$(document).ready(function(){
  console.log("initiated");

  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
  var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

  let dictationResultOutput = $('#result');
  let convertedOutput = $('#output');
  let submitToChat = $('#submitToChat');
  let chatTextArea = $('#chatTextArea');
  let interimTextDisplay = $('#interimTextDisplay');
  let dictationButton = $('#dictationButton');

  let sentenceArray = [];
  let ofEqualsArray = ['of', 'equals', 'is'];
  let idText;
  let classText;
  let submittedChat;

  let final;
  let interim;
  let recognizing;

  function reset() {
    recognizing = false;
    dictationButton.text('Click to Speak');
  }

  function toggleStartStop() {
    if (recognizing) {
      recognition.stop();
      reset();
    } else {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      reset();

      recognition.start();
      recognizing = true;
      recognition.onend = reset;

      recognition.onresult = function(e) {
        final = '';
        interim = '';
        for (let i = 0; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            final += e.results[i][0].transcript;
            console.log("final transcription:", e.results[i][0].transcript);

          } else {
            interim += e.results[i][0].transcript;
          }
        }

        chatTextArea.text(final);
        interimTextDisplay.text(interim);
      };

      dictationButton.text('Click to Stop');
      chatTextArea.text('');
      interimTextDisplay.text('');
    }
  }

  function splitIntoArray(string) {
    sentenceArray = string.split(' ');
  }

  dictationButton.on('click', function(){
    toggleStartStop();
  });

  submitToChat.on('click', function() {
    event.preventDefault();
    submittedChat = chatTextArea.val().trim();
    chatTextArea.empty();
    console.log(submittedChat);
    splitIntoArray(submittedChat);
    console.log(sentenceArray);
    checkTextForElement();
    recognition = "";
  });

  function tagConstructor (elementTag, elementID, elementClass) {
    // NEEDS DEFINITITION
  }

  // ==============================NEEDS TO BE WORKED INTO ABOVE=========

  function checkTextForElement(){
    if (sentenceArray.includes('division') && sentenceArray.includes('ID') && sentenceArray.includes('class')) {
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
      console.log('<div id="' + idText + '" class="' + classText +'"></div>')
    }

    else if (sentenceArray.includes('division') && sentenceArray.includes('class')) {
      let classIndex = sentenceArray.indexOf('class');
      if (ofEqualsArray.includes(sentenceArray[classIndex + 1]) === true) {
        classText = sentenceArray[classIndex + 2];
      }
      else {
        classText = sentenceArray[classIndex + 1];
      }
      console.log('<div class="' + classText +'"></div>');
    }

    else if (sentenceArray.includes('division') && sentenceArray.includes('ID')) {
      let idIndex = sentenceArray.indexOf('ID');
      if (ofEqualsArray.includes(sentenceArray[idIndex + 1]) === true) {
        idText = sentenceArray[idIndex + 2];
      }
      else {
        idText = sentenceArray[idIndex + 1];
      }
      console.log('<div id="' + idText + '"></div>');
    }
    else if (sentenceArray.includes('division')) {
      console.log('<div></div>');
    }
    else {
      console.log('I did not understand')
    }
  }
});