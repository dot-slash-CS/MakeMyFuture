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
 * @version 04/03/2021
 */

class IGETCTable
{
    constructor(id)
    {
        this.id = id;
        //Each area in this.areas is an array with element 0 equal to the 
        // area name and the rest of the elements being the classes tied 
        // to that area.
        this.areas = [];

        this.instance = document.getElementById(id);
        this.body = this.instance.getElementsByTagName("tbody")[0];
        
        this.initialize();
    }

    /*  initialize()
        Initialize with the table's content.

        Assumes that the table already has the header with "Area"
        and "Classes." Adds the area's and their classes by reading from the 
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
        
        //Construct rows to be added to the table using add_rows
        var rows = [];
        
        for (var area of this.areas)
        {
            var row = [area[0]];
            var class_string = "";
            //Read the rest of the array in this area 
            //Construct a string "ENGL 101A, ENGL 101C ..."
            for (var i = 1; i < area.length; i++)
            {
                class_string += area[i];
                if (i != area.length - 1)
                {
                    class_string += ", ";
                }
            }
            //Set the second element of this row to the string
            row.push(class_string);
            //Push the row into the rows
            rows.push(row);
        }

        for (var row of rows)
        {
            this.add_row(row);
        }
    }

    async retrieveInfo()
    {
        var areas = await (await fetch("IGETCTable_template.json")).json();
        for (var area of areas)
        {
            var area_array = [area.area];
            for (var c of area.classes)
            {
                area_array.push(c);
            }
            this.areas.push(area_array);
        }
    }

    /** addRow
     * Add a row to the table
     * @param {Array} contents - An array containing strings
     */
    add_row(contents)
    {
        var newRow = document.createElement("tr");
        for (var content of contents)
        {
            var newElem = document.createElement("td");
            newElem.textContent = content;
            newRow.appendChild(newElem);
        }
        this.body.appendChild(newRow);
    }
}