var keyData = (function() {
	
	var alphabet = "a b c d e f g h i j k l m n o p q r s t u v w x y z";
	var alphabetArray = alphabet.split(" ");
	
	function generateColour(){
		var r = Math.floor(Math.random() * 256);
		var g = Math.floor(Math.random() * 256);
		var b = Math.floor(Math.random() * 256);
		return "rgb(" + r + ", " + g + ", " + b + ")";
	}
	
	var keyData = {};
	for(var i = 0; i<alphabetArray.length; i++){
		keyData[alphabetArray[i]] = {
			sound: new Howl({
	  		urls: [ 'sounds/' + alphabetArray[i] + '.mp3']
			}),
			circleColour: generateColour(),
			squareColour: generateColour(),
			position: undefined //postion set as a random point upon the first keypress of a particular key
		}
	}

	return keyData;
})();

//creates an object containing the colour values as rgb and the sound files loaded with each letter of the alphabet as the key.
//colours are randomly generated.
//returns the letter as the key and the value as the howl object