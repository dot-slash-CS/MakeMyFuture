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

class CatalogManager {
    /**
     * Initialize the catalog manager, passing in the ID of the schedule node on the page.
     * @param {String} id The class of the schedule.
     */
    static async initialize(id="schedule") {
        CatalogManager.scheduleDiv = document.getElementsByClassName(id)[0];
        CatalogManager.currentSchedule = {};

        // If no name path provided, select a schedule
        if (await CatalogManager.updateSchedule()) {
            return false;
        }

        // If schedule doesn't exist, select a schedule
        if (CatalogManager.currentSchedule.valid == false) {
            return false;
        }
        
        await CatalogManager.updateDisplay();
    }

    /**
     * Update the currentSchedule of the catalog by making a request to the server.
     * @returns true if the schedule is invalid
     */
    static async updateSchedule() {
        // Retrieve the name of the schedule based on the url.
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        CatalogManager.scheduleName = params["name"];
        if (CatalogManager.scheduleName == "") {
            return true;
        }

        // Fetch the schedule matching the name from the server
        CatalogManager.currentSchedule = await makeRequest('/fetch-schedule', {"name": CatalogManager.scheduleName});
        
    }

    /**
     * Clear the current display, then populate the semesters and their respective
     * classes based on the currentSchedule.
     */
    static async updateDisplay() {
        CatalogManager.scheduleDiv.innerHTML = "Schedule";
        for (let semester of CatalogManager.currentSchedule["SEMESTERS"]) {
            let semesterDiv = document.createElement("div");
            semesterDiv.classList.add("semester");

            // Add title
            let semesterTitle = document.createElement("div");
            semesterTitle.classList.add("semester-title");
            let semesterHeader = document.createElement("h3");
            semesterHeader.textContent = semester["SEASON"] + " " + semester["YEAR"];
            semesterTitle.appendChild(semesterHeader);
            semesterDiv.appendChild(semesterTitle);
            
            // Add classes
            let semesterClasses = document.createElement("div");
            semesterClasses.classList.add("semester-classes");
            for (let course of semester["CLASSES"]) {
                let classInfo = await makeRequest('query-data', {query: "CLASS", acr: course});
                if (classInfo == null) {
                    continue;
                }
                let classDiv = document.createElement("div");
                classDiv.classList.add("semester-class");

                let minusSign = document.createElement("a");
                minusSign.textContent = "-";
                classDiv.append(minusSign);

                let properties = ["AREA-ACR", "NAME", "UNITS"];

                for (let property of properties) {
                    let paragraph = document.createElement("p");
                    paragraph.textContent = classInfo[property];
                    classDiv.appendChild(paragraph);
                }
                semesterClasses.append(classDiv);
            }

            semesterDiv.appendChild(semesterClasses);
            CatalogManager.scheduleDiv.appendChild(semesterDiv);
        }
    }
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

/**
 * 
 * @returns true if the user is not signed in
 */
function checkSignInStatus() {
    if (isSignedIn) {
        document.getElementById("not-signed-in").style.display = "none";
    } else {
        document.getElementById("no-schedule").style.display = "none";
        document.getElementsByClassName("builder")[0].style.display = "none";
        return true;
    }
}

// Queue all initialization calls and user interactions for builder.html on page load.
async function main_builder_func() {
    await initializeDepartments();
    setupDepartmentSelect();
    // Perform phony select request
    document.getElementById("department").dispatchEvent(new Event("change"));

    // Initial Signed In Check Status
    if (checkSignInStatus()) {
        return false;
    }

    // Initialize the Catalog with the current schedule (from the URL)
    await CatalogManager.initialize();
    if (CatalogManager.scheduleName == "") {
        document.getElementsByClassName("builder")[0].style.display = "none";
        document.getElementById("schedule-no-exist").style.display = "none";
        return false;
    } else {
        document.getElementById("no-schedule").style.display = "none";
    }

    if (CatalogManager.currentSchedule.valid == false) {
        document.getElementsByClassName("builder")[0].style.display = "none";
        return false;
    } else {
        document.getElementById("schedule-no-exist").style.display = "none";
    }

    console.log("The Builder Page Initialization was successful.");
}

document.addEventListener("DOMContentLoaded", (evt) => {queue.push(main_builder_func);});