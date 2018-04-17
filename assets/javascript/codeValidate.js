/*=================================================================================================================
CODE VALIDATOR:
* The purpose of the below function is to select the code contents within the Code Mirror IDE and send an AJAX call
  using the W3C Code Validator API to check the entered text

* When the response is received back, it will then update the display of the issues to either reflect that no
  issues were found or display the details of the issues that were found
__________________________________________________________________________________________________________________*/
const codeValidator = () => {
  let data = getElementTreeText() //it may look like this variable is not being used, but it is.  Please Don't take it out :)
    , queryURL = 'https://validator.w3.org/nu/'
    , formData = new FormData();
  formData.append('out', 'json');
  formData.append('content', elementTreeData);
  // Performing our AJAX GET request
  $.ajax({
    url: queryURL,
    data: formData,
    dataType: 'json',
    type: "POST",
    processData: false,
    contentType: false,
    success: (response) => {
      // console.log(response); //left in for debugging
      let issues = response.messages;
      $('#codeValidationsList').empty();
      if (issues.length > 0) {
        // console.log('OH OH! Errors found!!!'); //left in for debugging
        $('#validationText').html('<p>I found some issues with your code :(</p>');
        issues.forEach((issue) => {
          let issueText = $('<span class="normal">').text('  ' + issue.message)
            , issueTypeSpan = $('<span class="bold codeValidateItem">')
            , lineNumberText = $('<span class="normal">').text(issue.lastLine)
            , lineNumberSpan = $('<span class="bold">').text('Line: ')
            , extractText = $('<span class="normal">').text('"...' + issue.extract + '..."')
            , extractSpan = $('<span class="bold">').text('Code: ');
          if (issue.subType === 'warning') {
            issueTypeSpan.addClass('codeValidateWarn').text('Warning');
          }
          else if (issue.type === 'error') {
            issueTypeSpan.addClass('codeValidateError').text('Error');
          }
          let errorListItem = $('<li>').append(issueTypeSpan, issueText, '<br>', lineNumberSpan, lineNumberText, '<br>', extractSpan, extractText);
          $('#codeValidationsList').append(errorListItem, '<br>');
        });
      }
      else {
        // console.log('No Errors Found'); //left in for debugging
        $('#validationText').text('No issues found, good job! :)');
      }
    },
    error: () => {
      console.warn(arguments);
    }
  });
};
/*================================================================================================================*/