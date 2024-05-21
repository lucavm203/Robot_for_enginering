const socket = new WebSocket("ws://145.49.127.249:1880/ws/aaad1")
socket.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);
    let datajson = JSON.parse(event.data);
    let objects = document.querySelector(".cube");
    objects.style.transform = "rotateX("+datajson.xas_helling+"deg)" +"rotateY("+datajson.yas_helling+"deg)" + "rotateZ("+datajson.zas_helling+"deg)";
    let location = document.querySelector("#datavanlocate");
    let xyz = document.querySelector("#datavanxyz");
    location.innerHTML = "Je locatie is nu op X " +datajson.xas_locatie+ " en Y "+ datajson.yas_locatie;
    xyz.innerHTML = "Je Helligns is nu op X " +datajson.xas_helling+ " en Y "+ datajson.yas_helling + " en Z "+ datajson.zas_helling;

    console.log(objects);
  });