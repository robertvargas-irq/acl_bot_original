const fs = require('fs');

/**
 * Team Constructor
 * @param {string} leagueID The Discord server ID
 * @param {Object} info Team info
 * @param {string} info.teamName The team's name
 * @param {string} info.teamID The team's Discord role ID
 * @param {int} [info.leaguePos] 0: PL, 1: CL, 2: QL
 * @param {number} [info.activeSeasons] How many seasons they have played
 * @param {int} [info.winCount] Their respective season wins
 * @param {string} [info.biographyEntry] Biography entry
 * @returns Promise
 */
 function create( leagueID, info = {} ) {
    
    // check data
    if ( !leagueID )
        throw "Error: League ID required.";
    if ( !info.teamName || !info.teamID )
        throw "Error: No team name or team ID given.";

    // team data
    var team = {
        guild : leagueID,
        name : info.teamName,
        roleID : info.teamID,
        emojiID : info.emojiID || null,
        badges: info.badges || [],
        league : info.leaguePos || 'Not specified',
        seasons : info.activeSeasons || 0,
        wins : info.winCount || 0,
        mission: info.mission || null,
        biography : info.biographyEntry || 'Empty',
        logo : null,
        banner: null
    }
    
    // write new directory and json data file
    try {
        fs.mkdirSync( `./servers/${leagueID}/teams/${info.teamName}` );
        fs.writeFileSync( `./servers/${leagueID}/teams/${info.teamName}/teamInfo.json`, JSON.stringify(team, null, 2) );
    }
    catch (e) {
        console.error(e);
    }

    return new Promise( ( resolve, reject ) => {
        if ( fs.existsSync(`./servers/${leagueID}/teams/${info.teamName}`) )
            resolve( team );
        else
            reject(`Something went wrong, the profile was unable to be created. DIR (./servers/${leagueID}/teams/${info.teamName}) failed to create.`);
    });
}

/**
 * Search for team by name
 * @param {String} leagueID Guild ID
 * @param {String} teamName Team name
 * @returns {Object | Array | false} JSON Parsed Team Object | Array | false
 */
function get( leagueID, teamName ) {

    // check data
    if ( !leagueID || !teamName )
        throw 'Error: Missing leagueID or teamName';

    // parse search query
    let search;
    try {
        search = fs.readdirSync(`./servers/${leagueID}/teams`).filter(f => f.toLowerCase().startsWith(teamName.toLowerCase()));
        if ( search.length > 1 )
            return search;
        else if ( search.length < 1 ) {
            search = fs.readdirSync(`./servers/${leagueID}/teams`).filter(f => f.toLowerCase().includes(teamName.toLowerCase()));
            if ( search.length > 1 )
                return search;
            else if ( search.length < 1 )
                return false;
        }
    }
    catch (e) {
        throw console.error(e);
    }

    try {
        let fileRead = fs.readFileSync( `./servers/${leagueID}/teams/${search}/teamInfo.json` );
        var teamObject = JSON.parse( fileRead );
    }
    catch (e) {
        throw console.error(e);
    }

    return teamObject;
}

module.exports = { create, get };