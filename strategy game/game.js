
/*
	Written By: Victor Vahram Shahbazian
	Idea: Create a stategy turn based multiplayer game
	Steps: Make this game cross platform and use apache cordova with visual studio

	Notes:
	-make it difficult to copy webcode
*/
//////////////////////////////// DEBUG VARIABLES //////////////////////////////
var debug = false;
///////////////////////////////// GUI VARIABLES////////////////////////////////
var statsPanel;

////////////////////////////// GRAPHICS VARIABLES /////////////////////////////
//Scene and State control variables
var GAMESCENE = {INTRO:0, START: 1, MAIN: 2, EXIT: 3};
var GAMESTATE = {PLAY: 0, PAUSE:1};
var pause = false;
var introScene, startScene, exitScene;

//Graphics variables
var scene, camera, renderer, stats, light,
		ambiLight, camControls, skysphere, floor, line,
		raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();

//User interaction variables
var gameObjects = [], menuObjects = [];
var leftClick = false;
var rightClick = false;
var lastClickedObject;
var cardSelected = false;

var cardTest;
var cardNames = ["falko","reaper","jonus","juave"];
var GameBoard = {
	size: 16,
	boxes: [],
	init: function(){
		for(var i = 0; i<this.size; i++){
			this.boxes[i] = [];
			for(var j = 0; j<this.size; j++){
				this.boxes[i][j] = {
					highlight: {
						selected: false,
						graphic: null
					},
					terrain: {
						type: "grass",
						graphic: null
					},
					card: {
						values: {name: "blank", hp: 0, mp: 0, ap: 0, m: 0},
						graphic: null
					}
				};
			}
		}
	}
};

////////////////////////////////// DEBUG //////////////////////////////////////////

if(debug){
	debugaxis(100);
}

/////////////////////////////// Function Init /////////////////////////////////
function init(){
	//Init main scene
	//stats
	stats = new Stats();
	stats.showPanel(1);
	document.body.appendChild(stats.dom);

	//core scenes
	scene = new THREE.Scene();
	//renderer
	renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setClearColor(0xFFFFFF, 1);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	//camera
	camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 1000);
	camera.position.y = 14;
	camera.position.z = 14;
	camera.lookAt(new THREE.Vector3(0,0,0));

	//orbit controls
	camControls = new THREE.OrbitControls(camera, renderer.domElement);
	camControls.enableZoom = true;
	camControls.enabled = true;
	camControls.minDistance = 10;
	camControls.maxDistance = 20;
	camControls.target = new THREE.Vector3(0,0,0);
	scene.add(camControls.object);

	//Init Raycaster settings
	raycaster.near = 0.1;
	raycaster.far = 1000;

	//lights
	//Direct
	light = new THREE.DirectionalLight(0xFFFFFF);
	light.position.set(1,1,1).normalize();
	scene.add(light);
	//Ambient
	ambiLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
	scene.add(ambiLight);

	//Skybox
	skysphere = new THREE.Mesh(new THREE.SphereGeometry(50, 100, 100), new THREE.MeshBasicMaterial({color: "#99FFFF"}));
	skysphere.material.side = THREE.BackSide;
	skysphere.rotateX(Math.PI/2);
	skysphere.rotateY(Math.PI/2);
	scene.add(skysphere);

	//Game floor
	floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshPhongMaterial({color: "#440000"}));
	floor.rotateX(Math.PI/2);
	floor.material.side = THREE.DoubleSide;
	scene.add(floor);

	//Init board
	GameBoard.init();
	for(var i = 0; i<GameBoard.size; i++){
		for(var j = 0; j<GameBoard.size; j++){
			GameBoard.boxes[i][j].terrain.graphic = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhongMaterial({color: 0x117733, wireframe: debug}));
			GameBoard.boxes[i][j].terrain.graphic.position.set(i-(GameBoard.size/2-0.5), 0, j-(GameBoard.size/2-0.5));
			GameBoard.boxes[i][j].terrain.graphic.name = "floor_tile["+i+"]["+j+"]";
			gameObjects.push(GameBoard.boxes[i][j].terrain.graphic);
			scene.add(GameBoard.boxes[i][j].terrain.graphic);

			GameBoard.boxes[i][j].highlight.graphic = new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.7), new THREE.MeshPhongMaterial({color: "#FFFFFF", transparent: true}));
			GameBoard.boxes[i][j].highlight.graphic.rotateX(Math.PI/2);
			GameBoard.boxes[i][j].highlight.graphic.material.side = THREE.DoubleSide;
			GameBoard.boxes[i][j].highlight.graphic.material.opacity = 0.5;
			GameBoard.boxes[i][j].highlight.graphic.position.set(i-(GameBoard.size/2-0.5), 0.51, j-(GameBoard.size/2-0.5));
		}
	}

	//Card on Board
	for(var i = 0; i<4; i++){
		cardTest = {
			graphic: new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5), new THREE.MeshPhongMaterial({color: "#"+i+"7"+i+"7"+i+"7", transparent: true})),
			values: {name: cardNames[i], hp: 10, mp: 20, ap: 5, m: 3}
		};

		cardTest.graphic.position.set(
			GameBoard.boxes[i][0].terrain.graphic.position.x,
			GameBoard.boxes[i][0].terrain.graphic.position.y + 0.76,
			GameBoard.boxes[i][0].terrain.graphic.position.z
		);

		GameBoard.boxes[i][0].card = cardTest;
		scene.add(GameBoard.boxes[i][0].card.graphic);
	}

	//Turn on grid
	//-x to x
	for(var i = 0; i<GameBoard.size + 1; i++){
		var lGeom = new THREE.Geometry();
		lGeom.vertices.push(new THREE.Vector3(-GameBoard.size/2, 0.51, GameBoard.size/2-i), new THREE.Vector3(GameBoard.size/2, 0.5, GameBoard.size/2-i));
		var line = new THREE.Line(lGeom, new THREE.LineBasicMaterial({color: 0xAAAAAA}));
		scene.add(line);
	}

	//-z to z
	for(var i = 0; i<GameBoard.size + 1; i++){
		var lGeom = new THREE.Geometry();
		lGeom.vertices.push(new THREE.Vector3(GameBoard.size/2 - i, 0.51, -GameBoard.size/2), new THREE.Vector3(GameBoard.size/2 - i, 0.5, GameBoard.size/2));
		var line = new THREE.Line(lGeom, new THREE.LineBasicMaterial({color: 0xAAAAAA}));
		scene.add(line);
	}

	resizeGame();
}//End of Init

