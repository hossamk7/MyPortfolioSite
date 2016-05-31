(function(){
	
	var colours = newColours(6);
	var correctColour;
	var easyMode = false;
	var failMessage = ["Try Again!", "Oops, wrong!", "Nope...", "Not this time!", "Not that one!", "Oh no!"];
	
	var h1 = document.querySelector("h1");
	var squares = document.querySelectorAll(".square");
	var colourDisplay = document.getElementById("colourDisplay");
	var message = document.querySelector("#message");
	var resetButton = document.querySelector("#reset");
	var hardButton = document.querySelector("#hardButton");
	var easyButton = document.querySelector("#easyButton");
	
	//fill colours array with randomly generated rgb values
	function newColours(num){
		var colours = [];
		for(var i = 0; i < num; i++){
			var r = Math.floor(Math.random() * 256);
			var g = Math.floor(Math.random() * 256);
			var b = Math.floor(Math.random() * 256);
			colours[i] = "rgb(" + r + ", " + g + ", " + b + ")";
		}
		return colours;
	}
	
	//change colour of all squares
	function changeColourAll(squares, colour){
		for(var i = 0; i < squares.length; i++){
			squares[i].style.background = colour;
		}
	}
	
	//randomly pick the new colour to be guessed from the colours array
	function pickColour(){
		var random = Math.floor(Math.random() * colours.length); //randomly generate number bewteen 1 and the length of the colours array.
		return colours[random]; 
	}
	
	function resetAll(){
		easyMode ? colours = newColours(3) : colours = newColours(6);
		for(var i = 0; i < squares.length; i++){
			squares[i].style.background = colours[i]; //set all new colours on the screen
			if(colours[i]){ 						
				squares[i].style.display = "block";	//any more than 3 then show them
			}else{
				squares[i].style.display = "none";	//if easymode, hide the last 3 colours.
			}
		}
		correctColour = pickColour();
		colourDisplay.textContent = correctColour;
		message.textContent = "";
		resetButton.textContent = "New Colours";
		h1.style.background = "lime";
	}
	
	
	resetAll();
	
	//add click listeners to squares
	for(var i = 0; i < squares.length; i++){
		squares[i].addEventListener("click", function(){
			var clickedColour = this.style.background;
			
			if(clickedColour === correctColour){
				message.textContent = "Correct!";
				changeColourAll(squares, clickedColour);
				h1.style.background = clickedColour;
				resetButton.textContent = "Play Again?";
			}else{
				if(this.style.background !== "rgb(35, 35, 35)"){
					message.textContent = failMessage[Math.floor(Math.random() * failMessage.length)];
				}
				this.style.background = "#232323";
			}
		});
	}
	
	//event listeners for buttons
	resetButton.addEventListener("click", resetAll);
	
	easyButton.addEventListener("click", function(){
		easyButton.classList.add("selected");
		hardButton.classList.remove("selected");
		easyMode = true;
		resetAll();
	});
	
	hardButton.addEventListener("click", function(){
		hardButton.classList.add("selected");
		easyButton.classList.remove("selected");
		easyMode = false;
		resetAll();
	});

})();