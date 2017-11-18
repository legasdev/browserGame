var express = require("express");
var bodyParser = require("body-parser");
var mongoClient = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var md5 = require("./md5");

// подключенные клиенты
var clients = {};
var players = {};
var rooms = {}; //игровые комнаты

players[0] = {};
players[1] = {};
//типо игрок с бд
players[1].name = "legasdev";
players[1].id = 1;

players[0].name = "wikend";
players[0].id = 2;

rooms[0] = {};
rooms[1] = {};
rooms[2] = {};
//типо комната создана
rooms[1].idr = "1";
rooms[1].maxPlayers = 1;
rooms[1].players = {};
rooms[1].players[1] = players[1];
rooms[1].isPlay = true;
rooms[1].whoPlay = 1;

rooms[2].idr = 2;
rooms[2].maxPlayers = 1;
rooms[2].players = {};
rooms[2].players[1] = players[0];
rooms[2].isplay = false;
rooms[2].whoPlay = 1;

//* Смотрим БД *//
var app = express();
var jsonParser = bodyParser.json();
var url = "mongodb://localhost:27017/usersdb";
 
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
	var nowData = new Date();
	nowData /= 1000;
    var userLogin = req.body.login;
    var userPass = req.body.pass;
    var user = {login: userLogin, pass: userPass, sh: md5(userLogin+nowData.toString())};
	
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

//веб сервер
var WebSocketServer = new require('ws');

//игровая карта
var map = {};
map.l = 0;
map.r = 1000;
map.t = 0;
map.b = 1000;
var startMass = 30;

// WebSocket-сервер на порту 443
var webSocketServer = new WebSocketServer.Server({
  port: 443
});

webSocketServer.on('connection', function(ws) {
  	//var id = Math.random(); //присваиваем id
  	//clients[id] = ws;
	//заносим данные об игроке и ставим его в 0, 0
	//players[id] = {};
	//players[id].x = rand(map.l, map.r);
	//players[id].y = rand(map.t, map.b);
	//players[id].s = startMass;
	
	ws.send(JSON.stringify({'type':'map', 'data':map}));
	
	/*//посылаем данные клиентам
	var interval = setInterval(function() {
		if (ws && ws.readyState == 1) {
			ws.send(JSON.stringify({'type':'players', 'data':players, 'myid':id}));
		}
	}, 10);*/

	//получаем данные
	ws.on('message', function(message) {
		try {var m = JSON.parse(message);} catch(e){return;}
		switch (m['type']) {
			//получаем номер сессии и получаем доступ к ней
			case 'idr':
				echos(m['data']); //отвечаем
				break;
		}
	 });

	//закрываем моединение
	ws.on('close', function() {
		delete clients[id];
		delete players[id];
		clearInterval(interval);
	});
	
	/* 
		Функция ответчик комнаты и соединения
	*/
	function echos(idr) {
		//отправляем данные (комнату)
		if (ws && ws.readyState == 1) {
			ws.send(JSON.stringify({'type':'idr', 'data':rooms[idr]}));
		}
	}
});

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	