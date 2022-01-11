/** login.js
 * The client side script for setting up the login.html page.
 * 
 * @authors Pirjot Atwal
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
    document.getElementById("login").addEventListener("click", async (evt) => {
        evt.preventDefault();

        // Fetch information
        let username = document.getElementById("user").value;
        let password = document.getElementById("pass").value;

        let loginResponse = await makeRequest('/login', {'username': username, 'password': password});
        if (!loginResponse.loggedIn) {
            setMessage("Login failed: " + loginResponse.info);
        } else {
            setMessage("You were successfully logged in.");
            localStorage.setItem('session_id', loginResponse.session_id);
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        }
    });
}

document.addEventListener("DOMContentLoaded", (evt) => {
    attachButtonScript();
});
