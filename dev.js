/** dev.js
 * Updated a new parameter in the MongoDB database but need it updated over all accounts or schedules?
 * You came to the right place. All configuration scripts can be run here, the environment is setup for such
 * commands.
 */

console.log("DEV for MongoDB starting...");


const mongo = require('./mongodb-library.js');


async function main() {
    await mongo.connectClient();
    let accounts = await mongo.get_data({}, "Accounts", "accounts");

    for (let account of accounts) {
        let matchingProfiles = await mongo.get_data({username: account["username"]}, "Accounts", "profiles");
        if (matchingProfiles.length == 0) {
            let saveMe = {
                "TIME": (new Date()).getTime(),
                "USERNAME": account["username"],
                "DESCRIPTION": "Description not yet set.",
                "USER_ID": account["_id"].toString()
            };
            await mongo.add_data(saveMe, "Accounts", "profiles");
        }
    }
    console.log("Finished!");
}

main();

//On server/process closing, perform cleanup functions
process.on('SIGINT', () => {
    mongo.closeClient();
    console.log("\nCleaned Dev environment....");
    process.exit(0);
});