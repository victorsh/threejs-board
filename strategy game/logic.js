////////////////////////////////// MAIN LOGIC /////////////////////////////////////////////////
var board = [];

for(var i = 0; i<8; i++){
	board[i] = [];
}

/*
class resist
-type resisting ex)fire,water,ice,rock...
-amount of resistance
function resist(resAmtArray[]){

}
*/

function card(health, mana, attack, resist, movement, loyalty){
	if(health != null){this.health = health;}else{this.health = 10;}
	if(mana != null){this.mana = mana;}else{this.mana = 0;}
	if(attack != null){this.attack = attack}else{attack = 1;}
	if(loyalty != null){this.defense = defense}else{loyalty = 0;}
	if(resist != null){this.resist = resist}else{resist = [0,0,0,0]}
	if(movement != null){this.movement = movement}else{movement = 2}
}

/*
Terrain is an array of cards.
type of terrain card
-rock
-grass
-lava
-lava rock
-shallow water
-deep water
-ice
-snow
-sand
-tile
-road
*/
function terrain(type, level){
	if(type != null){this.type = type}else{this.type = 'grass'}
	if(type != null){this.level = level}else{this.level = 1}
}

function printBoard(){
	for(var i = 0; i<board.length; i++){
		console.log(board[i]);
	}
}

function blankBoard(){
	for(var i = 0; i<8; i++){
		for(var j = 0; j<8; j++){
			board[i][j] = new terrain();
		}
	}
}

blankBoard();

board[0][0] = new card(10,10);
board[0][1] = new terrain('desert', 2);
