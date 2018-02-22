var ip = "localhost";
var pos = {};
// var players={};
var player={};
var avatars={};
//var iter=0;
var go;
var completeAnimate;
var win;

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

function createPlayers(_players,_maxPlayers){
	// console.log(_players[0].color);
	resize();
	// console.log(_players[0]);
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
	//console.log(_players[1]);
	var startPosition;
	var leftFiled=document.getElementsByClassName('filed-players')[0];

	var div,money,face,name;
	for(var i=0;i<input;i++){
		avatars[i] = document.createElement('div');
		avatars[i].setAttribute('class','avatar');
		avatars[i].setAttribute('id', 'avatar'+(i+1));
		startPosition=document.getElementById(_players[i].position+1);
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
function bgImg(celssAr){
	var celss=document.getElementsByClassName('celss');
		console.log(celss);
	for(var i=0;i<celss.length;i++){

	}
}
function move(KtoHodit,Cubik){
	var isPlay = true;
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
		//	console.log(newIdElem);

		document.getElementById(avatarPos).removeChild(avatars[KtoHodit-1]);
		document.getElementById(newIdElem).appendChild(avatars[KtoHodit-1]);
		elem.position=newIdElem;
	}
	//Берем координаты всех аватаров и присваиваем их к фишкам
	for(var i=0;i<av.length;i++){
		$("#pl"+(i+1)).animate({left:getCoords(avatars[i]).left-player[i].getBoundingClientRect().width/2-ErrCoordsLeft,
								top: getCoords(avatars[i]).top-player[i].getBoundingClientRect().height/2-ErrCoordsTop},{duration: 500, 
									complete: function() {
										if (isPlay) {
											completeAnimate();
											isPlay = false;
										}
									}});
	}	
}
var maxPlayers;
var players = [];

//все функции как глобальные переменные
var __move, updatePlayers, getIdr, showMoveBtn, hideMoveBtn, completeBuy, sendMessage;

/*		
	ЗАПУСК СЕРВЕРА НА КЛИЕНТЕ
*/
window.onload = function() {
	var ws;
	//соединяем
	function connect() {
		ws = new WebSocket('ws://'+ip+':443');
		ws.onopen = onopen;
		ws.onmessage = onmessage;
		ws.onerror = onerror;
		ws.onclose = onclose;
	}
				
	//при открытии соединения
	function onopen() {//ws.send(JSON.stringify({'type':'getRooms', 'data':idr}));
		//отсылаем запрос о комнате
		ws.send(JSON.stringify({'type':'connectToGame', 'data': {
			sh: localStorage.getItem('sh'), 
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
				createPlayers(m['data'].players, m['data'].maxPlayers);
				//console.log(m['data'].tables);
				// Меняем цвета в ячейках
				//var celssAround=document.getElementsByClassName('celssAround1');
				for(var i=0;i<m['data'].tables.length;i++) {
					console.log();
					$('#'+(i+1)).attr('style', 'background-color:'+m['data'].tables[i].colorOwner);
					$('#'+(i+1)).attr('style', 'background-image: url('+m['data'].tables[i].img+')');
					//$('#'+(i+1)).html(m['data'].tables[i].name);
					//celssAround[i].style.backgroundColor=m['data'].tables[i].colorOwner;
				}
			break;
				
			//обновление данных в комнате
			case 'updateGameRoom':
				//console.log(m['data'].players, m['data'].tables, m['data'].maxPlayers);
				// Меняем цвета в ячейках
				//var celssAround=document.getElementsByClassName('celssAround1');
				for(var i=0;i<m['data'].tables.length;i++) {
					
					$('#'+(i+1)).attr('style', 'background-color:'+m['data'].tables[i].colorOwner);
					//$('#'+(i+1)).html(m['data'].tables[i].name);
					  //celssAround[i].style.backgroundColor=m['data'].tables[i].colorOwner;
				}
				//обновляем игроков
				var money = document.getElementsByClassName('money');
				for (var i=1; i<=m['data'].maxPlayers; i++) {
					money[i-1].innerHTML = m['data'].players[i].balanse;
				}
			break;
				
			//показываем возможность ходить
			case 'showMoveBtn':
				showMoveBtn();
				//мы ходим
				isPlay = true;
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
				
			//предложение о покупке
			case 'buyNotify':
				//console.log("Купить "+m['data'].name+" за "+ m['data'].price+"?");
				createNotify("buy", "Купить "+m['data'].name+" за "+ m['data'].price+"?", "Да", "Нет");
				//win.style.display='flex';
				//var textWindow=document.getElementsByClassName('textWindow')[0];
				//$(textWindow).html('"Купить "'+m['data'].name+'" за "'+ m['data'].price+'"?"');
			break;
			
			//оплата аренды другому игроку
			case 'rentNotify':
				win.style.display='flex';
				var textWindow=document.getElementsByClassName('textWindow')[0];
				$(textWindow).html('"Купить "'+m['data'].name+'" за "'+ m['data'].price+'"?"');
			break;
				
			//пишем новое сообщение в чате
			case 'writeNewMessage':
				addMsg(1, m['data'].text, m['data'].whoWriter);
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
				sh: localStorage.getItem('sh')
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
				sh: localStorage.getItem('sh')
			}
		}));
	}
	
	//отправляем ответ о покупке клетки
	completeBuy = function(_answer) {
		$('.actionWindow').remove();
		ws.send(JSON.stringify({
			type: 'getBuyAnswer',
			data: {
				idr: getIdr(),
				sh: localStorage.getItem('sh'),
				answer: _answer
			}
		}));
	}
	
	completeRent = function() {
		
	}
	
	//показываем табличку с кнопокой хода
	showMoveBtn = function() {
		$('#buttonMove').css('display', 'block');
	}

	//скрываем табличку с кнопокой хода
	hideMoveBtn = function() {
		$('#buttonMove').css('display', 'none');
	}
	
	//отправка сообщения на сервер
	sendMessage = function(_text) {
		ws.send(JSON.stringify({
			type: 'newMessage',
			data: {
				idr: getIdr(),
				sh: localStorage.getItem('sh'),
				text: _text
			}
		}));
	}
};

//создаем всплывающее сообщение
function createNotify(_type="", _text="", _yesBtn="", _noBtn="") {
	var str = '<div class="textWindow">'+_text+'</div>';
	//добавляем инфобар
	var elem = document.createElement('div');
	elem.setAttribute('class', 'actionWindow');
	document.getElementById('full').appendChild(elem);
	$('.actionWindow').draggable();
	
	switch (_type) {
			
		//покупка клетки
		case 'buy':
			str += '<div class="actionButton"><div class="yesBtn btn" onclick="completeBuy(1);">'+_yesBtn+'</div><div class="noBtn btn" onclick="completeBuy(0);">'+_noBtn+'</div></div>';
			elem.innerHTML = str;
		break;
		
		//выплата аренды
		case 'rent':
			str += '<div class="actionButton"><div class="yesBtn btn" onclick="completeBuy(1);">'+_yesBtn+'</div></div>';
			elem.innerHTML = str;
		break;
		
		default:
			//если тип неопределен, то удалить окно
			$('.actionWindow').remove();
		break;
	}
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
}


//меняем окно
window.onresize = function() {
	ErrCoordsLeft=document.getElementsByClassName('main')[0].getBoundingClientRect().left;
	ErrCoordsTop=document.getElementsByClassName('main')[0].getBoundingClientRect().top;
	resize();
};

var textArea=document.getElementsByClassName('textArea')[0];

function addMsg(whoWriter, _text, _nameWriter){
	chatLogs=document.getElementsByClassName('chatLogs')[0];
	var ownMsg,classMsg;
	var message = textArea.value;
	
	if(_text){
		if (whoWriter==1) {
			//Другой пишет
			ownMsg="otherMsg";
			classMsg="";
		} else {
			//Я пишу
			ownMsg="myMsg";
			classMsg="myMsgProp";
		}
		
		$(chatLogs).html(chatLogs.innerHTML+'<div class="messageForm animated zoomInRight"><div class="'+ownMsg+'"><div class="messageLogo animated zoomIn '+classMsg+'"></div><div class="nameWriter">'+_nameWriter+'</div><div class="message">'+_text+'</div></div></div>');
	}
	//сдвигаем скролл в чате вниз при появлении новых сообщений
	chatLogs.scrollTop=chatLogs.scrollHeight;
	//удаляем классы с анимацией, чтобы при появлении новых сообщений
	//анимировались только они
	setTimeout(function() {
		var lastChild=chatLogs.children[chatLogs.children.length-1];
		lastChild.classList.remove('animated');
		lastChild.classList.remove('zoomInRight');

		var lastChildLogo=document.getElementsByClassName('messageLogo');
		lastChildLogo[lastChildLogo.length-1].classList.remove('animated');
		lastChildLogo[lastChildLogo.length-1].classList.remove('zoomIn');
	}, 500);
		
};

//очищаем textarea при Enter
var button=document.getElementsByClassName('button')[0];
button.onclick=function(){
	sendMessage(textArea.value);
	addMsg(0, textArea.value, 'me');
	textArea.value="";
};

textArea.onkeyup=function(event){
	if(event.keyCode==13){
		sendMessage(textArea.value);
		addMsg(0, textArea.value, 'me');
		this.value="";
	}
};

//Двигаем окно с сообщением
/*
if (win) {
	win.onmousedown=function(event){
		var btn=document.getElementsByClassName('btn');
		if((event.target==btn[0])||(event.target==btn[1])){
			this.style.display='none';
			//покупка клетки
			if (event.target==btn[0]) {
				//если да
				completeBuy(1);
			} else {
				//если нет
				completeBuy(0);
			}
		} else {
			var coords=getCoords(win);
			var shiftX=event.pageX-coords.left;
			var shiftY=event.pageY-coords.top;

			win.style.position="absolute";
			document.body.appendChild(win);
			moveAt(event);

			win.style.zIndex= 100;

			function moveAt(event){
				win.style.left=event.pageX-shiftX+'px';
				win.style.top=event.pageY-shiftY+'px';
			}
			document.onmousemove=function(event){
				moveAt(event);
			}
			win.onmouseup=function(){
				document.onmousemove=null;
				win.onmouseup=null;
			}
		}
	};

	win.ondragstart=function(){
		return false;
}

}
*/
