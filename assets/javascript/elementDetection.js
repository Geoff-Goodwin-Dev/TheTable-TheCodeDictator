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