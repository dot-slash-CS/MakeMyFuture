/** MakeMyFuture Form
 * The Form class is attached to the HTML Form page
 * and collects all of the information from the user
 * pertaining to their major and classes. 
 * 
 * Required DOM elements for Form successful execution.
 * form, id = IGETCForm
 * input, id = nameInput
 * input, id = semesterSpan
 * input, id = semesterInput
 * input, id = majorInput
 * 
 * @author Pirjot Atwal
 * @file Form.js
 * @version 06/06/2021
 */

class Form
{
    /** Form Constructor
     * 
     * Initializes the Form based on the provided attributes
     * 
     * @param {String} id The id of the form DOM element
     * @param {ScheduleBuilder} builder The ScheduleBuilder for linking the semester amount input to
     * @param {*} nameInputID 
     * @param {*} semeseterSpanID 
     * @param {*} semesterInputID 
     * @param {*} majorInputID 
     */
    constructor(id, builder, nameInputID = "nameInput", semeseterSpanID = "semesterSpan", semesterInputID = "semesterInput", majorInputID = "majorInput")
    {
        this.id = id;
        this.builder = builder;
        this.instance = document.getElementById(id);
        //Name Input Textbox
        this.nameInput = document.getElementById(nameInputID);
        //Semester Input display (number span), attached to slider below
        this.semesterSpan = document.getElementById(semeseterSpanID);
        //Semester Input Slider
        this.semesterInput = document.getElementById(semesterInputID);
        //Major Input Textbox
        this.majorInput = document.getElementById(majorInputID);

        this.initialize();
    }

    /** initialize
     * 
     * TODO: Build on initialization to read values
     * Link the semester input bar to the semester span.
     * 
     */
    initialize()
    {
        //Link semester input slider to semester span
        this.linkInputSlider();
    }

    /** linkInputSlider
     * 
     * Add an event listener to the semester input
     * to change to value on release of the input bar.
     * Also, change it in the semeseter builder.
     * 
     */
    linkInputSlider()
    {
        this.semesterInput.addEventListener("change", (evt) =>
        {
            this.semesterSpan.textContent = this.semesterInput.value;
            this.builder.update_header(parseInt(this.semesterInput.value));
        });
    }

    //Under development
}