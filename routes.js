/** 
 * This file contains the translation of route functions
 * for ./MakeMyFuture's app POST and GET functions. Each
 * function here takes a request and response, and performs
 * a body of operations to achieve a needed effect.
 * 
 * 
 * @file routes.js
 * @authors Pirjot Atwal,
 * @version 11/01/2021
 */

//NEEDED REQUIREMENTS (INCLUDE NEW MODULES AS NEEDED)
// const mongo = require("./mongodb-library.js");


function main(req, res) {
    res.send({data: "This is from the main route!"});
}

function post_schedule(req, res) {
    
}

module.exports = {
    main
}