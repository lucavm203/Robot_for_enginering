

const form = document.querySelector("#form");
const startstops = "stop"
form.addEventListener("submit", function (e) {
    e.preventDefault();

    var formData = new FormData(form);
    // output as an object
    console.log(Object.fromEntries(formData));
    if (e.submitter && e.submitter.getAttribute("name")) {
        formData.append(e.submitter.getAttribute("name"), e.submitter.getAttribute("value"));
        }
    // ...or iterate through the name-value pairs
    console.log(Object.fromEntries(formData));
    var stop = document.getElementById("stop");
    var start = document.getElementById("start");
    if(formData.has("start")){
        stop.classList.remove("disabled");
        start.classList.add("disabled");
    }else if(formData.has("stop")){
        start.classList.remove("disabled");
        stop.classList.add("disabled");
    }

    var body = JSON.stringify(Object.fromEntries(formData))
    fetch("/post", {
        method: "POST", 
        headers: {
        'Content-Type': 'application/json'
        },
        body: body
    }).then(response => {
        // this line of code depends upon what type of response you're expecting
        return response.text();     
    }).then(result => {
        console.log(result);
    }).catch(err => {
        console.log(err);
    });
});