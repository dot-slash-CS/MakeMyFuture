/** signup.js
 * The client side script to set up the sign up page and its exchange
 * with the server.
 * 
 * @authors Pirjot Atwal
 * @file signup.js
 */

/**
 * Make a request to the server with a certain route and body
 * if needed and return the response asynchronously.
 * @param {String} route 
 * @param {JSON} body 
 * @returns {JSON} Some JSON object or array.
 */
async function makeRequest(route, body=null) {
    let options = {
        method: 'GET',
        headers: {
            'Content-Type': "application/json"
        },
    };
    if (body != null) {
        options.method = 'POST';
        options.body = JSON.stringify(body)
    }
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
            return;
        } else if (password != confirm) {
            setMessage("The passwords do not match.");
            return;
        } else {
            setMessage("Attempting to create account...");
        }
        
        let createResponse = await makeRequest('/sign-up', {'username': username, 'password': password, 'email': email});
        if (!createResponse.account_created) {
            setMessage("An error occurred: " + createResponse.info);
        } else {
            setMessage("Your account has been created!");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        }
    });
}

document.addEventListener("DOMContentLoaded", (evt) => {
    attachButtonScript();
});