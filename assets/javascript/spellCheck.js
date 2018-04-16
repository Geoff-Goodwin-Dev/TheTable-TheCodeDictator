/*=================================================================================================================
SPELL CHECK:
* The purpose of this function is to take in a raw string and run a spell-check on it via the Bing Spell-Check API

* Currently, this process is taking advantage of a static API key (future enhancements will seek to allow the user
  to populate and save their own spell-check API key)

* The logic in this function then calls a utility function from the globalAssets.js file to split the string along
  space characters to convert it to an array

* Once the phrase is sent on an AJAX call to Bing, the response will come back with a list of "flagged tokens" or
  perceived mis-spelled words

* If no flagged tokens are found, it proceeds down the line to call the knownCommandsCheck function

* Otherwise, the logic replaces any flagged tokens with their highest ranked replacement word and moves on to call
  the knownCommandsCheck function
__________________________________________________________________________________________________________________*/
const spellCheck = (rawChat) => {
  let chatArray = splitIntoArray(rawChat)
    , queryURL = 'https://api.cognitive.microsoft.com/bing/v7.0/spellcheck?text=' + rawChat;
  $.ajax({
    url: queryURL,
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": "c1e0f9b9a99347a6b0c83b5df9995731",
      "Accept": "application/json",
    }
  })
  .then((response) => {
    if (response.flaggedTokens.length > 0) {
      response.flaggedTokens.forEach((spelledIncorrectly) => {
        chatArray[chatArray.indexOf(spelledIncorrectly.token)] = spelledIncorrectly.suggestions[0].suggestion;
      });
      let spellingCorrected = chatArray.join(' ');
      createChatLineItem('The Dictator', (computerMessages.spellingCorrected + spellingCorrected + '"'));
    }
    sentenceArray = chatArray;
    knownCommandsCheck();
    recognition = '';
  });
};
/*================================================================================================================*/