const commandsListing = [
  {
    summary: 'meaning of life',
    commandVariations: ['what is the meaning of life', 'tell me the meaning of life', 'i\'d like to know the meaning of life']
  }

];

function checkSanitizedSentenceAgainstKnownCommands(command) {
  let commandCount = 0;
  let summary = 0;
  commandsListing.forEach(function(commandItem) {
    let commandVariationsArray = commandItem.commandVariations;
    commandVariationsArray.forEach(function(variation) {
      if (variation === command) {
        if (commandCount === 0) {
          commandCount++;
          console.log('42');
          summary = commandItem.summary;
        }
      }
    });
  });
  return summary;
}