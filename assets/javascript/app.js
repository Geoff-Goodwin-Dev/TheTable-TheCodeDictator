$(document).ready(() => {
  createChatLineItem('The Dictator', computerMessages.welcomeMessage);
  $('#chatTextArea').focus();
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
  $('#dictationButton').on('click', () => {
    $('#interimTextDisplayLabel').toggle();
    toggleStartStop();
  });

  // enter button handler when chat box is in focus
  $('#chatTextArea').keypress((event) => {
    if (event.which === 13) {
      document.execCommand('insertHTML', false, '<div></div>');
      chatSubmitHandler();
      return false;
    }
  });

  // submit button handler
  $('#submitToChat').on('click', () => {
    event.preventDefault();
    chatSubmitHandler();
  });

  // click to select rendered tag from element generation window
  $('#elementGeneration').on('click','.renderedTag', (event) => {
    if (event.shiftKey) {
      let clickedElement = this.id;
      selectText(clickedElement);
    }
  });

  // FUNCTION FOR EXPANDING CODE-CHECK VALIDATION RESULTS BAR
  $('#validatorInstructions').click(() => {
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

  $('#validateCode').on('click', () => {
    event.preventDefault();
    $('#list').text("");
    codeValidator();
    if (validatorWindowExpanded === false) {
      $("#viewClose").text("close");
      $('.validationContent').slideToggle('400');
      validatorWindowExpanded = true;
    }
  });

  $('#emailSend').on('click', () => {
    if ($('#email').hasClass('validate valid')) {
      sendEmail();
      $('#email').val('');
      $('#emailSubject').val('');
    }
  });
});