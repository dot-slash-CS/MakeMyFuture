/** MakeMyFuture ScheduleBuilder
 * The ScheduleBuilder class helps build the schedule
 * based on the nodes selected on the IGETCTable.
 * 
 * Required DOM elements for ScheduleBuilder successful execution.
 * 
 * table, id = ScheduleBuilder
 * table row, id = builderHeader
 * table row, id = builderRows
 * 
 * @author Pirjot Atwal
 * @file ScheduleBuilder.js
 * @version 06/06/2021
 */

class ScheduleBuilder
{
    constructor (id, builderHeader = "builderHeader", builderRows = "builderRows")
    {
        this.id = id;
        this.instance = document.getElementById(id);
        this.body = this.instance.getElementsByTagName("tbody")[0];
        this.builderHeader = document.getElementById(builderHeader);
        this.builderRows = document.getElementById(builderRows);
        this.columns = 1;
        //Array of strings with class names
        this.currentlySelected = [];
        this.initialize();
    }

    /** initialize
     * 
     * Initializes this schedule builder's header and its contents
     * to an empty table based on the current value of this.columns (by default 1)
     * and adds all classes located in this.urrentlySelected.
     * 
     */
    initialize()
    {
        //The Schedule Builder assumes that the given table instance
        //has two rows by default (ids by "builderHeader" and "builderRows")
        //The Schedule Builder assumes that the table will have 
        //ONLY 2 rows after initialization, ATLEAST 1 column with classes,
        //and assumes that the last column of the table's second
        //row is the "bank" of all selected classes. The Schedule Builder
        //assumes that all classes are of unique name.
        //The IGETCTable will repeatedly call the Schedule Builder's
        //update function, passing in its buttons. The Schedule Builder
        //will, on update, check through all buttons in all of its columns
        //and add/remove them as needed. When adding a button, it will be added
        //to the "bank." The Schedule Builder's columns will be built based
        //on the number of columns determined in the Form class. They will be
        //filled with "Semester 1, Semester 2, ..." headers and "No classes selected"
        //in each of the entries (selectable as spans).
        this.update_header(this.columns);
    }

    /** update_header
     * 
     * Updates this table's header to be
     * "Semester 1 | Semester 2 | ... | Selected Classes"
     * where the number of semesters is equivalent to the number
     * of columns passed in. Sets this.columns to the passed in number.
     * 
     * @param {Number} columns an integer, equivalent to the number of semesters
     */
    update_header(columns)
    {
        if (columns <= 0) //Columns must be > 0
        {
            return;
        }
        //TODO: Check if buttons are in currentlySelected, handle independently

        this.columns = columns;
        //Change the header row to "Semester 1 | Semester 2 | ... | Selected Classes"
        //Clear the header
        this.builderHeader.innerHTML = "";
        for (let i = 1; i < columns + 1; i++)
        {
            let newSemester = document.createElement("th");
            newSemester.textContent = "Semester " + i;
            this.builderHeader.appendChild(newSemester);
        }
        //Add on Selected Classes Column
        let selectedClasses = document.createElement("th");
        selectedClasses.textContent = "Selected Classes";
        this.builderHeader.appendChild(selectedClasses);

        this.fill_entries();
    }

    /** fill_entries
     * 
     * Clears this table's second row entries
     * and adds all the classes in currently selected
     * into the bank.
     * 
     */
    fill_entries()
    {
        //Clear the rows
        this.builderRows.innerHTML = "";
        //Create columns for each semester
        for (let i = 0; i < this.columns + 1; i++)
        {
            let unselected = document.createElement("td");
            unselected.id = "builderNode" + i;

            //Add the span for each of the elements "No classes selected message"
            let new_span = document.createElement("span");
            new_span.textContent = "No classes selected";
            unselected.appendChild(new_span);

            //Set drag functions
            unselected.addEventListener("drop", (evt) => {
                let orig_parent_id = evt.dataTransfer.getData("orig_parent_id");
                let target = evt.target;

                //If the user is dropping into the "No classes selected" span, set the evt.target to be its parent instead
                if (target.localName != "td")
                {
                    target = target.parentElement;
                }

                if(target.id != orig_parent_id && target.localName == "td") //Only allow buttons to be dropped into tds that aren't its current parent
                {
                    //Clear the td's text content in its span
                    target.childNodes[0].textContent = "";
                    //Drop First to avoid getElementById collision.
                    evt.preventDefault();
                    let data = evt.dataTransfer.getData("id");
                    target.appendChild(document.getElementById(data));

                    //Set the original td's span's text content
                    let orig_td = document.getElementById(orig_parent_id);
                    if (orig_td.childNodes.length == 1) //This semester has only its span left
                    {
                        //Grab the span and change its content
                        orig_td.childNodes[0].textContent = "No classes selected";
                    }
                }
            });
            unselected.addEventListener("dragover", (evt) => {allowDrop(evt);});

            this.builderRows.appendChild(unselected);
        }

        //Clear currentlySelected and all classes back again
        let copiedArray = this.currentlySelected;
        this.currentlySelected = [];

        //Add values based on currentlySelected
        for (let x of copiedArray)
        {
            this.add_class(x);
        }
    }

    /** add_class
     * 
     * Adds a class to this table's bank (the last column of the second row).
     * Sets the button's draggable function.
     * 
     * @param {String} clas - The new class to add to the bank
     */
    add_class(clas)
    {   
        //Get the last column of the second row
        let semesters = collect_to_arr(this.builderRows.getElementsByTagName("td"));
        let button_area = semesters[semesters.length - 1];
        //Clear the text content of the area
        button_area.childNodes[0].textContent = "";

        //Already exists (All class names must be unique)
        if (this.currentlySelected.indexOf(clas) != -1)
        {
            return;
        }

        //Append to currently selected
        this.currentlySelected.push(clas);

        //Append to GUI
        let new_button = gen_drag_button(clas, "builder" + clas, (evt) => {
            evt.dataTransfer.setData("orig_parent_id", evt.target.parentElement.id);
            drag(evt);
        });
        button_area.appendChild(new_button);
    }

    /** remove_class
     * 
     * Removes the class from this table, regardless of its position.
     * Removes it from the currently selected array.
     * 
     * @param {String} clas - The class to remove from the table.
     */
    remove_class(clas)
    {
        //Make sure the class is in the table
        if(this.currentlySelected.indexOf(clas) == -1)
        {
            return;
        }

        //Find the column that the button is in
        let semesters = collect_to_arr(this.builderRows.getElementsByTagName("td"));
        let semester = null;
        for (let sem of semesters) //For every semester (including the bank) in the second row
        {
            for (let c of sem.childNodes) // For every class in this semester
            {
                if (c.textContent == clas) // If this class is the class we're looking for
                {
                    semester = sem; // Set semester to the current semester
                    
                    //Remove the class from this semester
                    sem.removeChild(c);
                    //Remove it from the currentlySelected array
                    this.currentlySelected.splice(this.currentlySelected.indexOf(clas), 1);
                    //If the semester has only its span left, change the span to "No classes selected"
                    if (sem.childNodes.length == 1)
                    {
                        sem.childNodes[0].textContent = "No classes selected";
                    }

                    break;
                }
            }
            if (semester != null) //The class was found in this semester
            {
                break;
            }
        }
    }
}