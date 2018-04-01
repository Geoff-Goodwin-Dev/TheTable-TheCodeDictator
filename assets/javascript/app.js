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
  let versionsOfId = ['id', 'ID', 'Id', 'I.D.', 'i.d.', 'identifier'];
  let versionsOfClass =  ['class', 'Class'];
  let elementMatchCount = 0;
  let idText;
  let classText;
  let submittedChat;
  let elementObjectIndex;

  let final;
  let interim;
  let recognizing;

  const elementsObjectsArray = [
    {
      position: 0,
      name: 'div',
      openTag: '<div',
      closingTag: '</div>',
      aliases: ['division', 'divider', 'div']
    },
    {
      position: 1,
      name: 'p',
      openTag: '<p',
      closingTag: '</p>',
      aliases: ['paragraph', 'par', 'p']
    },
    {
      position: 2,
      name: 'h1',
      openTag: '<h1',
      closingTag: '</h1>',
      aliases: ['heading1', 'heading 1', 'headingone', 'heading one', 'h1']
    }
  ];

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

  // ============= Submit Button Click Code ============= \\
  submitToChat.on('click', function() {
    event.preventDefault();
    submittedChat = chatTextArea.val().trim();
    chatTextArea.empty();
    chatTextArea.val('');

    console.log(submittedChat);
    splitIntoArray(submittedChat);

    spellCheck();
    console.log(sentenceArray);

    recognition = "";
  });
  // ============= END OF: Submit Button Click Code ============= \\

  // ============= Spelling Validation Code ============= \\
  function spellCheck () {
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
        recognition = "";
      } else {
        console.log("Spelling validation passed!");
        recognition = "";
      }

      // Checks to see if the spell-check corrected statement contains an HTML element
      let result = checkSubmittedTextForElement();
      // console.log("final result:", result);
      elementMatchCount = 0; // resets element match count for future checks

      if (result === "No matching elements found") {
        console.log("I did not find any matching elements in your statement");
      }
      else if (result === "More than one element match found") {
        console.log("I can only create one element at a time.  Which would element do you want to create first?");
      }
      else {
        let selectedElement = elementsObjectsArray[result].name;
        let selectedElementOpenTag = elementsObjectsArray[result].openTag;
        let selectedElementClosingTag = elementsObjectsArray[result].closingTag;
        // console.log(selectedElement, selectedElementOpenTag, selectedElementClosingTag);

        // Checks to see if the spell-checked statement which contains a single HTML also has an ID
        let idResult = checkSubmittedTextForId();

        let classResult = checkSubmittedTextForClass();

        let tagRender = selectedElementOpenTag + idResult + classResult + '>' + selectedElementClosingTag;
        console.log(tagRender);
      }
    });
  }
  // ============= END OF: Spelling Validation Code ============= \\

  // ============= Presence of HTML Element Validation Code ============= \\
  function checkSubmittedTextForElement() {
    sentenceArray.forEach(function(word) {
      elementsObjectsArray.forEach(function(element) {
        let aliasesArray = element.aliases;
        aliasesArray.forEach(function(alias) {
          if (alias === word) {
            elementMatchCount++;
            elementObjectIndex = element.position;
            // console.log("match found: " + alias + " in: " + element.name + " index: " + elementObjectIndex)
          }
        });
      });
    });
    switch (elementMatchCount) {
      // NO MATCHES FOUND
      case 0:
        return "No matching elements found";

      // ONY ONE MATCH FOUND
      case 1:
        // console.log("element referenced:", elementsObjectsArray[elementObjectIndex].name);
        return elementObjectIndex;

      // MORE THAN ONE ELEMENT MATCH IS FOUND
      default:
        return "More than one element match found";
    }
  }
  // ============= END OF: Presence of HTML Element Validation Code ============= \\

  // ============= Presence of ID attribute Validation Code ============= \\
  function checkSubmittedTextForId() {
    let idFound = false;
    let idResponse = '';
      sentenceArray.forEach(function(word) {
      versionsOfId.forEach(function (wordId) {
        if (word === wordId) {
          idFound = true;
          let idIndex = sentenceArray.indexOf(wordId);
          if (ofEqualsArray.includes(sentenceArray[idIndex + 1]) === true) {
            idText = sentenceArray[idIndex + 2];
          }
          else {
            idText = sentenceArray[idIndex + 1];
          }
        }
      })
    });
    if (idFound === true) {
      console.log('ID text:', idText);
      idResponse = ' id="' + idText + '"';
    }
    else {
      console.log('No ID attribute found');
    }
    return idResponse
  }
  // ============= END OF: Presence of ID attribute Validation Code ============= \\

  // ============= Presence of Class attribute Validation Code ============= \\
  function checkSubmittedTextForClass() {
    let classFound = false;
    let classResponse = '';
    let classesArray = [];
    let classWordInstanceIndexArray = [];
    sentenceArray.forEach(function(word) {
      versionsOfClass.forEach(function (wordClass) {
        if (word === wordClass) {
          classFound = true;
          let classIndex = sentenceArray.indexOf(word);
          if (ofEqualsArray.includes(sentenceArray[classIndex + 1]) === true) {
            classText = sentenceArray[classIndex + 2];
          }
          else {
            classText = sentenceArray[classIndex + 1];
          }
          classesArray.push(classText)
        }
      })
    });
    if (classFound === true) {
      console.log('Class text:', classesArray);
      classResponse = ' class="' + classesArray.join(' ') + '"';
    }
    else {
      console.log('No class attribute found');
    }
    return classResponse
  }
  // ============= END OF: Presence of Class attribute Validation Code ============= \\

  // ==============================NEEDS TO BE WORKED INTO ABOVE=========

  function checkTextForElement(){
    if (sentenceArray.includes('division') && sentenceArray.includes('ID') && sentenceArray.includes('class')) {
      // ID
      let idIndex = sentenceArray.indexOf('ID');
      if (ofEqualsArray.includes(sentenceArray[idIndex + 1]) === true) {
        idText = sentenceArray[idIndex + 2];
      }
      else {
        idText = sentenceArray[idIndex + 1];
      }

      // CLASS
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