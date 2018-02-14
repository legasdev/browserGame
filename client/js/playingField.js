var pos = {};
// var players={};
var player={};
var avatars={};
//var iter=0;
var go;
var completeAnimate;

function getCoords(elem){
	var el=elem.getBoundingClientRect();
	return {
		top:el.top + pageYOffset,
		left:el.left + pageXOffset
	};
}
	var ErrCoordsLeft=document.getElementsByClassName('main')[0].getBoundingClientRect().left;
	var ErrCoordsTop=document.getElementsByClassName('main')[0].getBoundingClientRect().top;
	var input;

// function createPlayers(_players, _input){
// 	resize();
// 	var Pl=document.getElementById('empty');
// 	//input=parseFloat(document.getElementById('num').value);
// 	input = _input; //ввод количества игроков
// 	var filed=document.getElementsByClassName('filed-game')[0];
// 	var _height = parseFloat($('#1').css("height"));
// 	var _width = parseFloat($('#1').css('width'));
// 	var avatar=document.getElementsByClassName('avatar');
// 	var a=$("#1").position();
// 	//Создаём фишки
// 	for(var i=0;i<_input;i++){
// 		players[i] = document.createElement('div');
// 		players[i].setAttribute('class','empty');
// 		players[i].setAttribute('id', 'pl'+(i+1));
// 		//цвета игроков
// 		players[i].style.backgroundColor=_players[i].color;
// 		players[i].innerHTML=i+1;
// 		//добавляем игроков
// 		filed.appendChild(players[i]);
// 		pos["pl"+(i+1)] = 1;
// 	}
// 	//Создаём аватарки
// 	var startPosition=document.getElementById('1');
// 	var leftFiled=document.getElementsByClassName('filed-players')[0];
// 	var div;
// 	var namePlayerDiv;
// 	var balansePlayerDiv;
// 	for(var i=0;i<_input;i++){
// 		avatars[i] = document.createElement('div');
// 		avatars[i].setAttribute('class','avatar');
// 		avatars[i].setAttribute('id', 'avatar'+(i+1));
// 		startPosition.appendChild(avatars[i]);
// 		//создаём поля игроков слева
// 		div=document.createElement('div');
// 		div.setAttribute("class", "playerInfo");
// 		div.style.backgroundColor=_players[i].color;
// 		if(_input>5){
// 			div.style.width="50%";
// 		}
// 		leftFiled.appendChild(div);
// 		//создаем блок с именем
// 		namePlayerDiv=document.createElement('div');
// 		namePlayerDiv.setAttribute("class", "playerName");
// 		namePlayerDiv.innerHTML=_players[i].name;
// 		div.appendChild(namePlayerDiv);
// 		//создаем блок с балансом
// 		balansePlayerDiv=document.createElement('div');
// 		balansePlayerDiv.setAttribute("class", "playerBalanse");
// 		balansePlayerDiv.innerHTML=_players[i].balanse;
// 		div.appendChild(balansePlayerDiv);
// 	}	
// 	resize();
// 	//Двигаем фишки на стартовые координаты аватарок
// 		for(var i=0;i<_input;i++){
// 			$("#pl"+(i+1)).animate({left:getCoords(avatars[i]).left-players[i].getBoundingClientRect().width/2-ErrCoordsLeft,
// 									top: getCoords(avatars[i]).top-players[i].getBoundingClientRect().height/2-ErrCoordsTop},1000);
// 		}

