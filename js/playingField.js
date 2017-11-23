//var numPlayers=prompt("Сколько игроков? ",1);
//var temp1=document.getElementsByClassName('celss1')[0];
//var temp2=document.getElementsByClassName('celss2')[0];
//var p1=document.getElementById('p1');
//temp1.removeChild(p1);
//temp2.appendChild(p1);
window.onload=function(){


var numCube=1;
var hM="p1";
function movePlayer(hMove,numCube){
	
	var howMove=hMove;
	var numMove;
	var masCelss=document.getElementsByClassName('celss');
	var move,i,j,indexPlayer;
	alert("howMove");
	for(j=0;j<masCelss.length;j++){
		var elem=masCelss[j].getElementsByTagName('*');
		for(i=0;i<elem.length;i++){
			alert(elem[i].id);
			if(elem[i].id==hMove){
				move=j;
				indexPlayer=i;
				break;
			}
		}
	};
	numMove=move+numCube;
	scroll(masCelss[move].getElementsByTagName('*')[indexPlayer].id,masCelss[numMove]);
	alert('asd');
	movePlayer(move,numCube,masCelss[move].getElementsByTagName('*')[indexPlayer].id);
}
//function movePlayer(numElem,numCube,playerId){
//	var numMove=numElem+numCube;
//	var id=playerId;
//	var firstElem=document.getElementsByClassName('celss')[numElem];
//	var nextElem=document.getElementsByClassName('celss')[numMove];
//	var player=document.getElementById(id);
////	nextElem.appendChild(player);
////	firstElem.removeChild(player);
//	
//}
//movePlayer(hM,numCube);
	

//	jQuery(document).ready(function(){
//	jQuery('button').click(function() {
//		jQuery.scrollTo('#target-el');
//	});
//});'
	console.log(document.getElementById("7").getBoundingClientRect());

}

