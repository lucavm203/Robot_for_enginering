const socket = new WebSocket("ws://145.49.127.249:1880/ws/aaad1")
const popupX = "nee";
const popupY = "nee";
const popupZ = "nee";
socket.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);
    let datajson = JSON.parse(event.data);
    let objects = document.querySelector(".cube");
    objects.style.transform = "rotateX("+datajson.xas_helling+"deg)" +"rotateY("+datajson.yas_helling+"deg)" + "rotateZ("+datajson.zas_helling+"deg)";
    let location = document.querySelector("#datavanlocate");
    let xyz = document.querySelector("#datavanxyz");
    location.innerHTML = "Je locatie is nu op X " +datajson.xas_locatie+ " en Y "+ datajson.yas_locatie;
    xyz.innerHTML = "Je Hellingshoek is nu op X " +datajson.xas_helling+ " graden en Y "+ datajson.yas_helling + " graden en Z "+ datajson.zas_helling +" graden";
    var PopupX = document.getElementById("myPopupX");
    var PopupY = document.getElementById("myPopupY");
    var PopupZ = document.getElementById("myPopupZ");

    if(popupX == "ja" ){
      PopupX.classList.toggle("show")
    }
    if(popupY == "ja" ){
      PopupY.classList.toggle("show")
    }
    if(popupZ == "ja" ){
      PopupZ.classList.toggle("show")
    }
    


    if(datajson.xas_helling < -22){
      PopupX.innerHTML = "hoek van X is onder de -22 graden"
      PopupX.classList.toggle("show")
      popupX = "ja";
    }else if(datajson.xas_helling > 22){
      PopupX.innerHTML = "hoek van X is boven de 22 graden"
      PopupX.classList.toggle("show")
      popupX = "ja";
    }
    if(datajson.yas_helling < -22){
      PopupY.innerHTML = "hoek van Y is onder de -22 graden"
      PopupY.classList.toggle("show")
      popupY = "ja";
    }else if(datajson.yas_helling > 22){
      PopupY.innerHTML = "hoek van Y is boven de 22 graden"
      PopupY.classList.toggle("show")
      popupY = "ja";
    }
    if(datajson.Zas_helling < -22){
      PopupZ.innerHTML = "hoek van Z is onder de -22 graden"
      PopupZ.classList.toggle("show")
      popupZ = "ja";
    }else if(datajson.zas_helling > 22){
      PopupZ.innerHTML = "hoek van Z is boven de 22 graden"
      PopupZ.classList.toggle("show")
      popupZ = "ja";
    }
 
    console.log(objects);
  });