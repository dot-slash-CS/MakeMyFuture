/** builder_entry.js
 * The client side script for builder_entry.html, handling the user's communication
 * for their various schedules and the creation of new schedules with the server.
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

/**
 * Handle Displayed elements depending on signed in status.
 */
function handle_display() {
    if (isSignedIn) {
        document.getElementById("not_signed_in_message").style.display = "none";
    } else {
        document.getElementById("menu_area").style.display = "none";
        document.getElementById("create_schedule_form").style.display = "none";
    }
}

function editScheduleScript(evt) {
    evt.preventDefault();
    console.log("Attempting Edit on Schedule named " + evt.target.schedule);
    location.replace("/builder.html?name=" + evt.target.schedule);
}

async function deleteScheduleScript(evt) {
    evt.preventDefault();
    if (confirm("Are you sure you want to delete " + evt.target.schedule + "?\nPress OK if yes, cancel otherwise.")) {
        await makeRequest('/delete-schedule', {"name": evt.target.schedule});
        location.reload();
    }
}

async function displaySchedules() {
    // Retrieve the user's schedules from the server
    let user_schedules = (await makeRequest('/get-user-schedules')).data;
    if (user_schedules.length == 0) {
        document.getElementById("schedule_grid").style.display = "none";
    } else {
        document.getElementById("no_schedule_message").style.display = "none";
        
        let grid = document.getElementById("schedule_grid");
        // Clear the current grid
        grid.innerHTML = "";
        // Fill grid with schedule information
        for (let schedule of user_schedules) {
            let item_div = document.createElement("div");
            item_div.classList.add("schedule_item");
            
            let fields_div = document.createElement("div");
            fields_div.classList.add("schedule_fields");
            
            let information = ["Majors: " + schedule["MAJORS"][0], "Universities: " + schedule["UNIVERSITIES"][0], "Name: " + schedule["NAME"]];
            for (let info of information) {
                let new_field = document.createElement("p");
                new_field.textContent = info;
                fields_div.appendChild(new_field);
            }

            let new_button = document.createElement("button");
            new_button.schedule = schedule["NAME"];
            new_button.textContent = "Edit this Schedule";
            new_button.addEventListener("click", editScheduleScript);

            let new_button2 = document.createElement("button");
            new_button2.schedule = schedule["NAME"];
            new_button2.textContent = "Delete this Schedule";
            new_button2.addEventListener("click", deleteScheduleScript);

            item_div.appendChild(fields_div);
            item_div.appendChild(new_button);
            item_div.appendChild(document.createElement("br"));
            item_div.appendChild(new_button2);
            grid.appendChild(item_div);
        }

    }
    // TODO: Add simple helper funciton to edit buttons
}

function attachCreateScript() {
    document.getElementById("schedule_create").addEventListener("click", async (evt) => {
        evt.preventDefault();
        //TODO: Extra checks for input (from a selected list of majors and universities in a checkbox input with search menu)
        //TODO: Ensure all names for schedules are unique
        let majors = [document.getElementById("major_input").value];
        let universities = [document.getElementById("university_input").value];
        let name = document.getElementById("name_input").value;
        console.log(name);
        // Create a new template schedule, Refresh the Page
        await makeRequest("/create-schedule", {majors, universities, name});
        location.reload();
    });
}

/**
 * A function to wrap builder entry functions in
 * this file to be executed only if the signed in
 * status is on. Guarantees that the user is signed
 * in for certain functions (for convenience).
 */
async function builderEntryWrap() {
    handle_display();
    if (isSignedIn) {
        await displaySchedules();
        attachCreateScript();
    }
}

// Add the builder entry scripts to the signed in queue.
document.addEventListener("DOMContentLoaded", (evt) => {queue.push(builderEntryWrap);});