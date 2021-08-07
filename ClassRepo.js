/** MakeMyFuture ClassRepo
 * The ClassRepo class maintains a library of classes
 * by division and controls the main class menu
 * which has some amount of selected classes.
 * 
 * Required DOM elements for Form successful execution.
 * 
 * div, id = "ClassMenu"
 * div, id = "menucontent"
 * 
 * @author Pirjot Atwal
 * @file ClassRepo.js
 * @version 08/07/2021
 */

class ClassRepo {

    /** initialize
     * Initialize the ClassRepo (should be run once per page load).
     * 
     * @param {String} class_file where the file with all classes are located
     * @param {*} buttons_div_ID where the buttons div is located
     * @param {*} menu_content_ID where the menu div is located
     */
    static async initialize (class_file, buttons_div_ID = "ClassMenu", menu_content_ID = "menucontent") {
        ClassRepo.ready = false;
        ClassRepo.class_file = class_file;
        ClassRepo.buttons_div = document.getElementById(buttons_div_ID);
        ClassRepo.menu_content = document.getElementById(menu_content_ID);

        // On initialize, load all class objects and store them by division
        // Create separate form elements for each division area
        // For each division fill them with checkbox inputs for each class
        // For each division create a button that will display that area's form
        // Create a search menu, when changed AND has letters display all forms but only inputs that match either name or abbreviation. If changed and empty, only show current active button
        // When a checkbox is selected keep track of that selected class
        // When a button is clicked, hide all forms and display the form for that division area, clear the search menu
        //Fetch the file as a json
        ClassRepo.raw_data = await ClassRepo.retrieveInfo(ClassRepo.class_file);
        ClassRepo.areas = ClassRepo.raw_data["AREAS"];
        ClassRepo.classes = {}; //A map of Division to an array of classes
        ClassRepo.divisions = ClassRepo.raw_data["DIVISIONS"];
        ClassRepo.forms = {}; //A map of Division to respective Form with class checkboxes
        ClassRepo.selected = [];

        await ClassRepo.initSearch();
        await ClassRepo.initDivisions();
        ClassRepo.ready = true;
    }

    /** retrieveInfo
     *  Asynchronously fetches the class data from the
     *  provided JSON file.
     *  @param {String} file_name the file to fetch the class data from
     */
    static async retrieveInfo(file_name) {
        return (await (await fetch(file_name)).json());
    }

    static async initSearch() {
        //The search input is assumed to be the first element of the menucontent
        let search_input = ClassRepo.menu_content.getElementsByTagName("input")[0];
        search_input.addEventListener("keyup", async (evt) => {
            // Hide all forms
            while (ClassRepo.menu_content.getElementsByTagName("form").length != 0) {
                ClassRepo.menu_content.removeChild(ClassRepo.menu_content.getElementsByTagName("form")[0]);
            }
            //Show all forms and all of their inner elements
            for (let form of Object.values(ClassRepo.forms)) {
                for (let child of form.childNodes) {
                    child.style.display = "";
                }
                ClassRepo.menu_content.appendChild(form);
            }
            //Hide all inputs with matching classes
            for (let form of ClassRepo.menu_content.getElementsByTagName("form")) {
                for (let child of form.childNodes) {
                    let search_val = search_input.value.toLowerCase();
                    if (!(child.name.toLowerCase().includes(search_val) || child.acr.toLowerCase().includes(search_val))) {
                        child.style.display = "none";
                    }
                }
            }
        });
    }

