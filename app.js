/** Ohlone's ./MakeMyFuture Online Schedule Builder
 * 
 * Welcome to Ohlone's Server-Side Driver app!
 * This file sets up the server and has it running on port 3000, (requires the existence
 * of the public folder on your local repository), while handling any POST and GET
 * requests made to the server by routing them to their respecitive functions.
 * 
 * Make sure to have dependencies installed beforehand by using node install.
 * 
 * Current dependencies:
 * express
 * 
 * @file app.js
 * @authors Pirjot Atwal,
 * @version 10/17/2021
 */

console.log("Welcome to ./MakeMyFuture! Setting up the server...");

//Setup the server by importing express and building the app.
const express = require('express');
const app = express();

//Serve the static files located in the public folder
app.use(express.static('public'));

//Begin listening for connections and print status to console
let listener = app.listen(3000, () => {
    console.log("Starting to listen at " + listener.address().port);
});