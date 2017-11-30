function move(arrow,target,duration=1){
	var a=$("#"+rand(1,40).toString()).position();
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
	var heightWindow = window.screen.height;
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