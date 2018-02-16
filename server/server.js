var express = require("express");
var bodyParser = require("body-parser");
var mongoClient = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var md5 = require("./md5");

//* Смотрим БД *//
var app = express();
var jsonParser = bodyParser.json();
var host = "25.52.102.108";
var port = "27017";
var bd = "usersdb";
var appport = 80;
var wsport = 443;
var url = "mongodb://"+host+":"+port+"/"+bd;

//функция из севера
var changeRoomGlobal; //функция изменения комнаты
var addRoomGlobal; //создание новой комнаты
var delRoomAndStartGlobal; //функция при старте комнаты и удалении для остальных
var deleteRoomGlobal; //функция удаления комнаты у клиентов
 
app.use(express.static('../client'));

//при get запросе
app.get("/api/users", function(req, res){
      
    mongoClient.connect(url, function(err, db){
        db.collection("users").find({}).toArray(function(err, users){
            //res.send(users)
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
             
            //res.send(user);
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
	var maxPlayersIn = req.body.maxPlayers; //максимум человек выбрано
    var user = {
				login: userLogin,  //логин
				pass: userPass,   //пароль
				sh: md5(md5(userLogin)+md5(nowData.toString())),  //сессия
				whenPlaying: "*" //где сейчас играет, если не *, то играет
			   };
	
    mongoClient.connect(url, function(err, db){
		switch (type) {
			//регистрация
			case 0: {
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
				break;
		}
			//логин
			case 1: {
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
				break;
		}
			//создание комнаты
			case 2: {
				var _players = {};
				var _room;
				var _tables = []; //игровые поля

				//добавляем дефолтные таблички в данный объект
				db.collection('monopolyTable').find().toArray(function(err, result){
					_tables = result;
				});
				//добавляем с комнату того, кто создал ее
				//console.log(userSh);
				db.collection("users").findOne({sh: userSh} , function(err, _user){
					//проверяем, не играет ли человек == "*"
					if (_user.whenPlaying  == "*") {
						_players[1] = {name: _user.login,
									  sh: _user.sh,
									  color: "rgb(198, 144, 208)",
									  position: 0,
									  balanse: 15000,
									  num: 1
									  };

						//создаем комнату с начальными параметрами
						_room = {idr: md5(new Date()),
								maxPlayers: maxPlayersIn,
								players: _players,
								tables: _tables,
								isPlay: 0,
								whoPlay: 1
								};

						//добавляем комнату в БД
						db.collection("rooms").insertOne(_room, function(err, result) {
							if(err) return res.status(400).send();
						});
						//в челике записать, что он играет
						db.collection("users").findOneAndUpdate({sh: userSh}, {$set: {whenPlaying: _room.idr}});
						console.log("**(?)** INFO:\t\tДобавлена комната: "+_room.idr);
						addRoomGlobal(_room, _user.sh);
						//так же говорим создателю, что он может удалить комнату
						res.send(_room.idr); //ответ в виде объекта комнаты (потом только idr)
					}
					db.close(); //закрываем коннект
				});
				break;
			}
			//присоединение к комнате
			case 3: {
				//console.log("1");
				//ищем человека, который хочет коннекта
				db.collection("users").findOne({sh: userSh}, function(err, _user) {
					if(err) return res.status(400).send();
					//получаем массив игроков
					//console.log("2");
					//смотрим, играет ли игрок сейчас == "*"
					if (_user.whenPlaying  == "*") {
						db.collection("rooms").findOne({idr: userIdr}, function(err, _room) {
							if (_room != undefined) {
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
										case 1: color = "rgb(233,186,116)"; break;
										case 2: color = "rgb(76,118,116)"; break;
										case 3: color = "rgb(238,122,85)"; break;
										default: color = "rgb(198,0,1)"; break;
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
											db.collection("users").findOneAndUpdate({sh: userSh}, {$set: {whenPlaying: userIdr}});
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
														db.collection('rooms').findOneAndUpdate({idr: userIdr}, {$set: {isPlay: "1"}});
														delRoomAndStartGlobal(_room);
													} else {
														//иначе обновляем данные в комнате
														changeRoomGlobal(_room, _players[1].sh, userSh, _user.login);
													}
											});
											//db.close();
									});


								//если челик уже есть, возврат false
								} else {
									res.send(false);
									db.close();
								}
							}
						});
					//если он уже играет, то отсылаем false
					} else {
						res.send(false);
						db.close();
					}
				});
				break;
			} 
			//запрос на комнаты
			case 4: {
				//ищем комнаты, которые не играют
				db.collection("users").findOne({sh: userSh}, function(err, _user) {
					setTimeout(function() {
						db.collection("rooms").find().toArray(
							function(err, _rooms) {
								for (var i=0; i<_rooms.length; i++) {
									if (parseFloat(_rooms[i].isPlay) == 0) {
										addRoomGlobal(_rooms[i], _rooms[i].players[1].sh, userSh, _user.login);
									}
							}
							//res.send(_rooms);
							db.close();
						});
					}, 500);	
				});				
				break;
			}
			//удаление комнаты
			case 5: {
				//удалили комнату и отослали обновление комнат
				db.collection("rooms").findOne({idr: userIdr}, function(err, _room) {
					if(err) return res.status(400).send();
					//проверять, если комната не играет
					if (_room != undefined) {
						if (_room.isPlay == 0) {
							//у всех, кто приконнектиллся к комнате удалить то, что они играют
							var _players = _room.players;
							//считаем игроков
							var playerSH = []; //массив с sh игроков
							//берем челика из комнаты и сверяем его sh
							for (var i=1; i <= 10; i++) {
								if (_players[i] != undefined) {
									db.collection("users").findOneAndUpdate({sh: _players[i].sh}, {$set: {whenPlaying: '*'}});
								}
							}
							//удалить у клиентов со страницы
							deleteRoomGlobal(_room.idr);
							//и удалить из базы
							db.collection("rooms").findOneAndDelete({idr: userIdr}, function(err, result) {
								if(err) return res.status(400).send();
							});
						}
					}
				});
				break;
			}
		}
	});
});
/*
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
*/

