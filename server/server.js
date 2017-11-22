var express = require("express");
var bodyParser = require("body-parser");
var mongoClient = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var md5 = require("./md5");

//* Смотрим БД *//
var app = express();
var jsonParser = bodyParser.json();
var url = "mongodb://localhost:27017/usersdb";

//функция из севера
var changeRoomGlobal; //функция изменения комнаты
var addRoomGlobal; //создание новой комнаты
var delRoomAndStartGlobal; //функция при старте комнаты и удалении для остальных
 
app.use(express.static('../client'));

//при get запросе
app.get("/api/users", function(req, res){
      
    mongoClient.connect(url, function(err, db){
        db.collection("users").find({}).toArray(function(err, users){
            res.send(users)
            db.close();
        });
    });
});

//создание комнаты
app.get("/api/users/:newroom", function(req, res){
      
	var newroom = req.params.newroom;
	//наичнаем искать в бд USERS по логину
    mongoClient.connect(url, function(err, db){
        db.collection("rooms").findOne({login: newroom}, function(err, user){
             
            if(err) return res.status(400).send();
             
            res.send(user);
            db.close();
        });
    });
});

//при POST запросе и url=api/users
//используется для регистрации пользователя
app.post("/api/users", jsonParser, function (req, res) {
     
    if(!req.body) return res.sendStatus(400);
     
	var type = req.body.type; //тип запроса
	// 0 - Регистрация
	// 1 - Логин
	// 2 - Создание комнаты
	// 3 - Коннект к комнате
	// 4 - Проверка комнат
	var nowData = new Date();
	nowData /= 1000;
    var userLogin = req.body.login; //пользовательский логин
    var userPass = req.body.pass; //пароль
	var userSh = req.body.sh; //sh
	var userIdr = req.body.idr; //idr комнаты
	var userNum = req.body.num; //num игрока (сам выбрал)
    var user = {
				login: userLogin,  //логин
				pass: userPass,   //пароль
				sh: md5(md5(userLogin)+md5(nowData.toString())),  //сессия
				whenPlaing: "*" //где сейчас играет, если не *, то играет
			   };
	
    mongoClient.connect(url, function(err, db){
		if (type == 0) {
		//после коннекта ищем челика по логину
			db.collection("users").findOne({login: userLogin}, function(err, _user){
				if (err) return res.status(400).send();
				//если человека нет, то user=null
				if (_user == null) {
					//если нет, то создаем человека
					db.collection("users").insertOne(user, function(err, result){
						if(err) return res.status(400).send();
					});
					res.send(true);
					db.close();
				}
				else {
					//если челик есть, то вернуть false
					res.send(false);
					db.close();
				}
			});
		}
		//логин
		else if (type == 1) {
			//ищем человека
			db.collection("users").findOne({login: userLogin}, function(err, _user){
				if (err) return res.status(400).send();
				//если человека нет, то user=null
				if (_user == null) {
					//если нет, то false ответ
					res.send(false);
					db.close();
				}
				else {
					//если челик есть, то проверить пароли
					if (user.pass == _user.pass) {
						//если пароли совпадают, то вернем session hash
						db.collection("users").findOneAndUpdate(
							{login: user.login},
							{$set: {sh: user.sh}}
						)
						res.send(user.sh);
						db.close();
					}
					else {
						//если не совпадают, то false
						res.send(false);
						db.close();
					}
				}
			});
		}
		//создание комнаты
		else if (type == 2) {
			var _players = {};
			var _room;
			//добавляем с комнату того, кто создал ее
			//console.log(userSh);
			db.collection("users").findOne({sh: userSh} , function(err, _user){
				//проверяем, не играет ли человек == "*"
				if (_user.whenPlaing) {
					_players[1] = {name: _user.login,
								  sh: _user.sh,
								  color: "red",
								  position: 0,
								  balanse: 15000,
								  num: 1
								  };

					//создаем комнату с начальными параметрами
					_room = {idr: md5(new Date()),
							maxPlayers: 2,
							players: _players,
							isPlay: 0,
							whoPlay: 1
							};

					//добавляем комнату в БД
					db.collection("rooms").insertOne(_room, function(err, result) {
						if(err) return res.status(400).send();
					})
					//в челике записать, что он играет
					db.collection("users").findOneAndUpdate({sh: userSh}, {$set: {whenPlaing: _room.idr}});
					addRoomGlobal(_room, _user.sh);
					//так же говорим создателю, что он может удалить комнату
					res.send(_room.idr); //ответ в виде объекта комнаты (потом только idr)
				}
				db.close(); //закрываем коннект
			});
		//присоединение к комнате
		} else if (type == 3) {
			//console.log("1");
			//ищем человека, который хочет коннекта
			db.collection("users").findOne({sh: userSh}, function(err, _user) {
				if(err) return res.status(400).send();
				//получаем массив игроков
				//console.log("2");
				//смотрим, играет ли игрок сейчас == "*"
				console.log(_user.whenPlaing);
				if (_user.whenPlaing ) {
					db.collection("rooms").findOne({idr: userIdr}, function(err, _room) {
						//если нашли человеека
						var _players = _room.players;
						//создаем человека
						//ищем количество людей в комнате
						var counter = 0;
						for (var key in _players) {
							counter++;
						}
						//
						//проверяем, есть ли такой человек в списке
						var checkHuman = false; //предполагаем, что нет
						for (var i=1; i<=counter; i++) {
							//если игрок существует, смотрим его логин
							if (_players[i] != undefined) {
								if (_players[i].name == _user.login) {
									checkHuman = true;
								}
							}
						}
						if (!checkHuman) {
							var color;
							//смотрим сколько сейчас человек
							switch (counter) {
								case 1: color = "blue"; break;
								case 2: color = "brown"; break;
								case 3: color = "green"; break;
								default: color = "orange"; break;
							}
							//добавляем в конец человека
							_players[userNum] = 
									{name: _user.login,
									  sh: _user.sh,
									  color: color,
									  position: 0,
									  balanse: 15000,
									  num: userNum
									  };
							//console.log(_players);
							//ищем комнату по idr и меняем в ней players
							db.collection("rooms").findOneAndUpdate(
										{idr: userIdr},
										{$set: {players: _players}}, function(err, __room) {
											//при удачном добавлении вернуть true
											//и в челике записать, что он играет
											db.collection("users").findOneAndUpdate({sh: userSh}, {$set: {whenPlaing: userIdr}});
											res.send(userIdr);	//отсылаем ссылку
											//отправляем всем клиентам измененые данные
											db.collection("rooms").findOne({idr: userIdr}, function(err, _room){
												//если людей >= чем максимум, то удаляем из общей комнаты, 
												//а людей из комнаты отправляем в игру
												counter = 0;
												for (var key in _players) {
													counter++;
												}
												if (counter >= _room.maxPlayers) {
													//говорим, что комната играет
													db.collection("rooms").findOneAndUpdate({idr: userIdr}, {$set: {isPlay: 1}});
													delRoomAndStartGlobal(_room);
												} else {
													//иначе обновляем данные в комнате
													changeRoomGlobal(_room);
												}
											});
											db.close();
							});
							
							
						//если челик уже есть, возврат false
						} else {
							res.send(false);
							db.close();
						}
					});
				//если он уже играет, то отсылаем false
				} else {
					res.send(false);
					db.close();
				}
				//ищем массив с игроками
			});
		//запрос на комнаты
		} else if (type == 4) {
			//ищем комнаты, которые не играют
			db.collection("rooms").find({}).toArray(
				function(err, _rooms) {
				res.send(_rooms);
				db.close();
			});
		}
		
	});
});
  
