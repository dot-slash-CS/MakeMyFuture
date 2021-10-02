/** MakeMyFuture Analytics
 * The Analytics window is tied to user class selection and 
 * the schedule builder, and displays important statistics
 * like Units Satisfied, Units Needed, Recommended Units, 
 * etc. (Add to this list as needed)
 * 
 * Required DOM elements for Analytics successful execution.
 * TODO
 * 
 * @author Pirjot Atwal
 * @file Analytics.js
 * @version 04/03/2021
 */

class Analytics {

    /** initialize
     * Initializes the Analytics Class
     * 
     * The Analytics Class keeps track of a single Restrictions object,
     * which is updated by changes occuring in the Form, ClassRepo, and
     * ScheduleBuilder classes.
     * 
     * The Restrictions Object details necessary units (as defined by
     * the transfer/graduation requirements), maximum amount
     * of classes per semester (as defined by the user), and the necessary
     * classes (defined by multiple sources, mainly the IGETC and the
     * College Major Requirements).
     * 
     * Analytics should react to changes in these classes by listening
     * to events produced by their change. Analytics is also in charge
     * of updating a div with the relevant information pertaining
     * to the user's current configuration.
     * 
     */
    static initialize() {
        console.log("ANALYTICS INITIALIZE");

        Analytics.restrictions = {
            "MINUNITS": 60, //Min Units to complete for all classes in semesters
            "MAXPERSEMESTER": [4, 4, 4, 4], //Amount of Classes do be taken every semester
            "CLASSES": [], //Required classes to take (will probably take more data)
        }

        // Set variables
        Analytics.analytics_div = document.getElementById("analytics-div");

        Analytics.initializeContent();
    }

    static initializeContent() {
        Analytics.units_required = document.getElementById("units-required");
        Analytics.units_met = document.getElementById("units-met");
        Analytics.units_missing = document.getElementById("units-missing");
    }

    static calculateUnits(evt) {
        //Required stored in Form.credits
        let met = 0;

        //Get Met value
        for (let sem of ScheduleBuilder.semesters) {
            for (let clas of sem) {
                met += clas["UNITS"];
            }
        }

        Analytics.units_required.textContent = Form.credits;
        Analytics.units_met.textContent = met;
        Analytics.units_missing.textContent = Math.max(Form.credits - met, 0);
        //Provide ability to see units PER semester
        //Color Coding
    }
}

//From Form
document.addEventListener("Change Credits", Analytics.calculateUnits);
document.addEventListener("Change Semesters", Analytics.calculateUnits);
//From ScheduleBuilder
document.addEventListener("Semester Update", Analytics.calculateUnits);