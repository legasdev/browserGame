function move(arrow,target,duration=1){
	var a=$("#"+rand(1,40).toString()).position();
	$(arrow).animate({left: a.left, top: a.top},duration*1000);
}
// использование Math.round() даст неравномерное распределение!
function rand(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
