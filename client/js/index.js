console.log('asd');
function blur(){

	var header=document.getElementsByClassName('header')[0];
	var modal=document.getElementsByClassName('modal')[0];
	var modalBlur=document.getElementsByClassName('modal-blur')[0];
	console.log('asd');
	setTimeout(function(){
		header.style.filter="blur(5px)";
		console.log(header.style.filter);
		modal.style.left="70%";
		console.log(modal.style.left);
		modalBlur.style.display="block";
		modalBlur.style.opacity=1;
		console.log(modalBlur.style.opacity);
	},1);
}