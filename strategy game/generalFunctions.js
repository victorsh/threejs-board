//parse the cube
function parse2DCoord(name){
	if(name == null){return;}
	var i = 0;
	var hold = 0;
	var n1, n2;
	while(isNaN(name[i])){
		i++;
	}
	while(!isNaN(name[i])){
		hold += name[i];
		i++;
	}
	n1 = Number(hold);
	hold = 0;
	while(isNaN(name[i])){
		i++;
	}
	while(!isNaN(name[i])){
		hold += name[i];
		i++;
	}
	n2 = Number(hold);
	return new THREE.Vector2(n1, n2);
}

/* ascii a-z = 97-122 */
function nameGenerator(){
	var name = '';

	var vowel = false;
	for(var i = 0; i < (Math.floor(Math.random()*10) + 3); i++){
		var character = String.fromCharCode(Math.floor(Math.random()*26) + 97);
		if(character != 'x' && character != 'y' && character != 'z'){
			if((character == 'a' || character == 'e' || character == 'i' || character == 'o' || character == 'u') && vowel == true){
				vowel = false;
				name += character;
			}else{
				vowel = true;
				name += character;
			}
		}
	}//97 101 105 111 117
	//console.log(name);
	return name;
}

//create random color generator
function randomHexColor(){
	var color = "#";
	for(var i = 0; i<6; i++){
		var r = Math.floor(Math.random()*15);
		if(r>9){
			r = r+87;
			color += String.fromCharCode(r);
		}else{
			color += r.toString();
		}
	}
	//console.log(color);
	return color;
}
