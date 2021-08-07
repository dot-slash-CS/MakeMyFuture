/** MakeMyFuture IGETC Table
 * The IGETCTable keeps track of the table nodes
 * which nodes are selected and the classes they
 * represent.
 * 
 * Required DOM elements for IGETCTable successful execution:
 * table, id = "IGETCTable"
 * 
 * 
 * @author Pirjot Atwal
 * @file IGETCTable.js
 * @version 08/07/2021
 */

class IGETCTable
{
    /** IGETCTable constructor
     * 
     * Construct an IGETCTable based on the provided values.
     * 
     * @param {String} id The ID of the table which will hold the IGETCTable
     * @param {ScheduleBuilder} builder The ScheduleBuilder (to link the buttons to)
     */
    constructor(id, builder)
    {
        this.id = id;
        //Each area in this.areas is an array with element 0 equal to the 
        // area name and the rest of the elements being the classes tied 
        // to that area.
        this.areas = [];
        //An array of all buttons (where some are this.selected and some are not)
        this.buttons = [];
        
        this.instance = document.getElementById(id);
        this.body = this.instance.getElementsByTagName("tbody")[0];
        
        this.initialize();
    }

    /*  initialize()

        Initialize with the table's content.

        Assumes that the table already has the header with "Area"
        and "Classes." Adds the areas and their classes by reading from the 
        IGETCTable_template.json file.
    */
    async initialize()
    {
        //The data is an array of JSON objects with the following format:
        /**
            {
                "area": "English Communication",
                "classes": [
                    "ENGL 101A",
                    "ENGL 101C",
                    "COMM 111"
                ]
            }
         */
        await this.retrieveInfo("IGETCTable_template.json");
        
        //Construct rows using this.areas (as selectable buttons)
        this.construct_rows();
    }

    /** retrieveInfo
     * 
     *  Asynchronously fetches the class data from the
     *  provided JSON file and inserts each class data
     *  into its respective area in this.areas. Each
     *  element in this.areas is an array where the first
     *  element is the name of the area and the rest of
     *  the elements are the classes that pertain to that area.
     *  @param {String} file_name the file to fetch the class data from
     */
    async retrieveInfo(file_name = "IGETCTable_template.json")
    {
        let areas = await (await fetch(file_name)).json();
        for (let area of areas)
        {
            let area_array = [area.area];
            for (let c of area.classes)
            {
                area_array.push(c);
            }
            this.areas.push(area_array);
        }
    }

    /** add_row_string
     * 
     * Add a row to the table body (where the content is strings),
     * formed into a body of comma-separated strings
     * @param {Array} contents - An array containing strings
     */
    add_row_string (contents)
    {
        let newRow = document.createElement("tr");
        for (let content of contents)
        {
            let newElem = document.createElement("td");
            newElem.textContent = content;
            newRow.appendChild(newElem);
        }
        this.body.appendChild(newRow);
    }

    /** add_row_button
     * 
     *  Add a row to the table body (where the content is strings),
     *  formed into a body of selectable buttons. Adds all selectable buttons
     *  to this.buttons.
     * 
     * @param {Array} contents - An array containing strings (the first element will be the string in the first column and 
     * the rest will be buttons in the second column)
     */
    add_row_button(contents)
    {
        //Contents length must be > 0
        if (contents.length == 0)
        {
            return;
        }

        let newRow = document.createElement("tr");
        //Create column 1 area, set its content equivalent to the class area's name
        let col1 = document.createElement("td");
        col1.textContent = contents[0];
        
        //Create column 2 area
        let col2 = document.createElement("td");
        for (let i = 1; i < contents.length; i++)
        {
            //Create new button
            let newButton = document.createElement("button");
            newButton.id = "class_button" + this.buttons.length;
            newButton.textContent = contents[i];
            newButton.selected = false;
            
            //If my class is selected elsewhere, change the style of the button
            document.addEventListener("Class Selected", (evt) => { // The choice of Select Class over Selected Class is intentional
                if (evt.acr == newButton.textContent) {
                    newButton.style.background = "red";
                }
            });
            //The same for if the class was unselected elsewhere
            document.addEventListener("Class Unselected", (evt) => {
                if (evt.acr == newButton.textContent) {
                    newButton.style.background = "";
                }
            });

            //Set Button Selectability, Dispatches corresponding event
            newButton.addEventListener("click", (evt) => {
                let new_event = document.createEvent("HTMLEvents");
                new_event.acr = newButton.textContent;
                new_event.from = "IGETC";
                if (newButton.selected) // Unselect the button
                {
                    // Send Unselect Event to ClassRepo
                    new_event.initEvent("Unselect Class", true, true);
                }
                else // Select the button
                {
                    //Send Select Event
                    new_event.initEvent("Select Class", true, true);
                }
                newButton.selected = !newButton.selected;
                document.dispatchEvent(new_event);
            });
            //Push the button into the this.buttons array
            this.buttons.push(newButton);

            //Append the new button to the new area in column 2
            col2.appendChild(newButton);
        }

        //Add column 1 and column 2
        newRow.appendChild(col1);
        newRow.appendChild(col2);

        //Add new row to table body
        this.body.appendChild(newRow);
    }

    /** construct_rows
     * 
     *  Constructs the rows formed in this.areas and adds
     *  rows using add_row_button.
     */
    construct_rows()
    {
        //Add all rows to the table
        for (let row of this.areas)
        {
            this.add_row_button(row);
        }
    }
}

