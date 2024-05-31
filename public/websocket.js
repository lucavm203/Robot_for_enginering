const socket = new WebSocket("ws://localhost:8080")
socket.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);
    let datajson = JSON.parse(event.data);
    let objects = document.querySelector(".cube");
    objects.style.transform = "rotateX("+datajson.xas_helling+"deg)" +"rotateY("+datajson.yas_helling+"deg)" + "rotateZ("+datajson.zas_helling+"deg)";
    let location = document.querySelector("#datavanlocate");
    let xyz = document.querySelector("#datavanxyz");
    location.innerHTML = "Je locatie is nu op X " +datajson.xas_locatie+ " en Y "+ datajson.yas_locatie;
    xyz.innerHTML = "Je Helligns is nu op X " +datajson.xas_helling+ " en Y "+ datajson.yas_helling + " en Z "+ datajson.zas_helling;
    if(datajson.xas_helling < -22){
      alert("hoek van X is onder de -22 graden")
    }else if(datajson.xas_helling > 22){
      alert("hoek van X is boven de 22 graden")
    }else if(datajson.yas_helling < -22){
      alert("hoek van Y is onder de -22 graden")
    }else if(datajson.yas_helling > 22){
      alert("hoek van Y is boven de 22 graden")
    }else if(datajson.zas_helling < -22){
      alert("hoek van Z is onder de -22 graden")
    }else if(datajson.zas_helling > 22){
      alert("hoek van Z is boven de 22 graden")
    }
    console.log(objects);
  });