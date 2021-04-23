/** MakeMyFuture Utility
 * This file contains all necessary helper and utility functions
 * necessary for other programs.
 * 
 * 
 * @author Pirjot Atwal
 * @file utility.js
 * @version 04/03/2021
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

/** Allowing Drag Drop Ability.
 * Set the element to be dragged around to have the following
 * attributes:
 * 
 * draggable = "true"
 * ondragstart = "drag(event)" (drag function)
 * id must be set.
 * 
 * Example:
 * <img src="img_w3slogo.gif" draggable="true" ondragstart="drag(event)" id="drag1" width="88" height="31">
 * 
 * The to and from drag nodes must have the following attributes:
 * 
 * ondrop = "drop(event)" (drop function)
 * ondragover = "allowDrop(event)" (allowDrop function)
 * id must be set.
 * 
 * Example:
 * <td id="sect1" ondrop="drop(event)" ondragover="allowDrop(event)">
 */

function allowDrop(evt) {
    evt.preventDefault();
}
  
function drag(evt) {
    evt.dataTransfer.setData("id", evt.target.id);
}
  
function drop(evt) {
    evt.preventDefault();
    var data = evt.dataTransfer.getData("id");
    evt.target.appendChild(document.getElementById(data));
}

/** gen_drag_button
 * Generates a new draggable button with the given parameters
 * and returns the node.
 * @param {String} text 
 * @param {String} id 
 * @returns Button
 */
function gen_drag_button(text, id)
{
    //Generate button, set its id, make it draggable
    var new_button = document.createElement("button");
    new_button.text = text;
    new_button.id = id;
    new_button.draggable = "true";
    new_button.addEventListener("ondragstart", (evt) => drag(evt));
    return new_button;
}