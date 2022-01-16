/** 
 * This file contains the translation of route functions
 * for ./MakeMyFuture's app POST and GET functions. Each
 * function here takes a request and response, and performs
 * a body of operations to achieve a needed effect.
 * 
 * 
 * @file routes.js
 * @authors Pirjot Atwal,
 * @version 01/06/2022
 */

//NEEDED REQUIREMENTS (INCLUDE NEW MODULES AS NEEDED)
const mongo = require('./mongodb-library.js');
const accounts = require('./accounts.js')
const fs = require('fs');

/**
 * Sign up an account, manipulating the user's cookies to store their special session ID.
 * 
 * @param {*} req expects req.body to be equivalent to a JSON of the following structure
 * {
 *      username: {STRING},
 *      password: {STRING},
 *      email: {STRING}
 * }
 * @param {*} res 
 * @returns a response on whether the user's request was successful. If it was, 
 * a session is automatically issued and the cookie is set. Of the form:
 * {
 *      info: "ACCOUNT CREATED" / ...
 *      account_created: true / false
 * }
 */
async function sign_up(req, res) {
    //TODO: Perform some error checking possibly, parsing, cleaning up,etc.
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    //Sign up the account
    let sign_up_response = await accounts.sign_up(username, password, email);

    if (sign_up_response["account_created"]) {
        //Issue a new session using the account's _id
        let session_response = await accounts.issue_session(sign_up_response["user_id"]);

        res.cookie("session", session_response["hash"], {
            maxAge: 5 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });
    }
    res.send({
        "info": sign_up_response["info"],
        "account_created": sign_up_response["account_created"]
    });
}

/**
 * Login in a user. Sets session in cookie (for 24 hours.)
 * @param {*} req The request should have a body that has the following structure:
 * {
 *      username: {STRING},
 *      password: {STRING}
 * }
 * @param {*} res The result is a JS object of the following structure:
 * {
 *      loggedIn: true / false,
 *      info: {STRING},
 * }
 */
async function login(req, res) {
    //TODO: Perform some error checking possibly, parsing, cleaning up, etc.
    let username = req.body.username;
    let password = req.body.password;
    let login_response = {
        info: "FAILED",
        "loggedIn": false
    }
    try {
        login_response = await accounts.login(username, password);

        if (login_response["loggedIn"]) {
            //Issue a new session using the account's _id
            let session_response = await accounts.issue_session(login_response["user_id"]);
            res.cookie("session", session_response["hash"], {
                maxAge: 5 * 24 * 60 * 60 * 1000,
                httpOnly: true
            });
        }
    } catch (error) {
        console.log("An Error Occurred in the Login Function... " + error.message);
    }

    res.send({
        "info": login_response["info"],
        "loggedIn": login_response["loggedIn"]
    });
}

/**
 * Logout, deleting the session cookie.
 * @param {*} req 
 * @param {*} res 
 * {
 *      info: [STRING]
 * }
 */
async function logout(req, res) {
    try {
        let x = req.cookies["session"];
    } catch (error) {
        res.send({
            "info": "You're not signed in."
        });
        return;
    }
    res.clearCookie("session");
    res.send({
        "info": "You have been logged out."
    });
}

/**
 * Post a user's schedule to the database.
 * @param {*} req A request object with a body of the following structure:
 * {
 *      schedule: SCHEDULE STRUCTURE
 * }
 * @param {*} res 
 * {
 *      success: true / false
 * }
 */
async function post_schedule(req, res) {
    let verify_response = await accounts.verify_session(req.cookies["session"]);
    let update_response = {
        success: false
    };

    if (verify_response["valid"]) {
        req.body.schedule.user_id = verify_response.user_id;
        req.body.schedule.time_created = (new Date()).getTime();
        update_response = await accounts.upload_schedule(verify_response["user_id"], req.body.schedule);
    }

    res.send(update_response);
}

