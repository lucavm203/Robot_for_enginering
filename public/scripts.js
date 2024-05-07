let stops = document.querySelector("#stop");
stops.addEventListener("click",  function(e){
    e.stopPropagation();
    var stop = document.getElementById("stop");
    var start = document.getElementById("start");
    start.classList.remove("disabled");
    stop.classList.add("disabled");
});
let starts = document.querySelector("#start");
starts.addEventListener("click", function(e){
    e.stopPropagation();
    var stop = document.getElementById("stop");
    var start = document.getElementById("start");
    stop.classList.remove("disabled");
    start.classList.add("disabled");
   
});