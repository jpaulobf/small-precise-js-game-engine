/*
	This algorith was created by 'Joao Paulo B. Faria' in Oct/2021.
	Use it at your will.
	Credits aren't necessary.
*/

//canvas & ctx	
var canvas				= null;
var ctx					= null;

//"game" logic
var posX				= 0;
var posY				= 0;
var X					= 20;
var Y					= 20;
var goRight				= false;
var goLeft				= false;
var goUp				= false;
var goDown				= false;

//engine control
var isEngineRunning		= true;
var TARGET_FRAMETIME	= (1000 / 61);	//additional frame, because of arithmetical imprecision
var accumulator			= 0;
var totalExecutionTime	= 0;
var timeReference		= 0;

//for FPS counter
var itToShowFPS			= false;
var timeArray			= new Array();
var timeArrayCounter	= 0;
var mod					= 20;
var index				= 0;

/*
	My role: Starts canvas parameters and game-loop
*/
var init = function() {

	//initialise the properties
	canvas = document.getElementById("c1");
	ctx = canvas.getContext("2d");

	//call the gameloop
	gameloop(window.performance.now());
}

/*
	My role: Execute the game-loop logic (update, draw, re-do)
*/
var gameloop = function(timeStamp) {

	var beforeUpdate       = 0;
	var afterUpdate        = 0;
	var afterDraw          = 0;
	var timeElapsed        = 0;
	var updateDiff         = 0;
	var beforeDraw         = 0;

	//verify if is "engine" running
	if (isEngineRunning) {

		//compute the time from previous iteration and the current
		timeElapsed = (timeStamp - timeReference);

		//save the difference in an accumulator to control the pacing
		accumulator += (timeElapsed);

		//reset total execution time                
		totalExecutionTime = 0;

		//if the accumulator surpass the desired FPS, allow new update
		if (accumulator >= TARGET_FRAMETIME) {

			//reset the accumulator
			accumulator = 0;

			//calc the update time
			beforeUpdate = window.performance.now();

			//store to FPS counter
			index = timeArrayCounter++%mod;
			timeArray[index] = beforeUpdate;

			//update the game (gathering input from user, and processing the necessary games updates)
			update(TARGET_FRAMETIME);

			//get the timestamp after the update
			afterUpdate = window.performance.now();
			updateDiff = afterUpdate - beforeUpdate;	
			
			//only draw if there is some (any) enough time
			if ((TARGET_FRAMETIME - updateDiff) > 0) {
				
				//draw
				draw(TARGET_FRAMETIME);
				
				//and than, store the time spent
				afterDraw = window.performance.now() - afterUpdate;
			}

			//sum the time to update + the time to draw
			totalExecutionTime = updateDiff + afterDraw;
		}
			
		/*  
			Explanation:
				if the total time to execute, consumes more miliseconds than the target-frame's amount, 
				is necessary to keep updating without render, to recover the pace.
		*/
		while (totalExecutionTime > TARGET_FRAMETIME) {
			console.log("lost render frame....");

			beforeUpdate = window.performance.now();
			update(TARGET_FRAMETIME);
			afterUpdate = window.performance.now();
			
			totalExecutionTime -= (afterUpdate - beforeUpdate);
		}

		//update the referencial time with the initial time
		timeReference = timeStamp;

		//setTimeout allow FPS > monitor vsync, but is less precise
		//setTimeout(gameloop, 0, window.performance.now()); 
		window.requestAnimationFrame(gameloop);

	}
}


/*
	WTFD: Update the game logic
*/
var update = function(frametime) {

	if (goRight) {
		posX += (posX < 600)?1:0;
	} else if (goLeft) {
		posX -= (posX > 0)?1:0;
	}

	if (goUp) {
		posY -= (posY > 0)?1:0;
	} else if (goDown) {
		posY += (posY < 400)?1:0;
	}

	if (itToShowFPS) {
		showFPS();
	}
}

/*
	My role: Render the game image
*/
var draw = function(frametime) {

	ctx.clearRect(0,0,600,400);
	ctx.fillRect(posX, posY, X, Y);

}

/*
	My role: process the "game" input
*/
var keyboardListener = function(e) {
	switch (e.keyCode) {
		case 32:
			jump();
			break;
		case 37:
			left();
			break;
		case 39:
			right();
			break;
		case 38:
			up();
			break;
		case 40:
			down();
			break;
	}
}

/*
	My role: some "game" logic
*/
var left = function() {
	 goRight = false;
	 goLeft = true;
}
var right = function() {
	goRight = true;
	goLeft = false;
}
var up = function() {
	goUp = true;
	goDown = false;
}
var down = function() {
	goUp = false;
	goDown = true;
}

/*
	My role: display/stop FPS counter show
*/
var toggleFPS = function() {
	if (itToShowFPS) {
		document.getElementById("fps").innerHTML = "";
	}
	itToShowFPS = !itToShowFPS;
}

/*
	My role: control the FPS counter 
*/
var showFPS = function() {
	var diff		= 0;
	var diffSum		= 0;

	if (index == mod - 1) {

		for (var i = timeArray.length; i > 1; i--) {
			diff = timeArray[i - 1] - timeArray[i - 2];
			diffSum += diff;
		}

		var fps = (1000 / (diffSum / (mod - 1))) + " fps";
		document.getElementById("fps").innerHTML = fps;
	}
}