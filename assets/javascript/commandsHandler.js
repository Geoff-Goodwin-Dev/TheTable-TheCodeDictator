// Checks submitted text against a list of known functional commands not specifically related to element creation
function knownCommandsCheck () {
  let submittedChatPostSpellCheck = sentenceArray.join(' ');
  console.log('sentence post spell check:', submittedChatPostSpellCheck);
  let sanitizedSentenceExtraSpacesRemoved = sanitizeSentence(submittedChatPostSpellCheck);
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

function checkSanitizedSentenceAgainstKnownCommands(command) {
  let commandCount = 0;
  let summary = 0;
  commandsListing.forEach(function(commandItem) {
    let commandVariationsArray = commandItem.commandVariations;
    commandVariationsArray.forEach(function(variation) {
      if (variation === command) {
        if (commandCount === 0) {
          commandCount++;
          summary = commandItem.summary;
        }
      }
    });
  });
  return summary;
}