$(document).ready(function(){
  onPageLoadInitialize();
  console.log('Initiated!');

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