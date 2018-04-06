$(document).ready(function(){
  for (let i = 0; i < elementsObjectsArray.length; i++) {
    let elementName = elementsObjectsArray[i].name;
    let elementAlias = elementsObjectsArray[i].aliases;
    console.log(elementName);
    console.log(elementAlias);
    $("#tableBody").append("<tr><td>" + elementName + "</td><td>" + elementAlias.join(", ") + "</td></tr>");
  }
});