/**
 * A function meant to be run on every page load, verifying if the user's session
 * is valid.
 * The user will send a Request object in which the cookies are stored.
 * If the session cookie exists and the session (hash) is valid, then the session
 * is valid. Otherwise, the session is invalid.
 * 
 * 
 * @param {*} req 
 * @param {JSON} res An object of the form:
 * {
 *      isSignedIn: true / false,
 *      username: [STRING],
 *      data: [STRING]
 * }
 */
async function verify_session(req, res) {
    let response = {
        isSignedIn: false,
        username: null,
        data: null
    };
    if (req.cookies["session"] == undefined) {
        res.send(response);
        return;
    }
    
    let verify_response = await accounts.verify_session(req.cookies["session"]);
    if (verify_response["valid"]) {
        response.isSignedIn = true;
        response.username = await accounts.get_account_username(verify_response["user_id"]);
    }
    res.send(response);
}

/**
 * Using the query object in the body, return some data from the catalog json file.
 * If the query was not recognized, return the entire file.
 * 
 * @param {JSON} req A JS object with a body equivalent to the following:
 * {
 *      query: [STRING], 
 *             "AREAS" = The AREAS array, holding JS objects that point each AREA ACR to its full name.
 *             "CLASSES" = The CLASSES array, expecting the acr to also be attached in the acr property.
 *             "CLASS" = A CLASS object, matching the provided acr.
 * }
 * @param {*} res An object of the form:
 * {
 *      result: [OF VARYING TYPE DEPENDING ON QUERY]
 * }
 */
async function query_data(req, res) {
    // Get the data
    let data = JSON.parse(fs.readFileSync("2021_2022_class_data.json"));
    let query = req.body.query;

    if (query == "AREAS") {
        res.send(data["AREAS"]);
    } else if (query == "CLASSES") {
        // Select all classes that match acr.
        let classes = [];
        for (let course of data["CLASSES"]) {
            if (course["AREA"] == req.body.acr) {
                classes.push(course);
            }
        }
        res.send(classes);
    } else if (query == "CLASS") {
        let course = null;
        for (let object of data["CLASSES"]) {
            if (object["AREA-ACR"] == req.body.acr) {
                course = object;
            }
        }
        res.send(course);
    } else {
        res.send(data);
    }
}

/**
 * Get the schedules that belong to the user. Returns the schedules as
 * an array. If the user is not logged in, returns null.
 * 
 * @param {JSON} req Assumes this is a get method.
 * @param {JSON} res Returns a JS object of the following format:
 * {
 *      success: true / false,
 *      data: [{SCHEDULE FORMAT}] / null
 * }
 */
async function get_user_schedules(req, res) {
    try {
        let verify_response = await accounts.verify_session(req.cookies["session"]);
        let get_response = {success: false, data: null};

        if (verify_response["valid"]) {
            let user_data = await accounts.get_user_schedules(verify_response["user_id"]);
            get_response.success = true;
            get_response.data = user_data;
        }
        res.send(get_response);
    } catch (error) {
        res.send({success: false, error: error.message});
    }
}

/**
 * Create a new template schedule in the accounts database
 * given the provided information.
 * @param {JSON} req A JS Object with a body of the following structure
 * {
 *      majors: Array of Strings,
 *      universities: Array of Strings,
 *      name: String,
 * }
 * @param {JSON} res A JS object with an info property.
 */
async function create_schedule(req, res) {
    try {
        let verify_response = await accounts.verify_session(req.cookies["session"]);
        if (verify_response["valid"]) {
            await accounts.create_schedule(verify_response["user_id"], req.body.majors, req.body.universities, req.body.name);
            res.send({"info": "SUCCESS"});
            return;
        } else {
            res.send({"info": "THE USER IS NOT SIGNED IN."});
            return;
        }
    } catch (error) {
        console.log("AN ERROR OCCURRED IN SCHEDULE CREATION. " + error.message);
    }
    res.send({"info": "AN ERROR OCCURRED IN SCHEDULE CREATION."});
}

/**
 * Delete a schedule with a given name.
 * 
 * @param {JSON} req A JS Object with a body of the following type
 * {
 *      name: [STRING]
 * }
 * @param {*} res 
 */
