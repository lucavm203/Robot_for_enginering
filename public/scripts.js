const form = document.querySelector("#form");
form.addEventListener("submit", function (e) {
    e.preventDefault();

    var formData = new FormData(form);
    // output as an object
    console.log(Object.fromEntries(formData));
    if (e.submitter && e.submitter.getAttribute("name")) {
        formData.append(e.submitter.getAttribute("name"), e.submitter.getAttribute("value"));
        }
    console.log(Object.fromEntries(formData));
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