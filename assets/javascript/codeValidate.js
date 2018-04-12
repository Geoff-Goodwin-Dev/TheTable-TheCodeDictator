// ============= W3C Validator Code ============= \\
function codeValidator () {
  let data = getElementTreeText();
  let formData = new FormData();
  console.log(data);
  formData.append('out', 'json');
  formData.append('content', elementTreeData);

  let queryURL = 'https://validator.w3.org/nu/';

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
      if (response.messages.length > 0) {
        console.log('OH OH! Errors found!!!');
        $('#validationText').html('<p>I found some issues with your code :(</p>');
        for (let i = 0; i < response.messages.length; i++) {
          let errorList = $('#list');
          let errorListItem = $('<li>');
          let issueTypeSpan = $('<span>');
          let lineNumberSpan = $('<span>').css('font-weight', 'bold');
          let extractSpan = $('<span>').css('font-weight', 'bold');
          let extractSpanText = $('<span>');
          let subType = response.messages[i].subType; // these are for warnings
          let lineNumber = response.messages[i].lastLine; // line number issue is on
          let extract = response.messages[i].extract; // piece of code containing issue
          let type = response.messages[i].type; // these are for errors
          lineNumberSpan.text('Line: ');
          extractSpan.text('Code: ');
          extractSpanText.text(extract);
          issueTypeSpan.css({'font-weight': 'bold', 'padding': '5px', 'border-radius': '20px'});
          if (subType === 'warning') {
            issueTypeSpan.css('background-color', '#fecc7d').text(subType);
          }
          else if (type === 'error') {
            issueTypeSpan.css('background-color', '#FF908D').text(type);
          }
          errorListItem.text(response.messages[i].message)
            .prepend(issueTypeSpan)
            .append('<br>', lineNumberSpan, lineNumber, '<br>', extractSpan, extractSpanText);
          errorList.append(errorListItem, '<br>');
        }
      }
      else {
        console.log('No Errors Found');
        $('#validationText').text('No issues found, good job! :)');
      }
    },
    error: function () {
      console.warn(arguments);
    }
  });
}

// ============= END OF: W3C Validator Code ============= \\