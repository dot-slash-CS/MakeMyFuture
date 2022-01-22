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
        document.getElementById("creation-menu").style.display = "none";
        document.getElementById("menu_area").style.display = "none";
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
        document.getElementById("schedule-grid").style.display = "none";
    } else {
        document.getElementById("no_schedule_message").style.display = "none";
        
        let grid = document.getElementById("schedule-grid");
        // Clear the current grid
        grid.innerHTML = "";
        // Fill grid with schedule information
        for (let schedule of user_schedules) {
            let item_div = document.createElement("div");
            item_div.classList.add("schedule-item");

            let fields_div = document.createElement("div");
            fields_div.classList.add("schedule-fields");

            /**
             * Builds and appends a new schedule field element
             * to the fields_div using the data from a schedule.
             * @param {*} title 
             * @param {*} items 
             */
            function appendNewScheduleField(title, items) {
                let new_field = document.createElement("div");
                new_field.classList.add("schedule-field");

                let title_par = document.createElement("p");
                title_par.textContent = title;

                let new_expandable = document.createElement("div");
                new_expandable.classList.add("schedule-field-exp");

                // Assume that the array has atleast one element
                let first_elem = document.createElement("p");
                first_elem.textContent = items[0];

                let see_more = document.createElement("a");
                see_more.textContent = "Click to see more";

                new_expandable.appendChild(first_elem);
                new_expandable.appendChild(see_more);

                see_more.addEventListener("click", (evt) => {
                    // Clear the expandable, fill it with all of the items
                    new_expandable.innerHTML = "";
                    for (let item of items) {
                        let item_par = document.createElement("p");
                        item_par.textContent = item;

                        new_expandable.appendChild(item_par);
                    }
                });

                new_field.appendChild(title_par);
                new_field.appendChild(new_expandable);
                fields_div.appendChild(new_field);
            }

            appendNewScheduleField("Major(s): ", schedule["MAJORS"]);
            appendNewScheduleField("University(ies): ", schedule["UNIVERSITIES"]);

            // Add the name
            let new_field = document.createElement("div");
            new_field.classList.add("schedule-field");
            let name_title = document.createElement("p");
            name_title.textContent = "Name: ";
            let name_value = document.createElement("p");
            name_value.textContent = schedule["NAME"];
            new_field.appendChild(name_title);
            new_field.appendChild(name_value);
            fields_div.appendChild(new_field);

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
}

function initializeChecks(data, formDIV) {
    formDIV = document.getElementById(formDIV);
    // Clear the Form first
    formDIV.innerHTML = "";
    
    // Fill the form with all checkboxes
    for (let key of Object.keys(data)) {
        for (let elem of data[key]) {
            let newCheckbox = document.createElement("input");
            newCheckbox.type = "checkbox";
            newCheckbox.value = elem;
            newCheckbox.category = key;

            let newLabel = document.createElement("label");
            newLabel.textContent = elem;
            newLabel.value = elem;
            newLabel.category = key;

            let newBR = document.createElement("br");
            newBR.value = elem;
            newBR.category = key;

            formDIV.appendChild(newCheckbox);
            formDIV.appendChild(newLabel);
            formDIV.appendChild(newBR);
        }
    }
}

/**
 * Display the checkbox options for an array of options
 * @param {String} category A category
 * @param {String} formDIV The ID of a div on the website
 */
function displayFormHelper(category, formDIV) {
    formDIV = document.getElementById(formDIV);

    // Iterate through all checkboxes and display if category matches
    for (let DOMelem of formDIV.children) {
        if (DOMelem.category == category) {
            DOMelem.style.display = "initial";
        } else {
            DOMelem.style.display = "none";
        }
    }
}

/**
 * Display the checkbox options for some search terms.
 * @param {String} searchTerms 
 * @param {String} formDIV 
 */
function displaySearchHelper(searchTerms, formDIV) {
    // Grab form div
    formDIV = document.getElementById(formDIV);

    // If no search terms, then display all
    if (searchTerms == "") {
        for (let DOMelem of formDIV.children) {
            DOMelem.style.display = "initial";
        }
        return; 
    }

    // Display all elements with values that have the search terms as a substring
    for (let DOMelem of formDIV.children) {
        if (DOMelem.value.toLowerCase().includes(searchTerms.toLowerCase())) {
            DOMelem.style.display = "initial";
        } else {
            DOMelem.style.display = "none";
        }
    }
}

/**
 * Setup a category/form/search div using the data provided.
 * @param {JSON} categoryOBJ 
 * @param {String} categoryDIV 
 * @param {String} formDIV 
 * @param {String} searchINPUT
 */
function prepareCategorySearch(categoryOBJ, categoryDIV, formDIV, searchINPUT) {
    categoryDIV = document.getElementById(categoryDIV);

    // Clear the category div of buttons
    categoryDIV.innerHTML = "";
    
    // Initialize the Checkboxes
    initializeChecks(categoryOBJ, formDIV);

    // Initialize the category div with buttons and attach each of their scripts
    for (let category of Object.keys(categoryOBJ)) {
        let newButton = document.createElement("button");
        newButton.textContent = category;
        
        // Initialize Clicking Event
        newButton.addEventListener("click", (evt) => {
            displayFormHelper(category, formDIV);
        });
        categoryDIV.appendChild(newButton);
    }

    searchINPUT = document.getElementById(searchINPUT);

    // Initialize search terms
    searchINPUT.addEventListener("keyup", (evt) => {
        displaySearchHelper(searchINPUT.value, formDIV);
    });
}

/**
 * Fetch the data and prepare the category search DIVS on the page.
 */
async function prepareInputs() {
    let data = await makeRequest('/fetch-major-colleges');
    prepareCategorySearch(data["MAJORS"], "major-categories", "major-form", "major-search");
    prepareCategorySearch(data["UNIVERSITIES"], "university-categories", "university-form", "university-search");
}

/**
 * Returns the user selected major and universities in a two element array
 * @param {String} universityForm The ID to university checkbox div
 * @param {String} majorForm The ID to major checkbox div
 * @returns A 2 element array containing two arrays.
 */
function getCategoryInputs(majorForm, universityForm) {
    let selectedMajors = [];
    let selectedUniversities = [];
    
    majorForm = document.getElementById(majorForm);
    universityForm = document.getElementById(universityForm);
    
    for (let checkbox of majorForm.getElementsByTagName("input")) {
        if (checkbox.checked) {
            selectedMajors.push(checkbox.value);
        }
    }
    for (let checkbox of universityForm.getElementsByTagName("input")) {
        if (checkbox.checked) {
            selectedUniversities.push(checkbox.value);
        }
    }

    return [selectedMajors, selectedUniversities];
}

function attachCreateScript() {
    document.getElementById("schedule_create").addEventListener("click", async (evt) => {
        // evt.preventDefault();
        //TODO: Extra checks for input (from a selected list of majors and universities in a checkbox input with search menu)
        let inputted = getCategoryInputs("major-form", "university-form");
        let majors = inputted[0];
        let universities = inputted[1];

        // Perform Checks TODO: Move this server-side
        let name = document.getElementById("schedule-name").value;
        let schedules = await makeRequest('/fetch-schedule', {name: name});
        console.log(schedules);
        if(inputted[0].length == 0 || inputted[1].length == 0) {
            document.getElementById("no-majors-schedules").style.display = "initial";
            document.getElementById("existing-schedule").style.display = "none";
            document.getElementById("no-name").style.display = "none";
        } else if (schedules.valid == undefined) {
            document.getElementById("no-majors-schedules").style.display = "none";
            document.getElementById("existing-schedule").style.display = "initial";
            document.getElementById("no-name").style.display = "none";
        } else if (name == "") {
            document.getElementById("no-majors-schedules").style.display = "none";
            document.getElementById("existing-schedule").style.display = "none";
            document.getElementById("no-name").style.display = "initial";
        } else {
            await makeRequest("/create-schedule", {majors, universities, name});
            location.reload();
        }
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
        await prepareInputs();
        attachCreateScript();
    }
}

// Add the builder entry scripts to the signed in queue.
document.addEventListener("DOMContentLoaded", (evt) => {queue.push(builderEntryWrap);});