/////////////////////////////// Text to Sprite ////////////////////////////////
function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};

	var fontface = parameters.hasOwnProperty("fontface") ?
		parameters["fontface"] : "Arial";

	var fontsize = parameters.hasOwnProperty("fontsize") ?
		parameters["fontsize"] : 18;

	var borderThickness = parameters.hasOwnProperty("borderThickness") ?
		parameters["borderThickness"] : 4;

	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

	var spriteAlignment = THREE.SpriteAlignment.topLeft;

	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;

	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;

	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

	context.lineWidth = borderThickness;
	roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
	// 1.4 is extra height factor for text below baseline: g,j,p,q.

	// text color
	context.fillStyle = "rgba(0, 0, 0, 1.0)";

	context.fillText( message, borderThickness, fontsize + borderThickness);

	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas)
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial(
		{ map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(100,50,1.0);
	return sprite;
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r)
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();
}

/////////////////////////////Update Function///////////////////////////////////
var update = function(){
	if(debug){console.log(camControls.getPos());}
};

/////////////////////////////Render Function///////////////////////////////////
var render = function(){
	stats.begin();

	//This pause stops the game loop and is only for testing
	//A true pause would not stop the game loop but switch the state
	//	of the game to something else like a menu overlay

	if(!pause){
		update();
		camControls.noRotate = false;
		camControls.noPan = false;
		camControls.noZoom = false;
	}else{
		camControls.noRotate = true;
		camControls.noPan = true;
		camControls.noZoom = true;
	}

	requestAnimationFrame(render);
	renderer.render(scene, camera);
	stats.end();
};

//////////////////Main functions are run here//////////////////////////////////
init();
render();

//////////////////////////////// RESIZE ///////////////////////////////////////

var targetAspectRatio = 16/9;
function aspectSize(availableWidth, availableHeight) {
  var currentRatio = availableWidth / availableHeight;
  if (currentRatio > targetAspectRatio) {
    //then the height is the limiting factor
    return {
      width: availableHeight * targetAspectRatio,
      height: availableHeight
    };
  } else {
    // the width is the limiting factor
    return {
      width: availableWidth,
      height: availableWidth / targetAspectRatio
    };
  }
}

