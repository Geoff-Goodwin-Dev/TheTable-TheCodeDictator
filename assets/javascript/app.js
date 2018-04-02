$(document).ready(function(){
  console.log('Initiated!');

  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
  var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

  let submitToChat = $('#submitToChat');
  let chatTextArea = $('#chatTextArea');
  let interimTextDisplay = $('#interimTextDisplay');
  let dictationButton = $('#dictationButton');
  let chatDisplay = $('#chatDisplay');
  let elementGeneration = $('#elementGeneration');

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

  let myCodeMirror = CodeMirror(document.getElementById('elementTree'), {
    value: "<!DOCTYPE html>\n" +
    "<html lang=\"en\">\n" +
    "<head>\n" +
    "  <meta charset=\"UTF-8\">\n" +
    "  <title>Title</title>\n" +
    "</head>\n" +
    "<body>\n" +
    "\n" +
    "</body>\n" +
    "</html>\n",
    mode:  "htmlmixed"
  });

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
            console.log('final transcription:', e.results[i][0].transcript);

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

  // takes an array and splits along space characters
  function splitIntoArray(string) {
    sentenceArray = string.split(' ');
    return sentenceArray;
  }

  // grabs current timestamp for use in the chat window display
  function getTimestamp() {
    return moment().format('hh:mm:ss a');
  }

  function createChatLineItem(who, what) {
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
    submittedChat = chatTextArea.text().trim();
    chatTextArea.empty();
    console.log(submittedChat);
    createChatLineItem('You', submittedChat);
    splitIntoArray(submittedChat);
    spellCheck();
    console.log(sentenceArray);
    recognition = '';
  }

  // ============= Utility Event Handlers ============= \\
  // click handler to start or stop voice-to-text dictation
  dictationButton.on('click', function(){
    toggleStartStop();
  });

  // enter button handler when chat box is in focus
  chatTextArea.keypress(function(event) {
    if (event.which === 13) {
      document.execCommand('insertHTML', false, '<div></div>');
      chatSubmitHandler();
      return false;
    }
  });

  // submit button handler
  submitToChat.on('click', function() {
    event.preventDefault();
    chatSubmitHandler();
  });
  // ============= END OF: Utility Event Handlers ============= \\

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
        console.log('Before fixing mistakes (if any):', sentenceArray);
        for (let i = 0; i < response.flaggedTokens.length; i++) {
          sentenceArray[sentenceArray.indexOf(response.flaggedTokens[i].token)] = response.flaggedTokens[i].suggestions[0].suggestion;
        }
        console.log('After fixing mistakes:', sentenceArray);
        // console.log('I believe you meant... ', sentenceArray.join(' '));
        let message = 'I believe you meant... "' + sentenceArray.join(' ') + '"';
        createChatLineItem('Computer', message);
        recognition = '';
      } else {
        console.log('Spelling validation passed!');
        recognition = '';
      }

      // Checks to see if the spell-check corrected statement contains an HTML element
      let result = checkSubmittedTextForElement();
      elementMatchCount = 0; // resets element match count for future checks

      if (result === 'No matching elements found') {
        createChatLineItem('Computer', 'I could not find any matching elements in your statement');
      }
      else if (result === 'More than one element match found') {
        createChatLineItem('Computer', 'I can only create one element at a time.  Which element do you want to create first?');
      }
      else {
        let selectedElement = elementsObjectsArray[result].name;
        let selectedElementOpenTag = elementsObjectsArray[result].openTag;
        let selectedElementClosingTag = elementsObjectsArray[result].closingTag;

        console.log(selectedElement, selectedElementOpenTag, selectedElementClosingTag);

        // Checks to see if the spell-checked statement which contains a single HTML also has an ID
        let idResult = checkSubmittedTextForId();

        let classResult = checkSubmittedTextForClass();

        let tagRender = selectedElementOpenTag + idResult + classResult + '>' + selectedElementClosingTag;

        createChatLineItem('Computer', 'If I understand correctly, you are looking for an element tag creation.  Coming right up!');
        console.log(tagRender);
        let currentElements = elementGeneration.text();
        elementGeneration.text(currentElements + tagRender + '\n');
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

      // ONLY ONE MATCH FOUND
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
    let sentenceArrayCopy = sentenceArray.slice();
    sentenceArrayCopy.forEach(function(word) {
      versionsOfClass.forEach(function (wordClass) {
        if (word === wordClass) {
          classFound = true;
          let classIndex = sentenceArrayCopy.indexOf(word);
          if (ofEqualsArray.includes(sentenceArray[classIndex + 1]) === true) {
            classText = sentenceArrayCopy[classIndex + 2];
            sentenceArrayCopy.splice(classIndex, 1);
          }
          else {
            classText = sentenceArrayCopy[classIndex + 1];
            sentenceArrayCopy.splice(classIndex, 1);
          }
          classesArray.push(classText)
        }
      });
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
});