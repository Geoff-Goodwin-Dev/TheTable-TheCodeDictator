/*=================================================================================================================
TOGGLE START STOP (OF SPEECH RECOGNITION):
* The purpose of the below function is toggle between speech recognition in progress and not in progress

* While in progress, the mic icon will be illuminated and the interim speech recognition results will display in
  the speech recognition interim results panel

* Upon completion or by manual triggering of the mic icon button, the mic will go dark and the text transcription
  will automatically pop into the chat window's text entry box
__________________________________________________________________________________________________________________*/
const toggleStartStop = () => {
  let chatTextArea = $('#chatTextArea')
    , micIcon = $('#microphoneIcon')
    , interimTextDisplay = $('#interimTextDisplay')
    , transcriptDisplay = $('#interimTextDisplayLabel');
  if (recognizing === true) {
    recognition.stop();
    micIcon.attr('src', 'assets/images/micOff.png');
    recognizing = false;
    recognition = '';
  }
  else {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.start();
    micIcon.attr('src', 'assets/images/micOn.png');
    recognizing = true;
    recognition.onend = () => {
      recognizing = false;
      micIcon.attr('src', 'assets/images/micOff.png');
    };
    recognition.onresult = (e) => {
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
};
/*================================================================================================================*/