window.addEventListener('resize', function(){
	var newDimensions = aspectSize(window.innerWidth, window.innerHeight);
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = targetAspectRatio;
	camera.updateProjectionMatrix();
}, false);

window.addEventListener('resize', resizeGame(), false);

function resizeGame(){
	var newDimensions = aspectSize(window.innerWidth, window.innerHeight);
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = targetAspectRatio;
	camera.updateProjectionMatrix();
}
///////////////////////// MOUSE ///////////////////////////////////////////////

window.addEventListener( 'mousedown', function(evt){
	mouse.x = (evt.clientX/window.innerWidth)*2 - 1;
	mouse.y = -(evt.clientY/window.innerHeight)*2 + 1;

	if(evt.buttons === 1){
		leftClick = true;

		//setup 3js raycaster and list of objects clicked
		raycaster.setFromCamera(mouse, camControls.object);
		var intersects;

		//Switch controls based on gameState
		if(!pause){
			intersects = null;
			intersects = raycaster.intersectObjects(gameObjects);
			if(intersects.length > 0){
				gameBoardInteraction(intersects);
			}
		}else{
			intersects = null;
			intersects = raycaster.intersectObjects(menuObjects);
			if(intersects.length > 0){
				menuInteraction(intersects);
			}
		}
	}
	if(evt.buttons === 2){
		rightClick = true;
	}
});

window.addEventListener('mousemove', function(evt){
	var currentMouse = new THREE.Vector2(evt.clientX, evt.clientY);
	if(leftClick){

	}
	if(rightClick){

	}
});

window.addEventListener('mouseup', function(){
	//camControls.noRotate = false;
	leftClick = false;
	rightClick = false;
});

/////////////////////////////////// KEYBOARD //////////////////////////////////
window.addEventListener('keydown', function(evt){
	console.log(evt);
	if(evt.keyCode == 27){
		if(pause){
			pause = false;
		}else{
			pause = true;
		}
	}
});

function menuInteraction(intersects){
	console.log('click from menu');
	console.log(intersects[0].object);
}

//User interactions to gameboard
function gameBoardInteraction(intersects){
	console.log('click from gameboard');
	//get id of currently selected tile
	var currentClickedObject = parse2DCoord(intersects[0].object.name);

	//Logic for knowing that a new tile has been selected
	//Move highlight to new tile
	if(lastClickedObject != null){
		if(currentClickedObject.x != lastClickedObject.x || currentClickedObject.y != lastClickedObject.y){
			//Highlight new box
			GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].highlight.selected = true;
			scene.add(GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].highlight.graphic);
			//unHighlight last box
			GameBoard.boxes[lastClickedObject.x][lastClickedObject.y].highlight.selected = false;
			scene.remove(GameBoard.boxes[lastClickedObject.x][lastClickedObject.y].highlight.graphic);
		}else{
			console.log("The same object has been clicked");
		}
	}else{
		//There is no lastSelectedObject, so Highlight new box
		GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].highlight.selected = true;
		scene.add(GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].highlight.graphic);
	}

	//Check if a card was previously selected and if the tile to move the card to is empty.
	//**There will be more conditions to determine whether a card can move to a tile.
	if(GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].card.values.name == "blank" && cardSelected === true){
		//Remove tile graphic of last location
		scene.remove(GameBoard.boxes[lastClickedObject.x][lastClickedObject.y].card.graphic);

		//Switch card data from previous tile to new tile
		var holdcard = GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].card;
		GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].card = GameBoard.boxes[lastClickedObject.x][lastClickedObject.y].card;
		GameBoard.boxes[lastClickedObject.x][lastClickedObject.y].card = holdcard;

		//Set new tile graphic position
		GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].card.graphic.position.set(
			GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].terrain.graphic.position.x,
			GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].terrain.graphic.position.y + 0.76,
			GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].terrain.graphic.position.z
		);

		//Add new tile card graphic
		scene.add(GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].card.graphic);
	}

	//Check if a card has been selected or a blank tile has been selected
	if(GameBoard.boxes[currentClickedObject.x][currentClickedObject.y].card.values.name != "blank"){
		console.log('card!');
		cardSelected = true;
	}else{
		console.log('blank tile');
		cardSelected = false;
	}

	//remember the last clicked object
	lastClickedObject = currentClickedObject;
}