async function delete_schedule(req, res) {
    try {
        let verify_response = await accounts.verify_session(req.cookies["session"]);
        if (verify_response["valid"]) {
            await accounts.delete_schedule(verify_response["user_id"], req.body.name);
            res.send({"info": "SUCCESS"});
            return;
        } else {
            res.send({"info": "THE USER IS NOT SIGNED IN."});
            return;
        }
    } catch (error) {
        console.log("AN ERROR OCCURRED IN SCHEDULE DELETION. " + error.message);
    }
    res.send({"info": "AN ERROR OCCURRED IN SCHEDULE DELETION."});
}

/**
 * Fetch a schedule for a provided name.
 * 
 * @param {JSON} req A JS object with a body of the following structure:
 * {
 *      name: [STRING]
 * }
 * @param {JSON} res The Schedule Object in schedule notation
 */
async function fetch_schedule(req, res) {
    try {
        let verify_response = await accounts.verify_session(req.cookies["session"]);
        if (verify_response["valid"]) {
            res.send(await accounts.fetch_schedule(verify_response["user_id"], req.body.name));
            return;
        } else {
            res.send({"info": "THE USER IS NOT SIGNED IN."});
            return;
        }
    } catch (error) {
        console.log("AN ERROR OCCURRED IN SCHEDULE FETCHING. " + error.message);
    }
    res.send({"info": "AN ERROR OCCURRED IN SCHEDULE FETCHING."});
}

/**
 * Edit a schedule by either removing or adding a class.
 * @param {JSON} req A JS object with a body of the following type
 * {
 *      type: "ADD" / "REMOVE"
        name: [STRING],
        acr: [STRING],
        season: [STRING],
        year: [STRING]
 * }
 * @param {*} res 
 */
async function edit_schedule(req, res) {
    try {
        let verify_response = await accounts.verify_session(req.cookies["session"]);
        if (verify_response["valid"]) {
            res.send(await accounts.edit_schedule(verify_response["user_id"], req.body.type, req.body.name, req.body.acr, req.body.season, req.body.year));
            return;
        } else {
            res.send({"info": "THE USER IS NOT SIGNED IN."});
            return;
        }
    } catch (error) {
        console.log("AN ERROR OCCURRED IN SCHEDULE EDITING. " + error.message);
    }
    res.send({"info": "AN ERROR OCCURRED IN SCHEDULE EDITING. " + error.message});
}

/**
 * Fetch the JSON file for majors and colleges. (Currently using global majors)
 * @param {*} req 
 * @param {*} res 
 */
async function fetch_major_colleges(req, res) {
    let data = JSON.parse(fs.readFileSync("major_colleges.json"));
    res.send(data);
}

/**
 * Fetch all schedules in batch
 * @param {*} req A JS object with a body of the following:
 * {
 *      queries: [JSON],
 *      dateRange: [ARRAY OF NUMBERS]
 *      sortOption: [STRING],
 *      matching: [BOOLEAN],
 *      page: [NUMBER],
 *      majors: [ARRAY OF STRINGS],
 *      universities: [ARRAY OF STRINGS]
 * }
 * @param {*} res An array of schedules
 */
async function fetch_schedules_batch(req, res) {
    try {
        let verify_response = await accounts.verify_session(req.cookies["session"]);
        if (verify_response["valid"]) {
            res.send(await accounts.fetch_schedules_batch(req.body.queries, req.body.dateRange, req.body.sortOption, req.body.matching, req.body.majors, req.body.universities, req.body.page));
            return;
        } else {
            res.send({"info": "THE USER IS NOT SIGNED IN."});
            return;
        }
    } catch (error) {
        console.log("AN ERROR OCCURRED IN SCHEDULE BATCH FETCHING. " + error.message);
    }
    res.send({"info": "AN ERROR OCCURRED IN SCHEDULE BATCH FETCHING. " + error.message});
}

module.exports = {
    sign_up,
    login,
    logout,
    verify_session,
    post_schedule,
    query_data,
    get_user_schedules,
    create_schedule,
    delete_schedule,
    fetch_schedule,
    edit_schedule,
    fetch_major_colleges,
    fetch_schedules_batch
}