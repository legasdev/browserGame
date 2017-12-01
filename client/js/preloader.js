console.log($("div.test3").offset());
console.log($("div.test4").offset());
var test3=document.getElementsByClassName('test3')[0];
var test4=document.getElementsByClassName('test4')[0];
test3.style.left=$("div.test4").offset().left+"px";
test3.style.top=$("div.test4").offset().top+"px";
console.log($("div.test3").offset());