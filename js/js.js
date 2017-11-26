
function getCookie(name) {
	var matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie(name, value, options) {
	options = options || {};

	var expires = options.expires;

	if (typeof expires == "number" && expires) {
		var d = new Date();
		d.setTime(d.getTime() + expires * 1000);
		expires = options.expires = d;
	}
	if (expires && expires.toUTCString) {
		options.expires = expires.toUTCString();
	}

	value = encodeURIComponent(value);

	var updatedCookie = name + "=" + value;

	for (var propName in options) {
		updatedCookie += "; " + propName;
		var propValue = options[propName];
		if (propValue !== true) {
			updatedCookie += "=" + propValue;
		}
	}

	document.cookie = updatedCookie;
}
function clearCookie(){
	setCookie('id', "", {
		expires: -1
	})
	setCookie('hash', "", {
		expires: -1
	})
	
}
function userAutorization(){
	var logbtn=document.getElementsByClassName('loginButton')[0];
	var regbtn=document.getElementsByClassName('loginButton')[1];
	var extbtn=document.getElementById('exitForm');
	if(getCookie('id') !=undefined){
		logbtn.style.display="none";
		regbtn.style.display="none";
		extbtn.style.display="block";
	}else{
		logbtn.style.display="block";
		regbtn.style.display="block";
		extbtn.style.display="none";
	}
}
function regFormOn(){
	var logbt=document.getElementsByClassName('loginButton')[0];
	var regbt=document.getElementsByClassName('loginButton')[1];
	var modalRe=document.getElementsByClassName('modalReg')[0];
	modalRe.style.left= '69%';
	logbt.style.color='#1D1F21';
	logbt.style.border='0px';
	regbt.style.color='#1D1F21';
	regbt.style.border='0px';
}
function backFunc(){
	var logbt=document.getElementsByClassName('loginButton')[0];
	var regbt=document.getElementsByClassName('loginButton')[1];
	var modalRe=document.getElementsByClassName('modalReg')[0];
	modalRe.style.left= '150%';
	logbt.style.color='#F2F2F2';
	logbt.style.border='1px solid #fff';
	regbt.style.color='#F2F2F2';
	regbt.style.border='1px solid #fff';
	
}

