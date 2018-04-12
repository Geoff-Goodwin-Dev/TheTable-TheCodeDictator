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
    // console.log(response);
    // IF errors were found...
    if (response.flaggedTokens.length > 0) {
      // console.log('Before fixing mistakes (if any):', sentenceArray);
      for (let i = 0; i < response.flaggedTokens.length; i++) {
        sentenceArray[sentenceArray.indexOf(response.flaggedTokens[i].token)] = response.flaggedTokens[i].suggestions[0].suggestion;
      }
      // console.log('After fixing mistakes:', sentenceArray);
      let message = computerMessages.spellingCorrected + sentenceArray.join(' ') + '"';
      createChatLineItem('The Dictator', message);
    }
    knownCommandsCheck();
    recognition = '';
  });
}