
window.onload = function () {
	$('.field').css('height', window.innerHeight);
	scale();
}

function scale() {
	var heightScreen = window.innerHeight;
	var heightNow = $('.field').height;
	var widthScreen = $(window).innerWidth;
	$('.field').css('transform', 'scale(' + heightScreen / heightNow + ')');
	//$('.field').css('height', heightScreen);
	//$('.field').css('width', widthScreen);
}

$(window).resize(function () {
	scale();
})
function move(){
	//создаём каждой фишке аватар
	var emptyPlayers=[];
	var players=document.getElementsByClassName('pl');
	console.log(players.length);
	for(var i=0;i<players.length;i++){
//		players[i].style.width=players[i].style.height;
		emptyPlayers[i]=players[i].cloneNode(false);
		emptyPlayers[i].classList.add('avatar');
		emptyPlayers[i].classList.remove('pl');
		emptyPlayers[i].style.position="absolute";
		emptyPlayers[i].style.width="3px";
		emptyPlayers[i].style.height="3px";
		emptyPlayers[i].style.display="block";
		emptyPlayers[i].style.border="1px solid #000";
//		emptyPlayers[i].style.left=0;
//		emptyPlayers[i].style.bottom=0;
		
	}
	var avatar=document.getElementsByClassName('avatar');
	for(var i=0;i<emptyPlayers.length;i++){
		emptyPlayers[i].style.left=30+players[i].offsetLeft+"px";
		emptyPlayers[i].style.top=300+players[i].offsetTop+"px";
		console.log(emptyPlayers[i].style.left+" : "+	emptyPlayers[i].style.top);
		console.log(emptyPlayers[i]);
		//		console.log(emptyPlayers[i].style.left+" : "+emptyPlayers[i].style.bottom);
	}
//	console.log(emptyPlayers);
	document.body.appendChild(emptyPlayers[0]);
	document.body.appendChild(emptyPlayers[1]);
	document.body.appendChild(emptyPlayers[2]);
	document.body.appendChild(emptyPlayers[3]);
	document.body.appendChild(emptyPlayers[4]);
	document.body.appendChild(emptyPlayers[5]);
	document.body.appendChild(emptyPlayers[6]);
	document.body.appendChild(emptyPlayers[7]);
	//координаты аватаров
	var l=[];
	var t=[];
	var r=[];
	var b=[];
//	console.log(players.length);
	
//	console.log(emptyPlayers[1]);
console.log(players[0].getBoundingClientRect());
}
move();
//
//var hod = "pl1";
//var Kubik = 2;
//
//
//
//
//function movePlayer(hodd, Kubikk) {
//	var howMove = hodd;
//	var move, i, j, indexPlayer, buttonWhitPlayers, elem;
//	var player = document.getElementById(howMove);
//	var masCelss = document.getElementsByClassName('celss');
//	//Находим в какой кнопке лежит фишка
//	for (j = 0; j < masCelss.length; j++) {
//		elem = masCelss[j].getElementsByTagName('*');
//		for (i = 0; i < elem.length; i++) {
//			if (elem[i].id == howMove) {
//				move = j; //нашли номер кнопки
//				buttonWhitPlayers = masCelss[j]; //Выбираем найденную кнопку
//				break;
//			}
//		}
//	}
//	//Ищем новую кнопку
//	var numNextButton = +buttonWhitPlayers.id + Kubik; //Номер новой кнопки
//	console.log("НОМЕР СТАРОЙ КНОПКИ "+buttonWhitPlayers.id);
//	console.log("НОМЕР НОВОЙ КНОПКИ "+numNextButton);
//	var nextButton = document.getElementById(numNextButton); //Вот она
//	var tempButton = player;
//	console.log(tempButton);
//	nextButton.appendChild(tempButton); //Создаём там такой же элемент
//	//Находим координаты относительно окна
//	var xNext = nextButton.appendChild(tempButton).getBoundingClientRect().left;
//	console.log("Х НОВОЙ КНОПКИ "+xNext);
//	var yNext = nextButton.appendChild(tempButton).getBoundingClientRect().top;
//	console.log("Y НОВОЙ КНОПКИ "+yNext);
//	var widthNextButton = nextButton.appendChild(tempButton).getBoundingClientRect().right - nextButton.appendChild(tempButton).getBoundingClientRect().left;
//	console.log("ШИРИНА ВРЕМЕНОЙ ФИШКИ "+widthNextButton);
//	var heightNextButton = nextButton.appendChild(tempButton).getBoundingClientRect().bottom - nextButton.appendChild(tempButton).getBoundingClientRect().top;
//	console.log("ВЫСОТА ВРЕМЕНОЙ ФИШКИ "+heightNextButton);
//	//Создадим следующий невидимый элемент
//	var tempNextElem = player.cloneNode(true);
////	tempNextElem.style.opacity=0;
//	buttonWhitPlayers.appendChild(player);
//	//Находим координаты фишки
//	var xPrep = player.getBoundingClientRect().left;
//	var yPrep = player.getBoundingClientRect().top;
//	var widthPlayer = player.getBoundingClientRect().right - player.getBoundingClientRect().left; //ширина исходной фишки
//	var heightPlayer = player.getBoundingClientRect().bottom - player.getBoundingClientRect().top; //высота исходной фишки
//	console.log(widthPlayer + " : " + heightPlayer);
//	//создаём новую фишку над старой
//	var tempElem = player.cloneNode(true);
//	document.body.appendChild(tempElem);
//	tempElem.classList.add("temp");
//	tempElem.style.opacity = 1;
//	tempElem.style.zIndex = 1;
//	tempElem.style.position = "absolute";
//	tempElem.style.top = yPrep + "px";
//	tempElem.style.left = xPrep + "px";
//	tempElem.style.width = widthPlayer + "px";
//	tempElem.style.height = widthPlayer + "px";
//	tempElem.style.border = "1px solid #000";
//	tempElem.style.borderRadius = 100 + "%";
//	console.log(tempElem.style.opacity + " : " + tempElem.style.zIndex + " : " + tempElem.style.position + " : " + tempElem.style.top + " : " + tempElem.style.left + " : " + tempElem.style.width);
//	//удаляем фищку под новой
//	buttonWhitPlayers.removeChild(player); //потом можно opacity=0 и уменьшать радиус чтобы остальные фишки двигались плавно
//	//Добавляем в следующую кнопку невидимую фишку игрока
//	nextButton.appendChild(player);
//	nextButton.style.opacity = 0;
//	player.style.width = player.style.height;
//	//двигаем в следующую кнопку
//	setTimeout(function () {
//			tempElem.style.top =yNext+ "px";
//			tempElem.style.left =xNext+ "px";
//			tempElem.style.width=widthNextButton + "px";
//			tempElem.style.height=widthNextButton+ "px";
//	}, 50)
//	setTimeout(function () {
//		tempElem.style.opacity = 1;
//		nextButton.style.opacity = 1;
//	}, 1000)
//	setTimeout(function () {
//		document.getElementsByClassName('temp')[0].remove();
//		console.log( document.body.childNodes);
//	}, 1100)
//}
//movePlayer(hod, Kubik);
//setTimeout(function(){
//	hod="pl3";
//	Kubik=10;
//	movePlayer(hod, Kubik);
//},2000)
//setTimeout(function(){
//	hod="pl4";
//	Kubik=11;
//	movePlayer(hod, Kubik);
//},3000)
//setTimeout(function(){
//	hod="pl5";
//	Kubik=10;
//	movePlayer(hod, Kubik);
//},4000)
//setTimeout(function(){
//	hod="pl6";
//	Kubik=10;
//	movePlayer(hod, Kubik);
//},5000)
//setTimeout(function(){
//	hod="pl7";
//	Kubik=10;
//	movePlayer(hod, Kubik);
//},6000)
//setTimeout(function(){
//	hod="pl8";
//	Kubik=12;
//	movePlayer(hod, Kubik);
//},7000)
//setTimeout(function(){
//	hod="pl2";
//	Kubik=7;
//	movePlayer(hod, Kubik);
//},8000)
//
