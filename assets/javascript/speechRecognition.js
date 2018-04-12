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