// }
function createPlayers(_players,_maxPlayers){
	// console.log(_players[0].color);
	resize();
	console.log(_players);
	var Pl=document.getElementById('empty');
	input=_maxPlayers;
	var filed=document.getElementsByClassName('filed-game')[0];
	var _height = parseFloat($('#1').css("height"));
	var _width = parseFloat($('#1').css('width'));
	var avatar=document.getElementsByClassName('avatar');
	var a=$("#1").position();
	//Создаём фишки
	for(var i=0;i<input;i++){
		player[i] = document.createElement('div');
		player[i].setAttribute('class','empty');
		player[i].setAttribute('id', 'pl'+(i+1));
		//цвета игроков
		player[i].style.backgroundColor=_players[i].color;
		// player[i].innerHTML=_players[i].id;
		//добавляем игроков
		filed.appendChild(player[i]);
		pos["pl"+(i+1)] = 1;
	}
	//Создаём аватарки
	var startPosition=document.getElementById('1');
	var leftFiled=document.getElementsByClassName('filed-players')[0];

	var div,money,face,name;
	for(var i=0;i<input;i++){
		avatars[i] = document.createElement('div');
		avatars[i].setAttribute('class','avatar');
		avatars[i].setAttribute('id', 'avatar'+(i+1));
		startPosition.appendChild(avatars[i]);
		//создаём поля игроков слева
		div=document.createElement('div');
		face=document.createElement('div');
		name=document.createElement('div');
		money=document.createElement('div');
		//добавляем классы в дивы
			div.classList.add('infoPlayer');
			face.classList.add('face');
			money.classList.add('money');
			name.classList.add('name');

		div.style.backgroundColor=_players[i].color;

		name.innerHTML=_players[i].name;
		div.insertBefore(face,div.firstChild);
		div.appendChild(name);
		div.appendChild(money);

		money.innerHTML=_players[i].balanse;
		if(input>5){
			div.style.width="50%";
		}
		leftFiled.appendChild(div);
	}	
	resize();
	//Двигаем фишки на стартовые координаты аватарок
		for(var i=0;i<input;i++){
			$("#pl"+(i+1)).animate({left:getCoords(avatars[i]).left-player[i].getBoundingClientRect().width/2-ErrCoordsLeft,
									top: getCoords(avatars[i]).top-player[i].getBoundingClientRect().height/2-ErrCoordsTop},1000);
		}

}
// function move(iter, _newCube){
// 	iter = parseFloat(iter);
// 	var elem=avatars[iter];
// 	var av=document.getElementsByClassName('avatar');
// 	var pls=document.getElementsByClassName('empty');

// 	console.log(elem);
	
// 	var Cube = 1;
// 	var idAvatar=parseInt(elem.id.replace(/\D+/g," "));
// 	//Текущая позиция аватарки
// 	var avatarPos=parseInt(elem.parentNode.id);
// 	//Cube = rand(1,6)+rand(1,6);
// 	Cube = _newCube;
// 	//Считаем новую позицию (ID позиции) аватарки
// 	var newIdElem = avatarPos + Cube;
// 	//Удаляем аватарку из староко элемента и добавляем в новый
// 	if (newIdElem > 40) {
// 		newIdElem=Cube-(40-avatarPos);
// 		document.getElementById(avatarPos).removeChild(elem);
// 		document.getElementById(newIdElem).appendChild(elem);
// 	} 
// 	else {	
// 		document.getElementById(avatarPos).removeChild(elem);
// 		document.getElementById(newIdElem).appendChild(elem);
// 	}
// 	//Берем координаты всех аватаров и присваиваем их к фишкам
// 	for(var i=0;i<av.length;i++){
// 		$("#pl"+(i+1)).animate({left:getCoords(avatars[i]).left-players[i].getBoundingClientRect().width/2-ErrCoordsLeft,
// 								top: getCoords(avatars[i]).top-players[i].getBoundingClientRect().height/2-ErrCoordsTop},1000);
// 	}
// 	console.log(av.length+" : "+iter+". Выпало: "+Cube+". new elem: "+newIdElem);
// 	/*if(iter==av.length-1){
// 		iter=0;
// 	}else{iter++;}*/	
// }
function move(KtoHodit,Cubik){
	console.log(KtoHodit+" : "+ Cubik);
	var elem=avatars[KtoHodit-1];
		console.log(avatars[KtoHodit-1].parentNode.id);
	var av=document.getElementsByClassName('avatar');
	var pls=document.getElementsByClassName('empty');	
	//Текущая позиция аватарки
	var avatarPos=avatars[KtoHodit-1].parentNode.id;

	//Считаем новую позицию (ID позиции) аватарки
	var newIdElem=+avatarPos +Cubik;
	//Удаляем аватарку из старого элемента и добавляем в новый
	if (newIdElem > 40) {
		newIdElem=Cubik-(40-avatarPos);
		document.getElementById(avatarPos).removeChild(avatars[KtoHodit-1]);
		document.getElementById(newIdElem).appendChild(avatars[KtoHodit-1]);
		elem.position=newIdElem;
	} 
	else {	
			console.log(newIdElem);

		document.getElementById(avatarPos).removeChild(avatars[KtoHodit-1]);
		document.getElementById(newIdElem).appendChild(avatars[KtoHodit-1]);
		elem.position=newIdElem;
	}
	//Берем координаты всех аватаров и присваиваем их к фишкам
	for(var i=0;i<av.length;i++){
		$("#pl"+(i+1)).animate({left:getCoords(avatars[i]).left-player[i].getBoundingClientRect().width/2-ErrCoordsLeft,
								top: getCoords(avatars[i]).top-player[i].getBoundingClientRect().height/2-ErrCoordsTop},{duration: 500, 
									complete: function() {
										completeAnimate();
									}});
	}	
}
var maxPlayers;
var players = [];

