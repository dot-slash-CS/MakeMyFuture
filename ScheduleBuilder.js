/** MakeMyFuture ScheduleBuilder
 * The ScheduleBuilder class helps build the schedule
 * based on the nodes selected on the IGETCTable.
 * 
 * Required DOM elements for ScheduleBuilder successful execution.
 * 
 * 
 * @author Pirjot Atwal
 * @file ScheduleBuilder.js
 * @version 04/03/2021
 */

class ScheduleBuilder
{
    constructor (id)
    {
        this.id = id;
        this.instance = document.getElementById(id);
        this.body = this.instance.getElementsByTagName("tbody")[0];
        this.initialize();
    }

    initialize()
    {
        
    }



}