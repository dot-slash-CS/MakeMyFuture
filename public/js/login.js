/** login.js
 * The client side script for setting up the login.html page.
 * 
 * @authors Pirjot Atwal
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
        }
    });
}

document.addEventListener("DOMContentLoaded", (evt) => {
    attachButtonScript();
});
