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
     * @param {*} nameInputID 
     * @param {*} semeseterSpanID 
     * @param {*} semesterInputID 
     * @param {*} majorInputID 
     */
    static initialize(id, 
        nameInputID = "nameInput", 
        semeseterSpanID = "semesterSpan", 
        semesterInputID = "semesterInput", 
        majorInputID = "majorInput",
        creditInputID = "creditInput",
        creditSpanID = "creditSpan")
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
        //Credit Input
        Form.creditInput = document.getElementById(creditInputID);
        //Credit Span
        Form.creditSpan = document.getElementById(creditSpanID);
        //Credits variable (For Analytics)
        Form.credits = parseInt(Form.creditInput.value);

        Form.initializeContent();
    }

    /** initializeContent
     * 
     * Link the semester input bar to the semester span.
     * 
     */
    static initializeContent()
    {
        Form.semesterInput.addEventListener("change", Form.linkSemesterSlider);
        Form.creditInput.addEventListener("change", Form.linkCreditSlider);
    }

    /** linkSemesterSlider
     * 
     * Add an event listener to the semester input
     * to change to value on release of the input bar.
     * Execute a Change Semesters Event.
     * 
     * @param {Event} event
     */
    static linkSemesterSlider (event)
    {
        Form.semesterSpan.textContent = Form.semesterInput.value;

        let new_event = document.createEvent("HTMLEvents");
        new_event.semesters = parseInt(Form.semesterInput.value);
        new_event.initEvent("Change Semesters", true, true);
        document.dispatchEvent(new_event);
    }

    /** linkCreditSlider
     * 
     * Add an event listener to the credit input
     * to change to value on release of the input bar.
     * 
     * Execute a Credit Change Semester.
     * 
     * @param {Event} event 
     */
    static linkCreditSlider(event) {
        Form.creditSpan.textContent = Form.creditInput.value;
        Form.credits = parseInt(Form.creditInput.value);

        let new_event = document.createEvent("HTMLEvents");
        new_event.semesters = parseInt(Form.semesterInput.value);
        new_event.initEvent("Change Credits", true, true);
        document.dispatchEvent(new_event);
    }

    //Under development
}