/** signup.js
 * The client side script to set up the sign up page and its exchange
 * with the server.
 * 
 * @authors Pirjot Atwal
 * @file signup.js
 */

async function makeRequest(route, body=null) {
    let method = 'POST';
    if (body == null) {
        method = 'GET';
    }
    let options = {
        'method': method,
        headers: {
            'Content-Type': "application/json"
        },
        'body': JSON.stringify(body)
    };
    let res = await (await fetch(route, options)).json();
    return res;
}

function setMessage(message="") {
    document.getElementById("message").textContent = message;
}

function attachButtonScript() {
    document.getElementById("create").addEventListener("click", async (evt) => {
        evt.preventDefault();
        // Fetch information
        let username = document.getElementById("user").value;
        let password = document.getElementById("pass").value;
        let confirm = document.getElementById("confirm").value;
        let email = document.getElementById("email").value;

        // TODO: Include More Complexity Requirements
        if (username == "" || password == "" || confirm == "" || email ==  "") {
            setMessage("All fields must be filled.");
        } else if (password != confirm) {
            setMessage("The passwords do not match.");
        } else if (!email.includes(".") || !email.includes("@")) {
            setMessage("Please provide a valid email.");
        } else if (username.length < 5 || password.length < 6) {
            setMessage("Username > 5, Password > 6.");
        } else {
            setMessage("Attempting to create account...");
        }
        
        let createResponse = await makeRequest('/sign-up', {'username': username, 'password': password, 'email': email});
        if (!createResponse.account_created) {
            setMessage("An error occurred: " + createResponse.info);
        } else {
            setMessage("Your account has been created!");
        }
    });
}

document.addEventListener("DOMContentLoaded", (evt) => {
    attachButtonScript();
});