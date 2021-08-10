/** MakeMyFuture Driver
 * Welcome to MakeMyFuture! This is the driver program for the webpage.
 * In this documentation, all required divs and their names are listed.
 * This program creates the instances of each class with respective
 * DOM elements on the page and attaches all events for user interaction on 
 * page load.
 * 
 * Required Div Elements and Tags for successful execution:
 * form, id = IGETCForm
 * table, id = IGETCTable
 * 
 * 
 * @author Pirjot Atwal
 * @file driver.js
 * @version 06/06/2021
 */

console.log("MakeMyFuture Driver Loaded");

let form, table, builder;

/** driver_run
 * Initialize the Form, Table, and ScheduleBuilder Classes.
 */
function driver_run()
{
    ClassRepo.initialize("demo_data.json");
    ScheduleBuilder.initialize("ScheduleBuilder");
    Form.initialize("IGETCForm");
    IGETCTable.initialize("IGETCTable", builder);
}

//Runs driver on DOMContentLoaded
document.addEventListener("DOMContentLoaded", driver_run);