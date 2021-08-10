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
    /** Form Initialize
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
    static initialize(id, nameInputID = "nameInput", semeseterSpanID = "semesterSpan", semesterInputID = "semesterInput", majorInputID = "majorInput")
    {
        Form.id = id;
        Form.instance = document.getElementById(id);
        //Name Input Textbox
        Form.nameInput = document.getElementById(nameInputID);
        //Semester Input display (number span), attached to slider below
        Form.semesterSpan = document.getElementById(semeseterSpanID);
        //Semester Input Slider
        Form.semesterInput = document.getElementById(semesterInputID);
        //Major Input Textbox
        Form.majorInput = document.getElementById(majorInputID);

        Form.initializeContent();
    }

    /** initializeContent
     * 
     * TODO: Build on initialization to read values
     * Link the semester input bar to the semester span.
     * 
     */
    static initializeContent()
    {
        //Link semester input slider to semester span
        Form.linkInputSlider();
    }

    /** linkInputSlider
     * 
     * Add an event listener to the semester input
     * to change to value on release of the input bar.
     * Also, change it in the semeseter builder.
     * 
     */
    static linkInputSlider()
    {
        Form.semesterInput.addEventListener("change", (evt) =>
        {
            Form.semesterSpan.textContent = Form.semesterInput.value;
            ScheduleBuilder.update_header(parseInt(Form.semesterInput.value));
        });
    }

    //Under development
}