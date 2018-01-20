var pos = {};
var players={};
var avatars={};
var iter=0;

function getCoords(elem){
	var el=elem.getBoundingClientRect();
	return {
		top:el.top + pageYOffset,
		left:el.left + pageXOffset
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
var maxPlayers;
var players = [];

//все функции как глобальные переменные
var move, updatePlayers, getIdr, showMoveBtn, hideMoveBtn;
/*		
	ЗАПУСК СЕРВЕРА НА КЛИЕНТЕ
*/
window.onload = function() {
	var ws;
	//соединяем
	function connect() {
		ws = new WebSocket('ws://127.0.0.1:443');
		ws.onopen = onopen;
		ws.onmessage = onmessage;
		ws.onerror = onerror;
		ws.onclose = onclose;
	}
				
	//при открытии соединения
	function onopen() {
		console.log(getIdr());//ws.send(JSON.stringify({'type':'getRooms', 'data':idr}));
		//отсылаем запрос о комнатах
		ws.send(JSON.stringify({'type':'connectToGame', 'data': {
			sh: sessionStorage.getItem('sh'), idr: getIdr()
			}
		}));
	}
				
	//при получении данных с сервера
	function onmessage(evt) {
		try {
			var m = JSON.parse(evt.data);
		} catch(e) {
			return;
		}
				
		//сортируем полученные данные с сервера
		switch (m['type']) {
			//обновление данных в комнате
			case 'updateGameRoom':
				console.log(m['data']);
				//создаем игроков
				updatePlayers(m['data'].maxPlayers, m['data'].players);
				maxPlayers = m['data'].maxPlayers;
				players = m['data'].players;
				break;
			//показываем возможность ходить
			case 'showMoveBtn':
				showMoveBtn();
				break;
			//скрытые кнопки хода
			case 'hideMoveBtn':
				hideMoveBtn();
				break;
			default:
				//если непонятная команда
				console.log("Ошибка запроса [Непонятный запрос].");
				break;
		}
	}
				
	//при ошибке
	function onerror(e) {
		if (e) {
			console.log(e);
		}
		connect();
	}
			
	//при закрытии соединения
	function onclose() {
		
	}
				
	connect();
			
	//получаем комнату
	/*$.ajax({
		url: "api/users", //к юзерам
		contentType: "application/json",
		method: "POST",
		data: JSON.stringify({
			type: 6,
			sh: sessionStorage.getItem('sh')
		}),
		success: function (answer) {
			if (answer != false) {
				for (var i=0; i<answer.length; i++) {
				}
			}
		}
	});*/

	/* 
		Второстепенные функции
	*/

	//получить IDR комнаты
	getIdr = function() {
		var location = document.location.href;
		return location.slice(location.lastIndexOf("=")+1);
	}

	//обновляет или создате фишки игроков
	updatePlayers = function(numPlayers, _players){
		//numPlayers сколько фишек создавать
		//ищем общий блок, куда добавлять
		var filed=document.getElementsByClassName('main')[0];
		//циклом создаем
		for(var i=0; i<numPlayers; i++) {
			//узнаем размеры клетки, где расположен игрок
			var _height = parseFloat($('#'+_players[i].pos).css("height"));
			var _width = parseFloat($('#'+_players[i].pos).css('width'));
			var a = $('#'+_players[i].pos).position();
			//создаем новый блок, если его еще нет
			if ($('#pl'+(i+1)).attr('class') == undefined) {
				players[i] = document.createElement('div');
				//добавляем ему новые аттрибуты
				players[i].setAttribute('class','empty');
				players[i].setAttribute('id', 'pl'+(i+1));
				//раскрашиваем фишку в цвет
				//добавляем на поле
				filed.appendChild(players[i]);
			}
			//выставляем в позицию
			$("#pl"+(i+1)).css({
				left: a.left+(_width/(numPlayers+1))*(i+1), 
				top: a.top+_height/(i%2==0?1.5:3), 
				background: _players[i].color
			});
		}
	}

	//показываем табличку с кнопокой хода
	showMoveBtn = function() {
		$('#makeMove').css('display', 'block');
	}

	//скрываем табличку с кнопокой хода
	hideMoveBtn = function() {
		$('#makeMove').css('display', 'none');
	}

	//функция хода
	move = function() {
		//отправляем на сервер инфу
		ws.send(JSON.stringify({
			'type': 'moveInGame',
			'data': {
				idr: getIdr(),
				sh: sessionStorage.getItem('sh')
			}
		}));
	}
	
};

function _move(arrow,target,duration=1){
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

//изменение размера под экран
var timerResize;
		
function resize() {
	var heightScreen = window.innerHeight;
	var widthScreen = window.innerWidth;
	console.log(parseFloat($('.main').css('width')));
	//var widthScreen = document.body.clientWidth;
	//$('#main').css({width: "100%", height: "100%"});
	if (800/500 < widthScreen/heightScreen) {
		$('.main').css('transform', 'scale('+heightScreen/500+')');
		$('.main').css('top', (heightScreen-500)/2);
		$('.main').css('left', (widthScreen-800)/2);
	} else {
		$('.main').css('transform', 'scale('+widthScreen/800+')');
		$('.main').css('top', (heightScreen-500)/2);
		$('.main').css('left', (widthScreen-800)/2);
	}
}


//когда загрузилось
$(document).ready(function() {
	resize();
	resize();
});

//меняем окно
window.onresize = function() {
	clearTimeout(timerResize);
	timerResize = setTimeout(function(){
		resize();
	}, 100);
	//обновляем позиции игроков
	updatePlayers(maxPlayers, players);
};