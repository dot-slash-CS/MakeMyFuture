/** profile.js
 * The client side script for profile.html, handling the signed in
 * status and possible query from the user.
 * 
 * @authors Pirjot Atwal
 */

/**
 * Make a request to the server and return the response.
 * @param {String} route the route to make the call on
 * @param {JSON} body the body to stringify and send, if not supplied then call type is GET
 */
async function makeRequest(route, body = null) {
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

/**
 * 
 * 
 * Credits: https://stackoverflow.com/questions/9554987/how-can-i-hide-the-password-entered-via-a-javascript-dialog-prompt
 * @param {*} text 
 * @returns 
 */
function passwordPrompt(text) {
    /*creates a password-prompt instead of a normal prompt*/
    var width = 200;
    var pwprompt = document.createElement("div"); //creates the div to be used as a prompt
    pwprompt.style.position = "fixed"; //make it fixed as we do not want to move it around
    pwprompt.style.left = ((window.innerWidth / 2) - (width / 2)) + "px"; //let it appear in the middle of the page
    pwprompt.style.top = document.body.children[0].clientHeight + "px"; //Let it appear after the header
    pwprompt.style.border = "1px solid black"; //give it a border
    pwprompt.style.padding = "16px"; //give it some space
    pwprompt.style.background = "white"; //give it some background so its not transparent
    pwprompt.style.zIndex = 99999; //put it above everything else - just in case

    var pwtext = document.createElement("div"); //create the div for the password-text
    pwtext.innerHTML = text; //put inside the text
    pwprompt.appendChild(pwtext); //append the text-div to the password-prompt
    var pwinput = document.createElement("input"); //creates the password-input
    pwinput.type = "password"; // makes the input of type password to not show plain-text
    pwprompt.appendChild(pwinput); //append it to password-prompt
    var pwokbutton = document.createElement("button"); //the ok button
    pwokbutton.innerHTML = "ok";
    var pwcancelb = document.createElement("button"); //the cancel-button
    pwcancelb.innerHTML = "cancel";
    pwprompt.appendChild(pwcancelb); //append cancel-button first
    pwprompt.appendChild(pwokbutton); //append the ok-button
    document.body.appendChild(pwprompt); //append the password-prompt so it gets visible
    pwinput.focus(); //focus on the password-input-field so user does not need to click 

    return new Promise(function (resolve, reject) {
        pwprompt.addEventListener('click', function handleButtonClicks(e) { //lets handle the buttons
            if (e.target.tagName !== 'BUTTON') {
                return;
            } //nothing to do - user clicked somewhere else
            pwprompt.removeEventListener('click', handleButtonClicks); //removes eventhandler on cancel or ok
            if (e.target === pwokbutton) { //click on ok-button
                resolve(pwinput.value); //return the value of the password
            } else {
                reject(new Error('User cancelled')); //return an error
            }
            document.body.removeChild(pwprompt); //as we are done clean up by removing the password-prompt

        });
        pwinput.addEventListener('keyup', function handleEnter(e) { //users dont like to click on buttons
            if (e.keyCode == 13) { //if user enters "enter"-key on password-field
                resolve(pwinput.value); //return password-value
                document.body.removeChild(pwprompt); //clean up by removing the password-prompt
            } else if (e.keyCode == 27) { //user enters "Escape" on password-field
                document.body.removeChild(pwprompt); //clean up the password-prompt
                reject(new Error("User cancelled")); //return an error
            }
        });
    });
}

/**
 * Display the schedules in the schedules grid and setup all
 * buttons and icons to work with dropdowns.
 * @param {Array} schedules 
 * @returns 
 */
async function displaySchedules(schedules) {
    // Display the schedules
    let schedule_grid = document.getElementById("schedule-grid");
    schedule_grid.innerHTML = "";
    if (schedules.length == 0) {
        let message = document.createElement("h3");
        message.textContent = "There are no schedules here yet.";
        message.style.textAlign = "center";
        schedule_grid.appendChild(message);
        return;
    }

    for (let schedule of schedules) {
        let scheduleDiv = document.createElement("div");
        scheduleDiv.classList.add("schedule");

        let scheduleHeader = document.createElement("div");
        scheduleHeader.classList.add("schedule-header");

        //LEFT PORTION
        let scheduleHeaderLeft = document.createElement("div");
        scheduleHeaderLeft.classList.add("schedule-header-left");
        let scheduleName = document.createElement("h4");
        scheduleName.textContent = schedule["NAME"];
        let scheduleMajors = document.createElement("p");
        scheduleMajors.textContent = "Majors: ";
        for (let i = 0; i < schedule["MAJORS"].length; i++) {
            scheduleMajors.textContent += schedule["MAJORS"][i];
            if (i < schedule["MAJORS"].length - 1) {
                scheduleMajors.textContent += ", ";
            }
        }
        let scheduleUniversities = document.createElement("p");
        scheduleUniversities.textContent = "Universities: ";
        for (let i = 0; i < schedule["UNIVERSITIES"].length; i++) {
            scheduleUniversities.textContent += schedule["UNIVERSITIES"][i];
            if (i < schedule["UNIVERSITIES"].length - 1) {
                scheduleUniversities.textContent += ", ";
            }
        }
        scheduleHeaderLeft.append(scheduleName, scheduleMajors, scheduleUniversities);

        //MIDDLE PORTION
        let scheduleDate = document.createElement("h4");
        scheduleDate.textContent = (new Date(schedule["created"])).toDateString();

        //RIGHT PORTION
        let scheduleHeaderRight = document.createElement("div");
        scheduleHeaderRight.classList.add("schedule-header-right");

        let editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("config-button");
        editButton.addEventListener("click", (evt) => {
            location.replace("/builder.html?name=" + schedule["NAME"]);
        });
        let arrowButton = document.createElement("button");
        arrowButton.textContent = "▾";
        arrowButton.classList.add("config-button");
        let arrowDropdown = document.createElement("div");
        arrowDropdown.classList.add("arrow-dropdown");
        let deleteOption = document.createElement("a");
        deleteOption.textContent = "Delete";
        deleteOption.addEventListener("click", async (evt) => {
            if (confirm("Are you sure you want to delete " + schedule["NAME"] + "?\nPress OK if yes, cancel otherwise.")) {
                await makeRequest('/delete-schedule', {
                    "name": schedule["NAME"]
                });
                location.reload();
            }
        });
        arrowDropdown.appendChild(deleteOption);
        let icon = document.createElement("i");
        icon.classList.add("fa", "fa-angle-double-down", "fa-3x");
        arrowButton.addEventListener("click", (evt) => {
            arrowDropdown.style.display = "flex";
        });
        document.addEventListener("click", (evt) => {
            if (evt.target != arrowButton) {
                arrowDropdown.style.display = "none";
            }
        });

        scheduleHeaderRight.append(editButton, arrowButton, arrowDropdown, icon);

        scheduleHeader.append(scheduleHeaderLeft, scheduleDate, scheduleHeaderRight);
        scheduleDiv.append(scheduleHeader);

        let scheduleClassesDropdown = document.createElement("div");
        scheduleClassesDropdown.classList.add("schedule-classes-dropdown");

        for (let semester of schedule["SEMESTERS"]) {
            let semesterHeader = document.createElement("h3");
            semesterHeader.textContent = semester["YEAR"] + " " + semester["SEASON"];

            let contentDiv = document.createElement("div");
            contentDiv.classList.add("schedule-classes-content");

            for (let classACR of semester["CLASSES"]) {
                let classInfo = await makeRequest('/query-data', {
                    query: "CLASS",
                    acr: classACR
                });
                if (classInfo == null) {
                    continue;
                }

                let properties = ["AREA-ACR", "NAME", "UNITS"];
                for (let property of properties) {
                    let newParagraph = document.createElement("p");
                    newParagraph.textContent = classInfo[property];
                    contentDiv.appendChild(newParagraph);
                }
            }

            scheduleClassesDropdown.append(semesterHeader, contentDiv);
        }
        let status = true;
        icon.addEventListener("click", (evt) => {
            if (status) {
                scheduleClassesDropdown.style.height = (scheduleClassesDropdown.scrollHeight + 30) + "px";
                scheduleClassesDropdown.style.padding = "20px";
                scheduleClassesDropdown.style.border = "3px solid black";
                status = !status;
                icon.classList.remove("fa-angle-double-down");
                icon.classList.add("fa-angle-double-up");
            } else {
                scheduleClassesDropdown.style.height = "0px";
                scheduleClassesDropdown.style.padding = "0px";
                scheduleClassesDropdown.style.border = "none";
                status = !status;
                icon.classList.remove("fa-angle-double-up");
                icon.classList.add("fa-angle-double-down");
            }
        });

        scheduleDiv.appendChild(scheduleClassesDropdown);

        schedule_grid.appendChild(scheduleDiv);
    }

}

function configureMyProfile(profile) {
    // Fetch the schedules and the description
    let username = profile["USERNAME"];
    let schedules = profile["SCHEDULES"];
    let description = profile["DESCRIPTION"];

    // Display the username and description
    document.getElementById("username-elem").textContent = username;
    document.getElementById("description-elem").textContent = description;

    // Setup the button clicking interface
    let buttonIDS = ["schedules-button", "profile-button"];
    let divIDS = ["schedule-grid", "profile-settings"];

    // Convert all to elements, display only the first one initially
    let initStyles = [];
    for (let i = 0; i < buttonIDS.length; i++) {
        buttonIDS[i] = document.getElementById(buttonIDS[i]);
        divIDS[i] = document.getElementById(divIDS[i]);
        initStyles.push(divIDS[i].style.display);
        if (i != 0) {
            divIDS[i].style.display = "none";
        }
    }

    for (let i = 0; i < buttonIDS.length; i++) {
        buttonIDS[i].addEventListener("click", (evt) => {
            divIDS[i].style.display = initStyles[i];
            for (let j = 0; j < buttonIDS.length; j++) {
                if (i != j) {
                    divIDS[j].style.display = "none";
                }
            }
        });
    }

    displaySchedules(schedules);

    // Set up the settings and their respective functions
    // TODO: SETUP THE FOLLOWING ON THE SERVER SIDE
    document.getElementById("username-save").addEventListener("click", async (evt) => {
        let username = document.getElementById("username-input").value;
        // Perform request, error checking / complexity checking server side
        let response = await makeRequest('/update-account', {
            type: "USERNAME",
            username: username,
            password: await passwordPrompt("Please provide your account's password for authentication.")
        });
        alert(response["info"]);
    });
    document.getElementById("email-save").addEventListener("click", async (evt) => {
        let email = document.getElementById("email-input").value;
        let response = await makeRequest('/update-account', {
            type: "EMAIL",
            email: email
        });
        alert(response["info"]);
    });
    document.getElementById("description-save").addEventListener("click", async (evt) => {
        let description = document.getElementById("description-input").value;
        let response = await makeRequest('/update-account', {
            type: "DESCRIPTION",
            description: description
        });
        alert(response["info"]);
    });
    document.getElementById("delete-account").addEventListener("click", async (evt) => {
        if (confirm("Are you sure you want to delete your account ?\nPress OK if yes, cancel otherwise.")) {
            let response = await makeRequest('/update-account', {
                type: "DELETE"
            });
            alert(response["info"]);
        }
    });
}

async function configureOtherProfile(profile) {
    // Fetch the schedules and the description
    let username = profile["USERNAME"];
    let schedules = profile["SCHEDULES"];
    let description = profile["DESCRIPTION"];

    // First hide all buttons and tools not accessible to an external user
    let hideIDS = ["profile-button", "profile-settings"];
    for (let id of hideIDS) {
        document.getElementById(id).style.display = "none";
    }

    // Setup the button clicking interface with the remaining tools

    // Display the username and description
    document.getElementById("username-elem").textContent = username;
    document.getElementById("description-elem").textContent = description;

    // Display the schedules
    await displaySchedules(schedules);

    // For each schedule, change the button options to dropdown only.
    let elementsToHide = [].slice.call(document.getElementsByClassName("config-button")).concat([].slice.call(document.getElementsByClassName("arrow-dropdown")));
    for (let elem of elementsToHide) {
        elem.style.display = "none";
    }
}

/**
 * Fetch a user's profile, if it doesn't exist, configure the display accordingly.
 * @param {*} profileName 
 * @returns {JSON}
 */
async function fetchProfile(profileName) {
    let profile = await makeRequest('/fetch-user-profile', {
        username: profileName
    });
    if (profile["exists"] == false) {
        document.getElementById("profile-area").style.display = "none";
        document.getElementById("profile-error").style.display = "block";
        return;
    }
    return profile;
}

/**
 * The main profile func, to be executed asynchronously by the
 * sign in queue.
 */
async function main_profile_func() {
    // First check the query to determine whose profile is being displayed, and if someone is viewing their own profile
    let profileName = "";
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if (Object.keys(params).includes("name")) {
        profileName = params["name"];
    } else if (isSignedIn) {
        profileName = username;
    } else {
        document.getElementById("profile-area").style.display = "none";
        document.getElementById("profile-error").style.display = "block";
        return;
    }

    let profile = await fetchProfile(profileName);

    if (isSignedIn && username == profileName) {
        // Display the user's own profile, allowing them specific access to their account's settings
        // Configure the display
        configureMyProfile(profile);
    } else if (profile["exists"] != false) {
        // Display the named user's profile only, ignoring all personal divs
        // Configure the display
        configureOtherProfile(profile);
    }

    console.log("The Profile Page has been successfully initialized.");
}

document.addEventListener("DOMContentLoaded", (evt) => {
    queue.push(main_profile_func);
});