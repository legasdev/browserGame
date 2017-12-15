var pos = {};
var players={};
var avatars={};
var iter=0;
window.onload=function(){
	
}
function getCoords(elem){
	var el=elem.getBoundingClientRect();
	return {
		top:el.top + pageYOffset,
		left:el.left+pageXOffset
	};
}
function createPlayers(){

	var Pl=document.getElementById('empty');
	var input=parseFloat(document.getElementById('num').value);
	var filed=document.getElementsByClassName('filed-game')[0];
	var _height = parseFloat($('#1').css("height"));
	var _width = parseFloat($('#1').css('width'));
	var avatar=document.getElementsByClassName('avatar');
	var a=$("#1").position();
	//Создаём фишки
	for(var i=0;i<input;i++){
		players[i] = document.createElement('div');
		players[i].setAttribute('class','empty');
		players[i].setAttribute('id', 'pl'+(i+1));
		filed.appendChild(players[i]);
		pos["pl"+(i+1)] = 1;
	}
	//Создаём аватарки
	var startPosition=document.getElementById('1');
	for(var i=0;i<input;i++){
		avatars[i] = document.createElement('div');
		avatars[i].setAttribute('class','avatar');
		avatars[i].setAttribute('id', 'avatar'+(i+1));
		startPosition.appendChild(avatars[i]);
	}	
	//Двигаем фишки на стартовые координаты аватарок
		for(var i=0;i<input;i++){
			$("#pl"+(i+1)).animate({left:getCoords(avatars[i]).left-players[i].getBoundingClientRect().width/2,
									top: getCoords(avatars[i]).top-players[i].getBoundingClientRect().height/2},1000);
		}
}

function move(elem=avatars[iter]){
	var av=document.getElementsByClassName('avatar');
	var pls=document.getElementsByClassName('empty');
	console.log(elem);
	
	var Cube = 1;
	var idAvatar=parseInt(elem.id.replace(/\D+/g," "));
	//Текущая позиция аватарки
	var avatarPos=parseInt(elem.parentNode.id);
	Cube = rand(1,6)+rand(1,6);
	//Считаем новую позицию (ID позиции) аватарки
	var newIdElem=avatarPos +Cube;
	//Удаляем аватарку из староко элемента и добавляем в новый
	if (newIdElem > 40) {
		newIdElem=Cube-(40-avatarPos);
		document.getElementById(avatarPos).removeChild(elem);
		document.getElementById(newIdElem).appendChild(elem);
	} 
	else {	
		document.getElementById(avatarPos).removeChild(elem);
		document.getElementById(newIdElem).appendChild(elem);
	}
	//Берем координаты всех аватаров и присваиваем их к фишкам
	for(var i=0;i<av.length;i++){
		$("#pl"+(i+1)).animate({left:getCoords(avatars[i]).left-players[i].getBoundingClientRect().width/2,
								top: getCoords(avatars[i]).top-players[i].getBoundingClientRect().height/2},1000);
	}
	console.log(av.length+" : "+iter);
	if(iter==av.length-1){
		iter=0;
	}
	iter++;
}

// использование Math.round() даст неравномерное распределение!
function rand(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var s = 1;
var check = true;
//размещаем по центру
function toCenter() {
	var heightWindow = window.innerHeight;
	var heightField = parseFloat($("#full").css('height'));
	$("#full").css('top', (heightWindow-heightField)/2);
	//если поле шире, чем размер экрана по вертикали
	if (heightField>heightWindow) {
		s = heightWindow*s/heightField;
		$("#full").css('transform', 'scale('+s+')');
	} else {
		$("#full").css('transform', 'scale(1)');
	}
}

//когда загрузилось
$(document).ready(function() {
	toCenter();
});

//меняем окно
window.onresize = function() {
	toCenter();
};