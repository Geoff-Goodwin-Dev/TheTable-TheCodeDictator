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
  let chatDisplay = $('#chatDisplay');

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
    return sentenceArray;
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

    // ============= Spelling Validation Code ============= \\
		var queryURL = "https://api.cognitive.microsoft.com/bing/v7.0/spellcheck?text=" + submittedChat;

		// Performing our AJAX GET request
		$.ajax({
			url: queryURL,
			method: "GET",
			headers: {
				"Ocp-Apim-Subscription-Key": "3606c69fe0fd4e23ad73b2955bf6fcf7",
				"Accept": "application/json",
			}
		})
    // After the data comes back from the API ...
        .then(function (response) {
				  console.log(response);
          // IF errors were found...
					if (response.flaggedTokens.length > 0) {
						console.log("Before fixing mistakes (if any): " + sentenceArray);
						for (var i = 0; i < response.flaggedTokens.length; i++) {
							sentenceArray[sentenceArray.indexOf(response.flaggedTokens[i].token)] = response.flaggedTokens[i].suggestions[0].suggestion;
						}
						console.log("After fixing mistakes: " + sentenceArray);
						console.log("I believe you meant... " + sentenceArray.join(" "));
						checkTextForElement();
						recognition = "";
					} else {
					  console.log("Spelling validation passed!");
						checkTextForElement();
						recognition = "";
          }
        });
		// ============= END OF: Spelling Validation Code ============= \\
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
      console.log('<div id="' + idText + '" class="' + classText +'"></div>');
      chatDisplay.append('<br><div></div>test: ' + idText);
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
      chatDisplay.append('<div class="' + classText +'"></div>');
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
			chatDisplay.append('<div id="' + idText + '"></div>');
    }
    else if (sentenceArray.includes('division')) {
      console.log('<div></div>');
      chatDisplay.append('<div></div>');
    }
    else {
      console.log('I did not understand');
      chatDisplay.append('<br>I did not understand');
    }
  }
});