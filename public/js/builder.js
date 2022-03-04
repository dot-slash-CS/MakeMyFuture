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
        CatalogManager.scheduleDiv = document.getElementById(id);
        CatalogManager.currentSchedule = {};

        // If no name path provided, ask the user to select a schedule
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
        CatalogManager.scheduleDiv.innerHTML = "<h4 id=\"schedule-title\">Schedule</h4>";
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
                let classInfo = await makeRequest('/query-data', {query: "CLASS", acr: course});
                if (classInfo == null) {
                    continue;
                }
                let classDiv = document.createElement("div");
                classDiv.classList.add("semester-class");

                let minusSign = document.createElement("a");
                minusSign.textContent = "-";
                minusSign.addEventListener("click", (evt) => {
                    evt.preventDefault();
                    CatalogManager.removeClass(course, semester["SEASON"], semester["YEAR"]);
                });
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

    /**
     * Add a class to the schedule for the selected acr, season and year.
     * @param {String} acr 
     * @param {String} season 
     * @param {String} year 
     */
    static async addClass(acr, season, year) {
        await makeRequest('/edit-schedule', {
            type: "ADD",
            name: CatalogManager.scheduleName,
            acr: acr,
            season: season,
            year: year
        });
        await CatalogManager.updateSchedule();
        await CatalogManager.updateDisplay();
    }

    /**
     * Remove a class to the schedule for the selected acr, season and year.
     * @param {String} acr 
     * @param {String} season 
     * @param {String} year 
     */
     static async removeClass(acr, season, year) {
        await makeRequest('/edit-schedule', {
            type: "REMOVE",
            name: CatalogManager.scheduleName,
            acr: acr,
            season: season,
            year: year
        });
        await CatalogManager.updateSchedule();
        await CatalogManager.updateDisplay();
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
    let table = document.getElementById("catalog-classes-table");
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
        newPlus.addEventListener("click", (evt) => {
            evt.preventDefault();
            let season = document.getElementById("season-dropdown").selectedOptions[0].text;
            let year = document.getElementById("year-dropdown").selectedOptions[0].text;
            CatalogManager.addClass(course["AREA-ACR"], season, year);
        });
        table.appendChild(newPlus);
    }
}

/**
 * Check the sign in status of the user and change the display of elements
 * on the screen if they are not signed in.
 * @returns true if the user is not signed in
 */
function checkSignInStatus() {
    if (isSignedIn) {
        document.getElementById("not-signed-in").style.display = "none";
    } else {
        document.getElementById("no-schedule").style.display = "none";
        document.getElementById("schedule-no-exist").style.display = "none";
        document.getElementById("builder").style.display = "none";
        return true;
    }
}

/**
 * Set up the clicking events of the provided buttons to display
 * or hide the corresponding provided divs (which are tools).
 * Assumes both arrays are of the same size.
 * @param {Array} buttonIDS 
 * @param {Array} divIDS 
 */
function initializeToolsMenu(buttonIDS, divIDS) {
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
}

/**
 * Display the database to the user based on the parameters
 * they have selected.
 * @param {Array} schedules
 * @param {String} formDIV
 */
