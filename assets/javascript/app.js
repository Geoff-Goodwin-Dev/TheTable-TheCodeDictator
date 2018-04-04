$(document).ready(function(){
  console.log('Initiated!');

  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
  var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

  let submitToChat = $('#submitToChat');
  let validateCode = $('#validateCode');
  let chatTextArea = $('#chatTextArea');
  let interimTextDisplay = $('#interimTextDisplay');
  let dictationButton = $('#dictationButton');
  let chatDisplay = $('#chatDisplay');
  let elementGeneration = $('#elementGeneration');
  let transcriptDisplay = $('#interimTextDisplayLabel');
  let emailSendButton = $('#emailSend');

  let sentenceArray = [];
  let ofEqualsArray = ['of', 'equals', 'is'];
  let versionsOfId = ['id', 'ID', 'Id', 'I.D.', 'i.d.', 'identifier'];
  let versionsOfClass =  ['class', 'Class'];
  let elementMatchCount = 0;
  let idText;
  let classText;
  let submittedChat;
  let elementObjectIndex;
  let elementTreeData;
  let final;
  let interim;
  let recognizing;

  const elementsObjectsArray = [
    {
      position: 0,
      name: 'div',
      openTag: '<div',
      closingTag: '</div>',
      aliases: ['division', 'divider', 'div']
    },
    {
      position: 1,
      name: 'p',
      openTag: '<p',
      closingTag: '</p>',
      aliases: ['paragraph', 'par', 'p']
    },
    {
      position: 2,
      name: 'h1',
      openTag: '<h1',
      closingTag: '</h1>',
      aliases: ['heading1', 'heading 1', 'headingone', 'heading one', 'h1', 'H1', 'header1', 'header 1', 'headerone', 'header one']
    },
    {
      position: 3,
      name: 'h2',
      openTag: '<h2',
      closingTag: '</h2>',
      aliases: ['heading12', 'heading 2', 'headingtwo', 'heading two', 'h2', 'H2', 'header2', 'header 2', 'headertwo', 'header two']
    },
    {
      position: 4,
      name: 'h3',
      openTag: '<h3',
      closingTag: '</h3>',
      aliases: ['heading3', 'heading 3', 'headingthree', 'heading three', 'h3', 'H3', 'header3', 'header 3', 'headerthree', 'header three']
    },
    {
      position: 5,
      name: 'h4',
      openTag: '<h4',
      closingTag: '</h4>',
      aliases: ['heading4', 'heading 4', 'headingfour', 'heading four', 'h4', 'H4', 'header4', 'header 4', 'headerfour', 'header four']
    },
    {
      position: 6,
      name: 'h5',
      openTag: '<h5',
      closingTag: '</h5>',
      aliases: ['heading5', 'heading 5', 'headingfive', 'heading five', 'h5', 'H5', 'header5', 'header 5', 'headerfive', 'header five']
    },
    {
      position: 7,
      name: 'h6',
      openTag: '<h6',
      closingTag: '</h6>',
      aliases: ['heading6', 'heading 6', 'headingsix', 'heading six', 'h6', 'H6', 'header6', 'header 6', 'headersix', 'header six']
    },
    {
      position: 8,
      name: 'a',
      openTag: '<a',
      closingTag: '</a>',
      aliases: ['anchor', 'link']
    },
    {
      position: 9,
      name: 'table',
      openTag: '<table',
      closingTag: '</table>',
      aliases: ['table']
    },
    {
      position: 10,
      name: 'tr',
      openTag: '<tr',
      closingTag: '</tr>',
      aliases: ['table row', 'tablerow']
    },
    {
      position: 11,
      name: 'th',
      openTag: '<th',
      closingTag: '</th>',
      aliases: ['table header', 'tableheader', 'table heading', 'tableheading']
    },
    {
      position: 12,
      name: 'td',
      openTag: '<td',
      closingTag: '</td>',
      aliases: ['table data', 'tabledata']
    },
    {
      position: 13,
      name: 'ul',
      openTag: '<ul',
      closingTag: '</ul>',
      aliases: ['unordered list', 'unorderedlist']
    },
    {
      position: 14,
      name: 'li',
      openTag: '<li',
      closingTag: '</li>',
      aliases: ['listitem', 'list item']
    },
    {
      position: 15,
      name: 'img',
      openTag: '<img',
      closingTag: '</img>',
      aliases: ['image', 'picture']
    }
  ];

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
    '</html>\n',
    mode:  'htmlmixed'
  });

  transcriptDisplay.toggle();

  function reset() {
    recognizing = false;
    $('#microphoneIcon').attr("src", "assets/images/micOff.png");
    // dictationButton.text('Click to Speak');
  }

  function toggleStartStop() {
    if (recognizing) {
      recognition.stop();
      recognizing = false;
    } else {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      reset();

      recognition.start();
      recognizing = true;
      recognition.onend = reset;

      recognition.onresult = function(e) {
        final = '';
        interim = '';
        for (let i = 0; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            final += e.results[i][0].transcript;
            console.log('final transcription:', e.results[i][0].transcript);
            chatTextArea.focus();
            toggleStartStop();
            transcriptDisplay.toggle();
          } else {
            interim += e.results[i][0].transcript;
          }
        }

        chatTextArea.text(final);
        interimTextDisplay.text(interim);
      };

      $('#microphoneIcon').attr("src", "assets/images/micOn.png");
      // dictationButton.text('Click to Stop');
      chatTextArea.text('');
      interimTextDisplay.text('');
    }
  }

  // takes an array and splits along space characters
  function splitIntoArray(string) {
    sentenceArray = string.split(' ');
    return sentenceArray;
  }

  // grabs current timestamp for use in the chat window display
  function getTimestamp() {
    return moment().format('hh:mm:ss a');
  }

  function createChatLineItem(who, what) {
    let itemWho = $('<span>');
    if (who === 'You') {
      itemWho.addClass('userChat');
    }
    else {
      itemWho.addClass('computerChat');
    }
    itemWho.text(who);
    let itemWhen = $('<span>');
    itemWhen.addClass('timestamp').text(' (' + getTimestamp() + '): ');
    chatDisplay.append(itemWho, itemWhen, what, '<br>')
      .animate({
      scrollTop: chatDisplay[0].scrollHeight - chatDisplay[0].clientHeight
    }, 300);
  }

  function chatSubmitHandler() {
    submittedChat = chatTextArea.text().trim();
    chatTextArea.empty();
    console.log(submittedChat);
    createChatLineItem('You', submittedChat);
    splitIntoArray(submittedChat);
    spellCheck();
    console.log(sentenceArray);
    recognition = '';
  }

  // ============= Utility Event Handlers ============= \\
  // click handler to start or stop voice-to-text dictation
  dictationButton.on('click', function(){
    transcriptDisplay.toggle();
    toggleStartStop();
  });

  // enter button handler when chat box is in focus
  chatTextArea.keypress(function(event) {
    if (event.which === 13) {
      document.execCommand('insertHTML', false, '<div></div>');
      chatSubmitHandler();
      return false;
    }
  });

  // submit button handler
  submitToChat.on('click', function() {
    event.preventDefault();
    chatSubmitHandler();
  });
  // ============= END OF: Utility Event Handlers ============= \\

  // ============= Spelling Validation Code ============= \\
  function spellCheck () {
    var queryURL = "https://api.cognitive.microsoft.com/bing/v7.0/spellcheck?text=" + submittedChat;

    // Performing our AJAX GET request
    $.ajax({
      url: queryURL,
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": "3606c69fe0fd4e23ad73b2955bf6fcf7",
        "Accept": "application/json",
      }
    })
    // After the data comes back from the API ...
    .then(function (response) {
      console.log(response);
      // IF errors were found...
      if (response.flaggedTokens.length > 0) {
        console.log('Before fixing mistakes (if any):', sentenceArray);
        for (let i = 0; i < response.flaggedTokens.length; i++) {
          sentenceArray[sentenceArray.indexOf(response.flaggedTokens[i].token)] = response.flaggedTokens[i].suggestions[0].suggestion;
        }
        console.log('After fixing mistakes:', sentenceArray);
        // console.log('I believe you meant... ', sentenceArray.join(' '));
        let message = 'I believe you meant... "' + sentenceArray.join(' ') + '"';
        createChatLineItem('Computer', message);
        recognition = '';
      } else {
        console.log('Spelling validation passed!');
        recognition = '';
      }

      // Checks to see if the spell-check corrected statement contains an HTML element
      let result = checkSubmittedTextForElement();
      elementMatchCount = 0; // resets element match count for future checks

      if (result === 'No matching elements found') {
        createChatLineItem('Computer', 'I could not find any matching elements in your statement');
      }
      else if (result === 'More than one element match found') {
        createChatLineItem('Computer', 'I can only create one element at a time.  Which element do you want to create first?');
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

        createChatLineItem('Computer', 'If I understand correctly, you are looking for an element tag creation.  Coming right up!');
        console.log(tagRender);
        let currentElements = elementGeneration.text();
        elementGeneration.text(currentElements + tagRender + '\n');
      }
    });
  }
  // ============= END OF: Spelling Validation Code ============= \\

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
  elementTreeData = $('.CodeMirror-code').text();
  let email = $('#email').val();
  let emailSubject = $('#emailSubject').val();
  let template_params = {
    subject: emailSubject,
    name: 'Code-Dictator',
    reply_email: email,
    message: elementTreeData
  };

  let respond = emailjs.send(service_id,template_id,template_params);
  console.log(respond);
  console.log(template_params.subject);
  console.log(elementTreeData);

}

emailSendButton.on('click', function(){
  sendEmail();
  $('#email').val('');
  $('#emailSubject').val('');

});

  // ============= W3C Validator Code ============= \\
  function codeValidator () {

    let formData = new FormData();
    elementTreeData = $('.CodeMirror-code').text();
    formData.append('out', 'json');
    formData.append('content', elementTreeData);

    var queryURL = 'https://validator.w3.org/nu/';

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
      },
      error: function () {
        console.warn(arguments);
      }
    });
  }

  // ============= END OF: W3C Validator Code ============= \\

  validateCode.on('click', function() {
    event.preventDefault();
    codeValidator();
  });




});