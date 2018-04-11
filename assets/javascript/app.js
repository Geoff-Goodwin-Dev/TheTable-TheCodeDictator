$(document).ready(function(){
  onPageLoadInitialize();
  console.log('Initiated!');

  let elementGeneration = $('#elementGeneration');

  let myCodeMirror = CodeMirror(document.getElementById('elementTree'), {
    value: '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">\n' +
    '  <meta http-equiv="X-UA-Compatible" content="ie=edge">\n' +
    '  <title>Title</title>\n' +
    '</head>\n' +
    '<body>\n' +
    '\n' +
    '</body>\n' +
    '</html>',
    mode:  'htmlmixed',
    tabSize: 2,
    lineNumbers: true
  });

  // ============= Speech Recognition Functions ============= \\
  function toggleStartStop() {
    let chatTextArea = $('#chatTextArea');
    let micIcon = $('#microphoneIcon');
    let interimTextDisplay = $('#interimTextDisplay');
    let transcriptDisplay = $('#interimTextDisplayLabel');

    if (recognizing === true) {
      recognition.stop();
      micIcon.attr("src", "assets/images/micOff.png");
      recognizing = false;
    }
    else {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.start();
      micIcon.attr("src", "assets/images/micOn.png");
      recognizing = true;
      recognition.onend = function() {
        recognizing = false;
        micIcon.attr("src", "assets/images/micOff.png");
      };
      recognition.onresult = function(e) {
        final = '';
        interim = '';
        for (let i = 0; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            final += e.results[i][0].transcript;
            console.log('final transcription:', e.results[i][0].transcript);
            chatTextArea.focus();
            if (recognizing === true) {
              toggleStartStop();
              transcriptDisplay.toggle();
            }
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        chatTextArea.text(final);
        interimTextDisplay.text(interim);
      };
      chatTextArea.text('');
      interimTextDisplay.text('');
    }
  }
  // ============= END OF: Speech Recognition Functions ============= \\

  // click handler to start or stop voice-to-text dictation
  $('#dictationButton').on('click', function(){
    $('#interimTextDisplayLabel').toggle();
    toggleStartStop();
  });

  // enter button handler when chat box is in focus
  $('#chatTextArea').keypress(function(event) {
    if (event.which === 13) {
      document.execCommand('insertHTML', false, '<div></div>');
      chatSubmitHandler();
      return false;
    }
  });

  // submit button handler
  $('#submitToChat').on('click', function() {
    event.preventDefault();
    chatSubmitHandler();
  });

  // click to select rendered tag from element generation window
  $('#elementGeneration').on('click','.renderedTag', function (event) {
    if (event.shiftKey) {
      let clickedElement = this.id;
      selectText(clickedElement);
    }
  });


  // FUNCTION FOR EXPANDING CODE-CHECK VALIDATION RESULTS BAR
  $('#validatorInstructions').click(function() {
    $('.validationContent').slideToggle('400');
    if (validatorWindowExpanded === false) {
      $("#viewClose").text("close");
      validatorWindowExpanded = true;
    }
    else {
      $("#viewClose").text("view");
      validatorWindowExpanded = false;
    }
  });

  $('#validateCode').on('click', function() {
    event.preventDefault();
    $('#list').text("");
    codeValidator();
    if (validatorWindowExpanded === false) {
      $("#viewClose").text("close");
      $('.validationContent').slideToggle('400');
      validatorWindowExpanded = true;
    }
  });

  $('#emailSend').on('click', function(){
    if ($('#email').hasClass('validate valid')){
      sendEmail();
      $('#email').val('');
      $('#emailSubject').val('');
    } else {
      // Do nothing
    }

  });
});


// Checks submitted text against a list of known functional commands not specificlly related to element creation
function knownCommandsCheck () {
  let submittedChatPostSpellCheck = sentenceArray.join(' ');
  console.log('sentence post spell check:', submittedChatPostSpellCheck);
  // removes special characters
  let submittedChatPostSpellCheckSpecialCharsRemoved = submittedChatPostSpellCheck.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"");
  console.log('sentence post spell check and special chars removed:', submittedChatPostSpellCheckSpecialCharsRemoved);
  // removes extra spaces from between words
  let sanitizedSentenceExtraSpacesRemoved = submittedChatPostSpellCheckSpecialCharsRemoved.replace(/\s{2,}/g," ");
  console.log('sentence post spell check and special chars and extra spaces removed:', sanitizedSentenceExtraSpacesRemoved);
  // converts to lower case before sending to check for matches
  sanitizedSentenceExtraSpacesRemoved = sanitizedSentenceExtraSpacesRemoved.toLowerCase();
  let result = checkSanitizedSentenceAgainstKnownCommands(sanitizedSentenceExtraSpacesRemoved);
  // how the system handles if there are no known commands found
  if (result === 0) {
    checkSubmittedTextForElementPostSpellCheck();
  }
  //handler for if a known command is found
  else {
    console.log('returned result', result);
    switch (result) {
      case 'meaning of life':
        createChatLineItem('The Dictator', computerMessages.meaningOfLife);
        break;
      case 'what is love':
        createChatLineItem('The Dictator', computerMessages.whatIsLove);
        break;
      case 'log element tree':
        console.log(CodeMirror.value);
        break;

      default:
        console.log('no behavior found for', result);
    }
  }
}

