var pos = {};
var players={};
window.onload=function(){
	
}
function createPlayers(){
	var Pl=document.getElementById('empty');
	var input=parseFloat(document.getElementById('num').value);
	var filed=document.getElementsByClassName('main')[0];
	var _height = parseFloat($('#1').css("height"));
	var _width = parseFloat($('#1').css('width'));
	var a=$("#1").position();
	for(var i=0;i<input;i++){
		players[i] = document.createElement('div');
		players[i].setAttribute('class','empty');
		players[i].setAttribute('id', 'pl'+(i+1));
		filed.appendChild(players[i]);
		console.log(i%2==0?2:3);
		$("#pl"+(i+1)).css({left: a.left+(_width/(input+1))*(i+1), top: a.top+_height/(i%2==0?1.5:3)});
		pos["pl"+(i+1)] = 1;
	}
}

function move(arrow,target,duration=1){
	var newSteps = 1;
	console.log(pos.pl1);
	newSteps = rand(1,6)+rand(1,6);
	console.log(newSteps);
	if (pos.pl1 + newSteps > 40) {
		newSteps-=40-pos.pl1;
		pos.pl1 = newSteps;
	} else {
		pos.pl1 += newSteps;
	}	
	var a=$("#"+pos.pl1.toString()).position();
	$(arrow).animate({left: a.left, top: a.top},duration*1000);
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