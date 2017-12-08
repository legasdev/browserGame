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
	//обновляем позиции игроков
	updatePlayers(maxPlayers, players);
};