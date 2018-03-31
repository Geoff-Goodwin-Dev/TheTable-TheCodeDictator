$(document).ready(function() {

	var splitUpText = [];

	// Event listener for all button elements
	$("#submitToChat").on("click", function (event) {
		// In this case, the "this" keyword refers to the button that was clicked
// These code snippets use an open-source library. http://unirest.io/nodejs
		event.preventDefault(event);
		// Constructing a URL to search Giphy for the name of the person who said the quote

		var text = $('#textarea1').val();
		var splitUpText = splitIntoArray(text);

		var queryURL = "https://api.cognitive.microsoft.com/bing/v7.0/spellcheck?text=" + text;
		// Performing our AJAX GET request
		$.ajax({
			url: queryURL,
			method: "GET",
			headers: {
				"Ocp-Apim-Subscription-Key": "3606c69fe0fd4e23ad73b2955bf6fcf7",
				"Accept": "application/json",
			}
		})
		// After the data comes back from the API
				.then(function (response) {
					// Storing an array of results in the results variable
					console.log(response);

					if (response.flaggedTokens.length > 0) {
						// console.log("Did you mean: " + response.flaggedTokens[0].suggestions[0].suggestion);
						console.log("Before fixing mistakes: " + splitUpText);
						for (var i = 0; i < response.flaggedTokens.length; i++) {

							splitUpText[splitUpText.indexOf(response.flaggedTokens[i].token)] = response.flaggedTokens[i].suggestions[0].suggestion;
						}
						console.log("After fixing mistakes: " + splitUpText);
						console.log("Did you mean: " + splitUpText.join(" "));
					}
					else {
						console.log("Spelling looks good to me");
					}


				});
	});

	function splitIntoArray(string) {
		sentenceArray = string.split(" ");
		return sentenceArray;
	}
});