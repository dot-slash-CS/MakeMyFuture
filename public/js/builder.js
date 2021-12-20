/** builder.js
 * The client side script for builder.html, initializing the catalog and its various
 * tools, as well as handling the server-client side interaction of the user
 * adding classes to their schedule.
 * 
 * @authors Pirjot Atwal
 */

/**
 * Make a request to the server and return the response.
 * @param {String} route the route to make the call on
 * @param {JSON} body the body to stringify and send, if not supplied then call type is GET
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

/**
 * Initialize the Departments dropdown with all of the departments in the current server's
 * catalog.
 */
async function initializeDepartments() {
    let departments = await makeRequest('query-data', {query: "AREAS"});
    // Grab the department dropdown on the page
    let dropdown = document.getElementById("department");
    // Clear the dropdown's current children
    dropdown.innerHTML = "";
    // Fill all options
    let index = 1;
    for (let department of departments) {
        let newOption = document.createElement("option");
        if (index < 10) {
            newOption.value = "0" + index;
        } else {
            newOption.value = index;
        }
        newOption.areaACR = Object.keys(department)[0];
        newOption.text = newOption.areaACR + " - " + Object.values(department)[0];
        dropdown.appendChild(newOption);
        index++;
    }
}

/**
 * Setup the user selection of the department dropdown to configure the 
 * classes that show in the course selection.
 */
function setupDepartmentSelect() {
    // Grab the department dropdown on the page
    let dropdown = document.getElementById("department");
    let options = dropdown.getElementsByTagName("option");
    dropdown.addEventListener("change", (evt) => {
        let acr = options[Number(dropdown.value) - 1].areaACR;
        displayClasses(acr);
    });
}

/**
 * Display all classes of a specific acronym (like all Math classes) in
 * the menu classes table.
 * 
 * @param {String} acr The acronym to show "MATH", "PHYS", "BIOL", etc.
 */
async function displayClasses(acr) {
    // Get table on the table
    let table = document.getElementsByClassName("menu-classes-table")[0];
    // Clear the table
    table.innerHTML = "<p>Courses</p><p>Title</p><p>Units</p><p></p>"
    // Fetch classes matching acr
    let classes = await makeRequest('query-data', {query: "CLASSES", acr});
    // For every course, add it to the table.
    for (let course of classes) {
        let displayMe = [course["AREA-ACR"], course["NAME"], course["UNITS"]];
        for (let item of displayMe) {
            let newParagraph = document.createElement("p");
            newParagraph.textContent = item;
            table.appendChild(newParagraph);
        }
        let newPlus = document.createElement("a");
        // Attach clicking script here
        newPlus.textContent = "+";
        table.appendChild(newPlus);
    }
}

// Queue all initialization calls and user interactions for builder.html on page load.
document.addEventListener("DOMContentLoaded", async (evt) => {
    await initializeDepartments();
    setupDepartmentSelect();
    // Perform phony select request
    document.getElementById("department").dispatchEvent(new Event("change"));
    console.log("The Builder Page Initialization was successful.");
});