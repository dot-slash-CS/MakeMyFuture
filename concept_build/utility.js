/** MakeMyFuture Utility
 * This file contains all necessary helper and utility functions
 * necessary for other programs.
 * 
 * 
 * @author Pirjot Atwal
 * @file utility.js
 * @version 06/06/2021
 */

/**  collect_to_arr
 * Converts a collection to an Array
 * @param {HTMLCollection} collection - The collection to convert
 * @returns {Array} arr with contents of collection
 */
function collect_to_arr(collection)
{
    return Array.prototype.slice.call(collection);
}

//Drag Drop Utility

/** Allowing Drag Drop Ability:
 * Set the element to be dragged around to have the following
 * attributes:
 * 
 * draggable = "true"
 * ondragstart = "drag(event)" (drag function) (dragstart event with listeners)
 * id must be set.
 * 
 * Example:
 * <img src="img_w3slogo.gif" draggable="true" ondragstart="drag(event)" id="drag1" width="88" height="31">
 * 
 * The to and from drag nodes must have the following attributes:
 * 
 * ondrop = "drop(event)" (drop function) (drop event with listeners)
 * ondragover = "allowDrop(event)" (allowDrop function) (dragover event with listeners)
 * id must be set.
 * 
 * Example:
 * <td id="sect1" ondrop="drop(event)" ondragover="allowDrop(event)">
 */

function allowDrop(evt) {
    evt.preventDefault();
}

/** drag
 *  Refer to allowDrop documentation.
 */  
function drag(evt) {
    evt.dataTransfer.setData("id", evt.target.id);
}
  
/** drop
 *  Refer to allowDrop documentation.
 */  
function drop(evt) {
    evt.preventDefault();
    let data = evt.dataTransfer.getData("id");
    evt.target.appendChild(document.getElementById(data));
}

/** gen_drag_button
 * Generates a new draggable button with the given parameters
 * and returns the node.
 * @param {String} text 
 * @param {String} id 
 * @param {Function} drag_start
 * @returns Button
 */
function gen_drag_button(text, id, drag_start = (evt) => drag(evt))
{
    //Generate button, set its id, make it draggable
    let new_button = document.createElement("button");
    new_button.textContent = text;
    new_button.id = id;
    new_button.draggable = "true";
    new_button.addEventListener("dragstart", (evt) => drag_start(evt));
    return new_button;
}

//Delay utility for async functions
const delay = (ms = 500) => new Promise(res => setTimeout(res, ms));