//все функции как глобальные переменные
var __move, updatePlayers, getIdr, showMoveBtn, hideMoveBtn;
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
	function onopen() {//ws.send(JSON.stringify({'type':'getRooms', 'data':idr}));
		//отсылаем запрос о комнате
		ws.send(JSON.stringify({'type':'connectToGame', 'data': {
			sh: sessionStorage.getItem('sh'), 
			idr: getIdr()
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
			//создает игроков в комнате
			case 'createPlayer':
				createPlayers(m['data'].players,m['data'].maxPlayers);
				// console.log(m['data'].players);
			//обновление данных в комнате
			case 'updateGameRoom':
				// console.log(m['data']);
				//создаем игроков
				//updatePlayers(m['data'].maxPlayers, m['data'].players);
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
			//обновление игровых позиций
			case 'update':
				//console.log(m['data'].cube1, m['data'].cube2, m['data'].whoMove);
				move(m['data'].whoMove, m['data'].cube1+m['data'].cube2)
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
	
	//ходим!
	go = function() {
		//отправляем запрос
		ws.send(JSON.stringify({
			type: 'nextStep', 
			data: {
				idr: getIdr(),
				sh: sessionStorage.getItem('sh')
			}
		}));
	}
	
	//когда закончилась анимация, говорим об этом серверу
	completeAnimate = function() {
		//отправляем запрос на данные, какой ответ выдать
		ws.send(JSON.stringify({
			type: 'completeAnimate',
			data: {
				idr: getIdr(),
				sh: sessionStorage.getItem('sh')
			}
		}));
	}
	/*
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
	}*/

	//показываем табличку с кнопокой хода
	showMoveBtn = function() {
		$('#buttonMove').css('display', 'block');
	}

	//скрываем табличку с кнопокой хода
	hideMoveBtn = function() {
		$('#buttonMove').css('display', 'none');
	}

	// //функция хода
	// move = function() {
	// 	//отправляем на сервер инфу
	// 	ws.send(JSON.stringify({
	// 		'type': 'moveInGame',
	// 		'data': {
	// 			idr: getIdr(),
	// 			sh: sessionStorage.getItem('sh')
	// 		}
	// 	}));
	// }
	
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
		//fdf
function resize() {

	var empty=document.getElementsByClassName('empty');
	var widthMain=document.getElementsByClassName('main')[0].getBoundingClientRect().width;
	var koef=0.018;
	var hSize=widthMain*koef;
	for (var i = 0; empty.length>i;i++) {
				// console.log(hSize+"px");
		empty[i].style.width=hSize+"px";
		empty[i].style.height=hSize+"px";
	}
	for(var i=0;i<input;i++){
			$("#pl"+(i+1)).animate({left:getCoords(avatars[i]).left-player[i].getBoundingClientRect().width/2-ErrCoordsLeft,
									top: getCoords(avatars[i]).top-player[i].getBoundingClientRect().height/2-ErrCoordsTop},1);
		}
	// var heightScreen = window.innerHeight;
	// var widthScreen = window.innerWidth;
	// console.log(parseFloat($('.main').css('width')));
	// //var widthScreen = document.body.clientWidth;
	// //$('#main').css({width: "100%", height: "100%"});
	// if (800/500 < widthScreen/heightScreen) {
	// 	$('.main').css('transform', 'scale('+heightScreen/500+')');
	// 	$('.main').css('top', (heightScreen-500)/2);
	// 	$('.main').css('left', (widthScreen-800)/2);
	// } else {
	// 	$('.main').css('transform', 'scale('+widthScreen/800+')');
	// 	$('.main').css('top', (heightScreen-500)/2);
	// 	$('.main').css('left', (widthScreen-800)/2);
	// }
}


// //когда загрузилось
// $(document).ready(function() {
// 	resize();
// 	resize();
// });

//меняем окно
window.onresize = function() {
	// clearTimeout(timerResize);
	// timerResize = setTimeout(function(){
		
	// }, 1);
	ErrCoordsLeft=document.getElementsByClassName('main')[0].getBoundingClientRect().left;
	ErrCoordsTop=document.getElementsByClassName('main')[0].getBoundingClientRect().top;
	resize();
	//обновляем позиции игроков
	// updatePlayers(maxPlayers, players);
};