app.listen(3000, function(){
    console.log("\t=====[ СЕРВЕР ЗАПУЩЕН ]=====");
	console.log("**(?)** HOST:\t\t"+host);
	console.log("**(?)** PORT:\t\t"+port);
	console.log("**(?)** AppPort:\t"+appport);
	console.log("**(?)** WSPort:\t\t"+wsport);
	console.log("**(?)** DB:\t\t"+bd);
	console.log("**(?)** INFO:\t\tСервер ждет подключений...");
});

//* Закончили работу с БД *//

process.on('uncaughtException', function(err) {
	console.log('**(!)** ERROR:\t\tВозникла ошибка: '+err);
});

app.listen(appport);

// использование Math.round() даст неравномерное распределение!
function rand(min, max) {
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
var peersInGame = [[]]; //ссылки на клиенты в игре

// WebSocket-сервер на порту 443
var webSocketServer = new WebSocketServer.Server({
  port: wsport
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
		try {var m = JSON.parse(message);} catch(e) {return;}
		switch (m['type']) {
				
			//получаем номер сессии и получаем доступ к ней
			case 'idr':
				echos(m['data']); //отвечаем
			break;
			
			//коннект к поиску игры
			case 'connectToRoom':
				peers.push({ws: ws, sh: m['data']}); //добавляем ссылку при коннекте
				mongoClient.connect(url, function(err, db){
					db.collection('users').findOne({sh: m['data']}, function(err, _user){
						if (_user.whenPlaying != "*") {
							ws.send(JSON.stringify({
								type: 'addUrlToGame',
								data: {
									idr: _user.whenPlaying
								}
							}));
						}
					});
				});
				
				console.log("**(?)** INFO:\t\tСоединение с "+m['data']+" установлено.");
			break;
			
			//коннект к игровой комнате
			case 'connectToGame':
				//проверить, есть ли чел в массиве!!!!!!!!!!
				//проверка на существование комнаты
				var check = true;
				for (var i=0; i<peersInGame.length; i++) {
					//если нашли комнату, заносим нового челика
					if (peersInGame[i][0] == m['data'].idr) {
						var checkNewPlayer = true;
						for (var j=1; j<peersInGame[i].length; j++) {
							if (peersInGame[i][j].sh == m['data'].sh) {
								checkNewPlayer = false;
							}
						}
						if (checkNewPlayer) {
							peersInGame[i][peersInGame[i].length] = {ws: ws, sh: m['data'].sh, idr: m['data'].idr};
						}
						//нашли комнату
						check = false;
					}
				}
				//добавляем ссылки игроков уже в игре
				//теперь проходимся по списку игроков в комнате
				//если этот игрок играет и его ход, то нужно отослать
				//показ кнопки этому клиенту
				mongoClient.connect(url, function(err, db){
					//нашли игровую комнату по входу idr
					db.collection("rooms").findOne({idr: m['data'].idr}, function(err, _room){
						//смотрим, нашлась ли комната
						if (_room) {
							//если комната создается впервые, то добавляем ее в массив
							if (check) {
								var maxIndex = peersInGame.length;
								peersInGame[maxIndex] = [];
								peersInGame[maxIndex][0] = m['data'].idr;
								peersInGame[maxIndex][1] = {ws: ws, sh: m['data'].sh, idr: m['data'].idr};
							}
							//все игроки в комнате
							var allPlayer = _room.players;
							//проходим по всем клиентам
							/*for (var i=1; i<=_room.maxPlayers; i++) {
								//если такой в комнате есть и его ход, то показываем ему кнопку
								if (allPlayer[i].sh == m['data'].sh && allPlayer[i].num == _room.whoPlay) {
									//отсылаем запрос
									for (var i=0; i<peersInGame.length; i++) {
											ws.send(JSON.stringify({'type': 'showMoveBtn'}));
									}
								}
							}*/
							
							//кто сейчас должен играть
							var whoPlay = _room.players[_room.whoPlay];

							//находим комнату
							for (var i=0; i<peersInGame.length; i++) {
								if (peersInGame[i][0] == m['data'].idr) {
									//перебор игроков
									for (var j=1; j<peersInGame[i].length; j++) {
										//если чел ходит, то показать кнопку, остальным скрыть
										if (peersInGame[i][j].sh == whoPlay.sh) {
											peersInGame[i][j].ws.send(JSON.stringify({'type': 'showMoveBtn'}));
										} else {
											peersInGame[i][j].ws.send(JSON.stringify({'type': 'hideMoveBtn'}));
										}
									}
								}
							}
							
							var _players = [];
							//создаем массив с нужными данными об игроках
							for (var i=1; i<=_room.maxPlayers; i++) {
								_players[i-1] = {
									name: allPlayer[i].name,
									color: allPlayer[i].color,
									position: allPlayer[i].position,
									balanse: allPlayer[i].balanse
								}
							}
							//отправляем данные о игроках и таблички при коннекте
							ws.send(JSON.stringify({
								type:'createPlayer', 
								data:{
									players: _players,
									maxPlayers: _room.maxPlayers,
									tables: _room.tables
								}
							}));
						} 
						//если не нашлась комната
						else {
							console.log('Комната не существует.');
						}
					});
				});			
			break;
				
			//следующий шаг в монополии
			case 'nextStep':
				//открываем комнату в базе
				mongoClient.connect(url, function(err, db){
					db.collection('rooms').findOne({idr: m['data'].idr}, function (err, _room) {
						//если комната есть
						if (_room) {
							//игроки в комнате
							var playersInRoom = _room.players;
							//ищем количество людей в комнате
							var counter = 0;
							for (var key in playersInRoom) {
								counter++;
							}
							//беребираем всех игроков
							for (var i=1; i<=counter; i++) {
								//ищем совпадение в sh
								if (playersInRoom[i].sh == m['data'].sh) {
									//генерируем рандомное число
									var cube_1 = rand(1, 6);
									var cube_2 = rand(1, 6);
									var cube = cube_1 + cube_2;
									//ходим
									if (parseFloat(playersInRoom[i].position)+cube<40) {
										playersInRoom[i].position = parseFloat(playersInRoom[i].position)+cube;
									} else {
										playersInRoom[i].position = cube - (40-parseFloat(playersInRoom[i].position));
									}
									//обновляем данные в базе
									db.collection('rooms').findOneAndUpdate({idr: m['data'].idr}, {$set: {players: playersInRoom}});
									//отправляем на клиенты обновленные позиции
									for (var j=0; j<peersInGame.length; j++) {
										//елси комнату нашли
										if (peersInGame[j][0] == m['data'].idr) {
											//отправляем данные всем
											for (var k=1; k<peersInGame[j].length; k++) {
												peersInGame[j][k].ws.send(JSON.stringify({type: 'update', data: {
													cube1: cube_1,
													cube2: cube_2,
													whoMove: i
													//newPos: _room.players[1].position
												}}));
											}
										}
									}
								}
							}
						} else {
							console.log("Комнаты нет.");
						}
					});
					//db.close();
				});
			break;
				
				//когда проигралась анимация на клиенте
			case 'completeAnimate':
				//открываем базу
				mongoClient.connect(url, function(err, db){
					//находим комнату
					db.collection('rooms').findOne({idr: m['data'].idr}, function(err, _room){
						
						//определяем, что это за позиция и выводим игроку событие,
						//которое будет выполняться
						
						//нашли человека
						var whoPlay = _room.players[_room.whoPlay];
						if (whoPlay.sh == m['data'].sh) {
							//теперь выдадим игроку сообщение, в зависимости от позиции
							for (var i=0; i<_room.tables.length; i++) {
								//находим плашку в бд с нужной позицией
								if (_room.tables[i].num-1 == whoPlay.position) {
									//если имена совпадают, то говорим, что игрок на своей клетке
									if (_room.tables[i].owner == whoPlay.name) {
										/////// НУЖНО СКАЗАТЬ
									} else if (_room.tables[i].owner == 'none') {
										//если никому не принадлежит, то предложить купить
										for (var k=0; k<peersInGame.length; k++) {
											if (peersInGame[k][0] == m['data'].idr) {
												for (var t=1; t<peersInGame[k].length; t++) {
													if (peersInGame[k][t].sh == whoPlay.sh) {
														peersInGame[k][t].ws.send(JSON.stringify({
															type: 'buyNotify',
															data: {
																price: _room.tables[i].price,
																name: _room.tables[i].name
															}
														}));
													}
												}
											}
										}
									} else {
										//если клетка чья-то, то ищем человека и передаем деньги ему
									}
								}
							}
						}
						//для начала найти позицию игрока в бд
						/*for (var i=1; i<=_room.maxPlayers; i++) {
							if (_room.players[i].sh == m['data'].sh && _room.players[i].num == parseFloat(_room.whoPlay)) {
								//whoPlayPos = _room.players[i].position;
								console.log(_room.whoPlay, i);
								//есди этот номер играет
								//теперь выдадим игроку сообщение, в зависимости от позиции
								for (var j=0; j<_room.tables.length; j++) {
									//находим плашку в бд с нужной позицией
									if (_room.tables[j].num-1 == _room.players[i].position) {
										//если имена совпадают, то говорим, что игрок на своей клетке
										console.log(_room.tables[j].owner);
										if (_room.tables[j].owner == _room.players[i].name) {
											/////// НУЖНО СКАЗАТЬ
										} else if (_room.tables[j].owner == 'none') {
											//если никому не принадлежит, то предложить купить
											for (var k=0; k<peersInGame.length; k++) {
												if (peersInGame[k][0] == m['data'].idr) {
													for (var t=1; t<peersInGame[k].length; t++) {
														peersInGame[k][t].ws.send(JSON.stringify({
															type: 'buyNotify',
															data: {
																price: _room.tables[j].price,
																name: _room.tables[j].name
															}
														}));
													}
												}
											}
										} else {
											//если клетка чья-то, то ищем человека и передаем деньги ему

										}
									}
								}
							}
						}*/
						//console.log(_room.tables[0]);
						//пока что скрытие кнопок у всех и показ кнопки у следующего игрока
						//определим, какой sh у игрока
						//который ходит следующим
						
					});
				});
			break;
			
			//ответ на покупку ничей клетки
			case 'getBuyAnswer':
				//изменяем номер того, кто ходит
				setTimeout(function(){
					mongoClient.connect(url, function(err, db) {
						db.collection('rooms').findOne({idr: m['data'].idr}, function (err, _room){
							var whoMove = _room.whoPlay;
							if (whoMove+1<=_room.maxPlayers) {
								db.collection('rooms').findOneAndUpdate({idr: m['data'].idr}, {$set: {whoPlay: whoMove+1}});
								whoMove+=1;
							} else {
								db.collection('rooms').findOneAndUpdate({idr: m['data'].idr}, {$set: {whoPlay: 1}});
								whoMove=1;
							}	
							//кто сейчас должен играть
							var whoPlay = _room.players[whoMove];
							//находим комнату
							for (var i=0; i<peersInGame.length; i++) {
								if (peersInGame[i][0] == m['data'].idr) {
									//перебор игроков
									for (var j=1; j<peersInGame[i].length; j++) {
										//если чел ходит, то показать кнопку, остальным скрыть
										if (peersInGame[i][j].sh == whoPlay.sh) {
											peersInGame[i][j].ws.send(JSON.stringify({'type': 'showMoveBtn'}));
										} else {
											peersInGame[i][j].ws.send(JSON.stringify({'type': 'hideMoveBtn'}));
										}
									}
								}
							}
						});
					});
				}, 200);
			break;
		}
	 });
	

	//закрываем соединение
	ws.on('close', function() {
		//проходимся по всем коннектам
		for (var i=0; i<peers.length; i++) {
			//если адреса совпадают, то удаляем
			if (peers[i].ws == ws) {
				//console.log("**(?)** INFO:\t\tЗакрыто соединение c клиентом "+peers[i].sh);
				peers.splice(i, 1);
				//console.log("**(?)** INFO:\t\tКоличество клиентов: "+peers.length);
				break;
			}
		}
		//проходимся по всем коннектам игры
		for (var i=0; i<peersInGame.length; i++) {
			//если адреса совпадают, то удаляем
			for (var j=1; j<peersInGame[i].length; j++) {
				if (peersInGame[i][j].ws == ws) {
					//console.log("**(?)** INFO:\t\tЗакрыто соединение c клиентом "+peersInGame[i][j].sh);
					peersInGame[i].splice(j, 1);
					//console.log("**(?)** INFO:\t\tКоличество клиентов: "+peersInGame[i].length);
					break;
				}
			}
		}
	});
	
	/*
		ИЗМЕНЕНИЕ КОМНАТЫ
	*/
	changeRoomGlobal = function changeRoom(_room, _sh, _addSh, _name) {
		//отправляем комнату всем
		for (var i=0; i<peers.length; i++) {
			peers[i].ws.send(JSON.stringify({'type':'updateRoom', 'data':_room}));
			//добавить кнопку удаления для создателя
			if (peers[i].sh == _sh) {
				peers[i].ws.send(JSON.stringify({'type':'canDelRoom', 'data': _room.idr}));
			//добавить кнопку выхода
			} else if (peers[i].sh == _addSh) {
				peers[i].ws.send(JSON.stringify({'type':'canOutRoom', 'data': _room.idr, 'name': _name}));
			}
		}
	}
	
	/*
		ДОБАВЛЕНИЕ КОМНАТЫ
	*/
	addRoomGlobal = function addRoom(_room, _sh, _addSh, _name) {
		//отправляем комнату всем
		for (var i=0; i<peers.length; i++) {
			peers[i].ws.send(JSON.stringify({'type':'addRoom', 'data':_room}));
			//так же создателю комнаты отправляем возможность удалить комнату
			if (peers[i].sh == _sh) {
				peers[i].ws.send(JSON.stringify({'type':'canDelRoom', 'data': _room.idr}));
			//добавить кнопку выхода
			} else if (peers[i].sh == _addSh) {
				peers[i].ws.send(JSON.stringify({'type':'canOutRoom', 'data': _room.idr, 'name': _name}));
			}
		}
	}
	
	/*
		УДАЛЕНИЕ КОМНАТЫ
	*/
	deleteRoomGlobal = function deleteRoom(_idr) {
		for (var i=0; i<peers.length; i++) {
			//отсылаем им idr удаления
			peers[i].ws.send(JSON.stringify({'type': 'deleteRoom', 'data': _idr}));
		}
		console.log("**(?)** INFO:\t\tУдалена комната: "+_idr);
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
			peers[i].ws.send(JSON.stringify({'type': 'deleteRoom', 'data': _room.idr}));
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
			wsToDir[i].send(JSON.stringify({'type': 'redirectToGame', 'data': _room.idr}));
		}
		console.log('**(?)** INFO:\t\tСтарт игровой комнаты '+_room.idr);
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