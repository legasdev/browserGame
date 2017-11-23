window.onload = (function(){
	$('.field').css('height', window.innerHeight);
	scale();
});

function scale(){
	var heightScreen=window.innerHeight;
	var heightNow = $('.field').height;
	var widthScreen = $(window).innerWidth;
	$('.field').css('transform', 'scale('+heightScreen/heightNow+')');
	//$('.field').css('height', heightScreen);
	//$('.field').css('width', widthScreen);
}

$(window).resize(function() {
	scale();
})