// Checks to see if the spell-check corrected statement contains an HTML element
function checkSubmittedTextForElementPostSpellCheck() {
  let result = checkSubmittedTextForMultiWords();
  elementMatchCount = 0; // resets element match count for future checks

  if (result === 'No matching elements found') {
    createChatLineItem('The Dictator', computerMessages.noElementsFound);
  }
  else if (result === 'More than one element match found') {
    createChatLineItem('The Dictator', computerMessages.tooManyElementsFound);
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

    createChatLineItem('The Dictator', computerMessages.creatingElement);
    console.log(tagRender);
    let newElementSpan = $('<span>');
    let newElementSpanId = 'elementSpan' + elementCreatedCounter;
    newElementSpan.attr('id', newElementSpanId).addClass('renderedTag').attr('draggable', true).text(tagRender);
    $('#elementGeneration').append(newElementSpan, '\n');
    selectText(newElementSpanId);
    elementCreatedCounter++
  }
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

// ============= Presence of Multi-word Aliases Validation Code ============= \\
function checkSubmittedTextForMultiWords() {
  // First get all known aliases that are multiple words and put them into a single array we can work with
  let allMultiWordAliases = [];
  elementsObjectsArray.forEach(function(element) {
    for (let i = 0; i < element.aliases.length; i++){
      if (element.aliases[i].includes(' ')) {
        allMultiWordAliases.push(element.aliases[i]);
      }
    }
  });
  console.log(allMultiWordAliases);
  elementObjectIndex = undefined;
  // Now that we have the array, time to compare them with the submitted text
  allMultiWordAliases.forEach(function(alias){
    if (submittedChat.indexOf(alias) >= 0) {
      multiWord = alias;
      console.log("I found " + multiWord);
      elementsObjectsArray.forEach(function(element) {
        for (let i = 0; i < element.aliases.length; i++) {
          if (element.aliases[i].includes(multiWord)) {
            elementObjectIndex = element.position;
          }
        }
      });
    } else {
      if (elementObjectIndex === undefined) {
        elementObjectIndex = checkSubmittedTextForElement();
      }
    }
  });
  return elementObjectIndex;
}

// ============= Presence of HTML Element Validation Code ============= \\
function checkSubmittedTextForElement() {
  sentenceArray.forEach(function(word) {
    elementsObjectsArray.forEach(function(element) {
      let aliasesArray = element.aliases;
      aliasesArray.forEach(function(alias) {
        if (alias === word) {
          elementMatchCount++;
          elementObjectIndex = element.position;
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
      return 'More than one element match found';
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

// ============= Emailing Element Tree Function ============ \\

function sendEmail(){
  let service_id = 'yahoo';
  let template_id = 'template_ZHevUYdN';
  let emailBody = getElementTreeText();
  let email = $('#email').val();
  let emailSubject = $('#emailSubject').val();
  let template_params = {
    subject: emailSubject,
    name: 'Code-Dictator',
    reply_email: email,
    message: emailBody
  };
  let respond = emailjs.send(service_id,template_id,template_params);
  console.log(respond);
  console.log(template_params.subject);
  console.log(emailBody);
}

// ============= W3C Validator Code ============= \\
function codeValidator () {
  let data = getElementTreeText();
  let formData = new FormData();
  console.log(data);
  formData.append('out', 'json');
  formData.append('content', elementTreeData);

  let queryURL = 'https://validator.w3.org/nu/';

  // Performing our AJAX GET request
  $.ajax({
    url: queryURL,
    data: formData,
    dataType: 'json',
    type: "POST",
    processData: false,
    contentType: false,
    success: function (response) {
      console.log(response);
      if (response.messages.length > 0) {
        console.log('OH OH! Errors found!!!');
        $('#validationText').html('<p>I found some issues with your code :(</p>');
        for (let i = 0; i < response.messages.length; i++) {
          let errorList = $('#list');
          let errorListItem = $('<li>');
          let issueTypeSpan = $('<span>');
          let lineNumberSpan = $('<span>').css('font-weight', 'bold');
          let extractSpan = $('<span>').css('font-weight', 'bold');
          let extractSpanText = $('<span>');
          let subType = response.messages[i].subType; // these are for warnings
          let lineNumber = response.messages[i].lastLine; // line number issue is on
          let extract = response.messages[i].extract; // piece of code containing issue
          let type = response.messages[i].type; // these are for errors
          lineNumberSpan.text('Line: ');
          extractSpan.text('Code: ');
          extractSpanText.text(extract);
          issueTypeSpan.css({'font-weight': 'bold', 'padding': '5px', 'border-radius': '20px'});
          if (subType === 'warning') {
            issueTypeSpan.css('background-color', '#fecc7d').text(subType);
          }
          else if (type === 'error') {
            issueTypeSpan.css('background-color', '#FF908D').text(type);
          }
          errorListItem.text(response.messages[i].message)
            .prepend(issueTypeSpan)
            .append('<br>', lineNumberSpan, lineNumber, '<br>', extractSpan, extractSpanText);
          errorList.append(errorListItem, '<br>');
        }
      }
      else {
        console.log('No Errors Found');
        $('#validationText').text('No issues found, good job! :)');
      }
    },
    error: function () {
      console.warn(arguments);
    }
  });
}

// ============= END OF: W3C Validator Code ============= \\

function spellCheck () {
  let queryURL = "https://api.cognitive.microsoft.com/bing/v7.0/spellcheck?text=" + submittedChat;

  // Performing our AJAX GET request
  $.ajax({
    url: queryURL,
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": "c1e0f9b9a99347a6b0c83b5df9995731",
      "Accept": "application/json",
    },
  })
  // After the data comes back from the API ...
  .then(function (response) {
    console.log(response);
    // IF errors were found...
    if (response.flaggedTokens.length > 0) {
      // console.log('Before fixing mistakes (if any):', sentenceArray);
      for (let i = 0; i < response.flaggedTokens.length; i++) {
        sentenceArray[sentenceArray.indexOf(response.flaggedTokens[i].token)] = response.flaggedTokens[i].suggestions[0].suggestion;
      }
      // console.log('After fixing mistakes:', sentenceArray);
      let message = computerMessages.spellingCorrected + sentenceArray.join(' ') + '"';
      createChatLineItem('The Dictator', message);
      knownCommandsCheck();
      recognition = '';
    }
    else {
      console.log('Spelling validation passed!');
      knownCommandsCheck();
      recognition = '';
    }
  });
}