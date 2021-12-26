/** signed_in.js
 * Code to execute at the start of every page that
 * requires account authentication, checking
 * if a user is signed in. Make sure to load
 * this script FIRST.
 * 
 * @authors Pirjot Atwal
 * @file signed_in.js
 */

let isSignedIn = false;
let username = null;
let queue = [];

async function checkSignedIn() {
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    };
    let response = await fetch('/verify-session', options);
    let parsed = await response.json(); //{isSignedIn: false, username: null, data: null};
    isSignedIn = parsed.isSignedIn;
    username = parsed.username;

    for (func of queue) {
        func();
    }
}

/**
 * Header scripts that apply to all pages with a header.
 */
function setHeaderInformation() {
    // Display or Hide the Signup/Login/Welcome Buttons
    if (isSignedIn) {
        for (let span of document.getElementsByClassName("username_span")) {
            span.textContent = username;
        }
        document.getElementById("signup_button").style.display = "none";
        document.getElementById("login_button").textContent = "Log Out";
        document.getElementById("login_button").href = "";
        document.getElementById("login_button").addEventListener("click", async (evt) => {
            // Logout Request
            evt.preventDefault();
            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            };
            let response = await fetch('/logout', options);
            window.location.reload();
        });
    } else {
        document.getElementById("welcome_button").style.display = "none";
    }
}

queue.push(setHeaderInformation);

document.addEventListener("DOMContentLoaded", checkSignedIn);