    /** initDivisions
     * 
     * Initialize the ClassRepo's visual menu with its forms, labels, 
     * inputs, brs, buttons and etc.
     * Ensure that the ClassRepo classes array and forms array
     * are both initialized.
     * 
     */
    static async initDivisions() {
        //For every Division of form:
        //{MATH: "Mathematics"}
        for (let i = 0; i < ClassRepo.divisions.length; i++) {
            //Add button to menu of the following form:
            // <button class="menulinks" onclick="ClassRepo.display(event)" displayClass="MATH" id="defaultOpen">Math</button>
            let new_button = document.createElement("button");
            new_button.class = "menulinks";
            new_button.addEventListener("click", (event) => {
                ClassRepo.display(event);
            });
            let div_name = Object.keys(ClassRepo.divisions[i])[0];
            new_button.displayClass = div_name;
            if (i == 0) {
                new_button.id = "defaultOpen";
            }
            new_button.textContent = ClassRepo.divisions[i][div_name];
            ClassRepo.buttons_div.appendChild(new_button);

            //Add forms to forms array 
            let new_form = document.createElement("form");
            new_form.menuFor = Object.keys(ClassRepo.divisions[i])[0];
            
            // If the division does not already have an array, create a new one
            if (ClassRepo.classes[div_name] == undefined) {
                ClassRepo.classes[div_name] = [];
            }

            //Add all the classes with this division into the division's array
            for (let clas of ClassRepo.raw_data["CLASSES"]) {
                if (clas["DIVISION"] == div_name) {
                    clas.selected = false;
                    ClassRepo.classes[div_name].push(clas);
                }
            }

            // Add an input for every class in the division
            // Of the form
            // <input type = "checkbox" name = "Math-101C" onchange="ClassRepo.select(event)">
            // <label>Math-101C</label><br>
            for (let clas of ClassRepo.classes[div_name]) {
                let new_input = document.createElement("input");
                new_input.type = "checkbox";
                new_input.name = clas["NAME"];
                new_input.acr = clas["DIVISION"] + "-" + clas["NUMBER"];
                new_input.addEventListener("change", (evt) => {
                    let new_event = document.createEvent("HTMLEvents");
                    new_event.acr = new_input.acr;
                    new_event.from = "ClassRepo";
                    if (new_input.checked) {
                        new_event.initEvent("Select Class", true, true);
                    }
                    else {
                        new_event.initEvent("Unselect Class", true, true);
                    }
                    document.dispatchEvent(new_event);
                });
                //If my class is selected elsewhere, check my box
                document.addEventListener("Class Selected", (evt) => { // Every input has its own listener (possibly inefficient)
                    if (evt.acr == new_input.acr && evt.from != "ClassRepo") {
                        new_input.checked = !new_input.checked;
                    }
                });
                //Or uncheck it, if the class was unselected
                document.addEventListener("Class Unselected", (evt) => {
                    if (evt.acr == new_input.acr && evt.from != "ClassRepo") {
                        new_input.checked = !new_input.checked;
                    }
                });
                let label = document.createElement("label");
                label.name = clas["NAME"];
                label.acr = clas["DIVISION"] + "-" + clas["NUMBER"];
                //Label display: ENGL-101C: English Composition
                label.textContent = clas["DIVISION"] + "-" + clas["NUMBER"] + ": " + clas["NAME"];
                let br = document.createElement("br");
                br.name = clas["NAME"];
                br.acr = clas["DIVISION"] + "-" + clas["NUMBER"];

                //Append everything
                new_form.appendChild(new_input);
                new_form.appendChild(label);
                new_form.appendChild(br);
            }

            ClassRepo.forms[div_name] = new_form;
        }

        // Display the first button's form
        document.getElementById("defaultOpen").click();
    }

    /** display
     * 
     * Used by menu buttons to display their corresponding form.
     * 
     * @param {Event} evt 
     */
    static async display(evt) {
        let display = evt.currentTarget.displayClass;
        // Hide all forms
        while (ClassRepo.menu_content.getElementsByTagName("form").length != 0) {
            ClassRepo.menu_content.removeChild(ClassRepo.menu_content.getElementsByTagName("form")[0]);
        }
        //Append current form
        ClassRepo.menu_content.appendChild(await ClassRepo.generateContentBody(display));
    }

    /** generateContentBody
     * Return the form of the corresponding Division.
     * 
     * @param {String} type the division
     * @returns The form element for that division
     */
    static async generateContentBody(type) {
        // If the forms have not been initialized yet, wait a bit.
        while (ClassRepo.ready == false) {
            await delay(500);
        }
        return ClassRepo.forms[type];
    }

    /** select
     * Selects/Unselects the corresponding class object
     * which has a matching acronym (i.e. MATH-103)
     * with the one in evt.acr. Does so by configuring ClassRepo.selected.
     * Select is built to respond to the Select Class or Unselect Class
     * event.
     * Select fires in response a Class Unselected or Class Selected event.
     * 
     * 
     * @param {Event} evt acr, name and from should be configured correctly
     */
    static async select(evt) {
        let clas = await ClassRepo.get_class(evt.acr);
        
        let new_event = document.createEvent("HTMLEvents");
        new_event.from = evt.from;
        new_event.name = clas["NAME"];
        new_event.acr = clas["DIVISION"] + "-" + clas["NUMBER"];

        if (clas.selected) { // Unselect the class
            for (let i = 0; i < ClassRepo.selected.length; i++) {
                if (ClassRepo.selected[i]["DIVISION"] + "-" + ClassRepo.selected[i]["NUMBER"] == new_event.acr) {
                    ClassRepo.selected.splice(i, 1);
                }
            }
            clas.selected = false;
            new_event.initEvent("Class Unselected", true, true);
        } 
        else { // Select the class
            ClassRepo.selected.push(clas);
            clas.selected = true;
            new_event.initEvent("Class Selected", true, true);
        }
        document.dispatchEvent(new_event);
    }

    /** get_class
     * Returns the class with the corresponding acr
     * asynchronously (guarantees that the ClassRepo is ready)
     * 
     * @param {String} acr The class acronym (i.e. ENGL-101C)
     * @returns Return the class JSON that corresponds
     */
    static async get_class(acr) {
        while (ClassRepo.ready == false) {
            await delay(500);
        }
        for (let div of Object.keys(ClassRepo.classes)) {
            for (let clas of ClassRepo.classes[div]) {
                if (clas["DIVISION"] + "-" + clas["NUMBER"] == acr) {
                    return clas;
                }
            }
        }
        return null;
    }
}

//Please make sure currentTarget is set correctly for selection events => evt.acr, .from, .name
document.addEventListener("Select Class", ClassRepo.select);
document.addEventListener("Unselect Class", ClassRepo.select);

// document.addEventListener("Select Class", (evt) => {console.log(evt);});
// document.addEventListener("Unselect Class", (evt) => {console.log(evt);});
// document.addEventListener("Class Unselected", (evt) => {console.log(evt);});
// document.addEventListener("Class Selected", (evt) => {console.log(evt);});