async function displayDatabase(schedules, formDIV="database-schedules") {
    // Get the form, clear it
    formDIV = document.getElementById(formDIV);
    formDIV.innerHTML = "";
    if (schedules.length == 0) {
        let newHeader = document.createElement("h2");
        newHeader.textContent = "No Schedules were found for that query.";
        formDIV.appendChild(newHeader);
        return;
    }

    // Iterate through the schedules and fill the form
    for (let schedule of schedules) {
        let databaseSchedule = document.createElement("div");
        databaseSchedule.classList.add("database-schedule");

        // Add Schedule Profile Div
        let databaseScheduleProfile = document.createElement("div");
        databaseScheduleProfile.classList.add("database-schedule-profile");

        let profileFields = document.createElement("div");
        profileFields.style.width = "90%";
        /**
         * Build a comma separated string for the given array
         * and header and return it.
         * @param header The start of the string
         * @param array An array of strings for the content
         * @returns A comma separated string list
         */
        function buildString(header, array) {
            let builtString = header + ": ";
            for (let i = 0; i < array.length; i++) {
                builtString += array[i];
                if (i < array.length - 1) {
                    builtString += ", ";
                }
            }
            return builtString;
        }
        
        let majorString = buildString("Majors", schedule["MAJORS"]);
        let universityString = buildString("Universities", schedule["UNIVERSITIES"]);

        let fields = [schedule["NAME"] + " by " + schedule["USERNAME"], majorString, universityString, "Date: " + (new Date(schedule["created"])).toDateString()];
        for (let field of fields) {
            let newParagraph = document.createElement("p");
            newParagraph.textContent = field;
            profileFields.appendChild(newParagraph);
        }

        let iconDiv = document.createElement("div");
        iconDiv.style.margin = "auto";
        let icon = document.createElement("i");
        icon.classList.add("fa", "fa-angle-double-down", "fa-3x");
        
        iconDiv.appendChild(icon);

        databaseScheduleProfile.append(profileFields, iconDiv);
        
        // Build Dropdown
        let databaseScheduleDropdown = document.createElement("div");
        databaseScheduleDropdown.classList.add("database-schedule-dropdown");
        for (let semester of schedule["SEMESTERS"]) {
            let header = document.createElement("h3");
            header.textContent = semester["SEASON"] + " " + semester["YEAR"];

            let classDiv = document.createElement("div");
            classDiv.classList.add("database-schedule-classes");

            for (let classACR of semester["CLASSES"]) {
                let classInfo = await makeRequest('query-data', {query: "CLASS", acr: classACR});
                let newParagraph = document.createElement("p");
                newParagraph.textContent = classInfo["AREA-ACR"] + ": " + classInfo["NAME"];
                classDiv.appendChild(newParagraph);
            }
            databaseScheduleDropdown.append(header, classDiv);
        }
        if (schedule["SEMESTERS"].length == 0) {
            let newHeader = document.createElement("h2");
            newHeader.textContent = "This schedule has no semesters in it.";
            newHeader.style.padding = "20px";
            databaseScheduleDropdown.appendChild(newHeader);
        }
        let status = true;
        iconDiv.addEventListener("click", (evt) => {
            if (status) {
                databaseScheduleDropdown.style.height = (databaseScheduleDropdown.scrollHeight + 15) + "px";
                databaseScheduleDropdown.style.padding = "10px";
                status = !status;
                icon.classList.remove("fa-angle-double-down");
                icon.classList.add("fa-angle-double-up");
            } else {
                databaseScheduleDropdown.style.height = "0px";
                databaseScheduleDropdown.style.padding = "0px";
                status = !status;
                icon.classList.remove("fa-angle-double-up");
                icon.classList.add("fa-angle-double-down");
            }
        });
        databaseSchedule.append(databaseScheduleProfile, databaseScheduleDropdown);
        formDIV.appendChild(databaseSchedule);
    }
}

/**
 * Initialize the search dropdowns to change the placeholders
 * of their respective text inputs.
 * @param divID the ID of the div holding all the search queries
 */
function initializeQuerySelects(divID = "database-search-queries") {
    let queryDiv = document.getElementById(divID);
    let selects = queryDiv.getElementsByTagName("select");
    let inputs = queryDiv.getElementsByTagName("input");

    for (let i = 0; i < selects.length; i++) {
        try {
            selects[i].removeEventListener("change", getEventListeners(selects[i])["change"][0]["listener"]);
        } catch (error) {}
        selects[i].addEventListener("change", (evt)=> {
            inputs[i].placeholder = selects[i].value;
        });
    }
}

/**
 * Retrieve all of the inputted search queries from the user
 * @param {String} divID the ID of the div holding all the search queries
 * @returns {JSON} An object containing all the queries provided
 */
function getSearchQueries(divID = "database-search-queries") {
    let queryDiv = document.getElementById(divID);
    let inputs = queryDiv.getElementsByTagName("input");
    let queries = {};

    for (let input of inputs) {
        if (Object.keys(queries).includes(input.placeholder)) {
            queries[input.placeholder].push(input.value);
        } else {
            queries[input.placeholder] = [input.value];
        }
    }
    return queries;
}