app.delete("/api/users/:id", function(req, res){
      
    var id = new objectId(req.params.id);
    mongoClient.connect(url, function(err, db){
        db.collection("users").findOneAndDelete({_id: id}, function(err, result){
             
            if(err) return res.status(400).send();
             
            var user = result.value;
            res.send(user);
            db.close();
        });
    });
});
 
app.put("/api/users", jsonParser, function(req, res){
      
    if(!req.body) return res.sendStatus(400);
    var id = new objectId(req.body.id);
    var userName = req.body.name;
    var userAge = req.body.age;
     
    mongoClient.connect(url, function(err, db){
        db.collection("users").findOneAndUpdate({_id: id}, { $set: {age: userAge, name: userName}},
             {returnOriginal: false },function(err, result){
             
            if(err) return res.status(400).send();
             
            var user = result.value;
            res.send(user);
            db.close();
        });
    });
});
  
app.listen(3000, function(){
    console.log("Сервер ожидает подключения...");
});

//* Закончили работу с БД *//

process.on('uncaughtException', function(err) {
	console.log('Caught Exception: '+err);
});

app.listen(80);

// использование Math.round() даст неравномерное распределение!
function rand(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
==========
			ИГРОВОЙ СЕРВЕР
==========
*/

//веб сервер
var WebSocketServer = new require('ws');

var peers = []; //ссылки на клиенты

// WebSocket-сервер на порту 443
var webSocketServer = new WebSocketServer.Server({
  port: 443
});

webSocketServer.on('connection', function(ws) {
	//ws.send(JSON.stringify({'type':'map', 'data':map}));
	
	/*//посылаем данные клиентам
	var interval = setInterval(function() {
		if (ws && ws.readyState == 1) {
			ws.send(JSON.stringify({'type':'players', 'data':players, 'myid':id}));
		}
	}, 10);*/
	//peers[peers.length] = ws; //добавляем ссылку при коннекте

	//получаем данные
	ws.on('message', function(message) {
		try {var m = JSON.parse(message);} catch(e){return;}
		switch (m['type']) {
			//получаем номер сессии и получаем доступ к ней
			case 'idr':
				echos(m['data']); //отвечаем
				break;
			case 'connectToRoom':
				peers.push({ws: ws, sh: m['data']}); //добавляем ссылку при коннекте
				console.log("Соединение с "+m['data']+" установлено.");
				break;
		}
	 });

	//закрываем соединение
	ws.on('close', function() {
		//проходимся по всем коннектам
		for (var i=0; i<peers.length; i++) {
			//если адреса совпадают, то удаляем
			if (peers[i].ws == ws) {
				console.log("Закрыто соединение c клиентом "+peers[i].sh);
				peers.splice(i, 1);
				console.log("Количество клиентов: "+peers.length);
				break;
			}
		}
	});
	
	/*
		ИЗМЕНЕНИЕ КОМНАТЫ
	*/
	changeRoomGlobal = function changeRoom(_room) {
		//отправляем комнату всем
		for (var i=0; i<peers.length; i++) {
			peers[i].ws.send(JSON.stringify({'type':'updateRoom', 'data':_room}));
		}
	}
	
	/*
		ДОБАВЛЕНИЕ КОМНАТЫ
	*/
	addRoomGlobal = function addRoom(_room, _sh) {
		//отправляем комнату всем
		for (var i=0; i<peers.length; i++) {
			peers[i].ws.send(JSON.stringify({'type':'addRoom', 'data':_room}));
			//так же создателю комнаты отправляем возможность удалить комнату
			if (peers[i].sh == _sh) {
				peers[i].sh.send(JSON.stringify({'type':'canDelRoom', 'data': _room.idr}));
			}
		}
	}
	
	/*
		УДАЛЕНИЕ КОМНАТЫ И СТАРТ ДЛЯ ПРИКОННЕКЧЕННЫХ ИГРОКОВ
	*/
	delRoomAndStartGlobal = function delAndStartRoom(_room) {
		//отсылаем клиентам, приконнекченным к комнате переход
		//а остальным удалить комнату
		//получаем игроков из комнаты
		var _players = _room.players;
		//получаем количество игроков
		var counter = 0;
		for (var key in _players) {
			counter++;
		}		
		//удаляем у все эту комнату
		for (var i=0; i<peers.length; i++) {
			//отсылаем им idr удаления
			peers[i].ws.send(JSON.stringify({'type': 'deleteRoom','data': _room.idr}));
		}
		var wsToDir = [];
		
		for (var i=1; i<=counter; i++) {
			//ищем среди всех
			for (var j=0; j<peers.length; j++) {
				if (_players[i].sh == peers[j].sh) {
					//записали
					wsToDir[wsToDir.length] = peers[j].ws;
				}
			}
		}
		
		for (var i=0; i<wsToDir.length; i++) {
			wsToDir[i].send(JSON.stringify({'type': 'redirectToGame','data': _room.idr}));
		}
		console.log('Старт игровой комнаты '+_room.idr);
	}
	
	/* 
		Функция ответчик комнаты и соединения
	*/
	function echos(_idr) {
		//отправляем данные (комнату)
		//Коннектимся с БД
		mongoClient.connect(url, function(err, db){
			//отправляем данные по полученному idr
				db.collection("rooms").findOne({idr: _idr}, function(err, _obj){
					ws.send(JSON.stringify({'type':'echo', 'data':_obj.idr}));
					db.close();
				});
		});
	}	
});