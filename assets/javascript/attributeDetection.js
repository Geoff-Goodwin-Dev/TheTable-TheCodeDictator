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