/**
 * Initialize the search query add and remove buttons.
 * IDS: database-search-add, database-search-remove, database-search-queries
 */
function initializeAddRemoveButtons(divID = "database-search-queries") {
    let queryDIV = document.getElementById(divID);
    let addButton = document.getElementById("database-search-add");
    let removeButton = document.getElementById("database-search-remove");

    addButton.addEventListener("click", (evt) => {
        let htmlCode = "<label>Search by</label><select>\n" +
                       "<option>Author</option>\n" +
                       "<option>Major</option>\n" +
                       "<option>University</option>\n" +
                       "<option>Schedule Name</option>\n" +
                       "</select><br><br>\n" +
                       "<input type=\"text\" style=\"width:100%\" placeholder=\"Author\"><br><br>\n";
        queryDIV.insertAdjacentHTML('beforeend', htmlCode);
        initializeQuerySelects();
    });

    removeButton.addEventListener("click", (evt) => {
        // Remove 7 children at the end of the query div
        try {
            for (let i = 0; i < 7; i++) {
                queryDIV.children[queryDIV.children.length - 1].remove();
            }
        } catch (error) {}
    });
}

/**
 * Returns the date range specified by the user in a 2 element array.
 * IDS: database-search-date-start, database-search-date-end
 * @returns {Array} A two element array with the given milliseconds.
 */
function getDateRange() {
    let startInput = document.getElementById("database-search-date-start");
    let endInput = document.getElementById("database-search-date-end");
    function inputToMilli (elem, appendage=" 00:00:00") {
        return new Date(Date.parse(elem.value + appendage)).getTime();
    }
    return [inputToMilli(startInput), inputToMilli(endInput, " 24:00:00")];
}

/**
 * Initialize the search, sorting and matching events by tying
 * each to their respective helper functions.
 */
async function initializeDatabase() {
    // Variables for DOM
    let formDIVID = "database-schedules";
    let searchButton = document.getElementById("database-search");
    let sortInput = document.getElementById("database-sort");
    let checkbox = document.getElementById("database-matching");

    initializeQuerySelects("database-search-queries");
    initializeAddRemoveButtons();

    searchButton.addEventListener("click", async (evt) => {
        let queries = getSearchQueries();
        let dateRange = getDateRange();
        let sortOption = sortInput.value;
        let matching = checkbox.checked;

        let schedules = await makeRequest('/fetch-schedules-batch', {
            queries: queries, 
            dateRange: dateRange,
            sortOption: sortOption, 
            matching: matching, 
            majors: CatalogManager.currentSchedule["MAJORS"], 
            universities: CatalogManager.currentSchedule["UNIVERSITIES"], 
            page: 1
        });
        // TODO: Handle pagination at the bottom
        displayDatabase(schedules, formDIVID);
    });

    // By default, show the schedules with the default options selected (perform phony request)
    searchButton.dispatchEvent(new Event("click"));
}

// Queue all initialization calls and user interactions for builder.html on page load.
async function main_builder_func() {
    // Initial Signed In Check Status
    if (checkSignInStatus()) {
        return false;
    }
    // The user is guaranteed to be signed in past this point

    // Initialize the tools menu buttons
    initializeToolsMenu(["catalog-button", "database-button"], ["catalog", "database"]);

    // Initialize the catalog tool
    await initializeDepartments();
    setupDepartmentSelect();
    // Perform phony select request
    document.getElementById("department").dispatchEvent(new Event("change"));

    // Initialize the Catalog with the current schedule (from the URL)
    await CatalogManager.initialize();
    if (CatalogManager.scheduleName == "") {
        document.getElementById("builder").style.display = "none";
        document.getElementById("schedule-no-exist").style.display = "none";
        return false;
    } else {
        document.getElementById("no-schedule").style.display = "none";
    }

    if (CatalogManager.currentSchedule.valid == false) {
        document.getElementById("builder").style.display = "none";
        return false;
    } else {
        document.getElementById("schedule-no-exist").style.display = "none";
    }

    // Initialize the database (requires that the CatalogManager is initialized)
    await initializeDatabase();

    console.log("The Builder Page Initialization was successful.");
}

document.addEventListener("DOMContentLoaded", (evt) => {queue.push(main_builder_func);});