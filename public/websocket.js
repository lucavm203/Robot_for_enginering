const socket = new WebSocket("ws://145.49.113.123:1880/ws/test")
socket.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);
    let datajson = JSON.parse(event.data);
    let objects = document.querySelector(".cube");
    objects.style.transform = "rotateX("+datajson.XYZ.X+"deg)" +"rotateY("+datajson.XYZ.Y+"deg)" + "rotateZ("+datajson.XYZ.Z+"deg)";
    let location = document.querySelector("#datavanlocate");
    let xyz = document.querySelector("#datavanxyz");
    location.innerHTML = "Je locatie is nu op X " +datajson.Locatie.PositieX+ " en Y "+ datajson.Locatie.PositieY;
    xyz.innerHTML = "Je Helligns is nu op X " +datajson.XYZ.X+ " en Y "+ datajson.XYZ.Y + " en Z "+ datajson.XYZ.Z;

    console.log(objects);
  });