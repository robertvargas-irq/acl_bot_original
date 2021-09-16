const { info } = require('console');
const fs = require('fs');
const write = require('./write.js');

/**
 * User Constructor
 * @param {string} leagueID This Discord server ID
 * @param {string} userID The user's Discord ID
 * @param {boolean} isPlayer Is the user a player on a team?
 * @param {boolean} isStaff Is the user a staff member?
 * @param {string} ubisoftName The user's PC Ubisoft username
 * @returns Promise
 */
 function create( leagueID, userID, info = {} ) {
    let user = {
        userID: userID,
        guild: leagueID,
        quote: info.quote || null,
        badges: info.badges || [],
        bio: info.bio || null,
        team: info.team || false,
        staff: info.staff || [],
        ubisoft: info.ubisoftName || null,
        player: {
            position: null,
            attack: null,
            defense: null
        }
    }

    // write json data to file and return promise
    let dataPath = `./servers/${leagueID}/users/${userID}.json`;
    return write.writeJSON( user, dataPath );
}

/**
 * Fetch user object from userID
 * @param {string} leagueID The Discord server ID
 * @param {string} userID The user's Discord ID
 * @returns User Object
 */
function get( leagueID, userID ) {

    // check data
    if ( !leagueID || !userID )
        throw 'Error: Missing leagueID or userID';

    // get user from JSON
    try {
        let dir = `./servers/${leagueID}/users/${userID}.json`;
        if ( !fs.existsSync( dir ) )
            return false;
        let fileRead = fs.readFileSync( dir );
        var userObject = JSON.parse( fileRead );
    }
    catch (e) {
        throw console.log(e);
    }

    return userObject;
}

/**
 * Fetch user object by text
 * @param {string} leagueID The Discord server ID
 * @param {string} username User-inputted name
 * @param {message} messageData Message object
 * @returns User object
 */
function getFromName( leagueID, username, messageData ) {

    // check data
    if ( !leagueID || !username )
        throw 'Error: Missing leagueID or username query';

    // search
    let usernameSearch = searchHelper( leagueID, username, messageData );
    return get( leagueID, usernameSearch.id );

}

function searchHelper( leagueID, username, messageData ) {

    // search
    messageData.client.guilds.cache.get(leagueID);
    let member = messageData.client.users.cache.find( u => u.username.startsWith( username ));

    if ( member.size > 1 )
        throw 'Error: More than one user was found!';
    else if ( member.size < 1 )
        throw 'Error: No user found!';
    
    return member;

}

module.exports = { create, get, getFromName };