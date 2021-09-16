const fs = require('fs');
const write = require('./write');

function create( leagueID, userID, clearance, info ) {
    var staffObject = {
        userID : userID,
        description : info.description,
        clearance : clearance,
        production : info.productionPos,
        administration : info.administrationPos
    }

    // write to disk and return promise
    let dataPath = `./servers/${leagueID}/staff/${userID}.json`;
    return write.writeJSON( staffObject, dataPath );

}

function edit() {
}

function destroy( leagueID, userID ) {
    if ( !leagueID || !userID )
        throw "Error: No leagueID or userID provided!";

    let dataPath = `./servers/${leagueID}/staff/${userID}.json`;

    try {
        fs.rmSync( dataPath );
    }
    catch (e) {
        console.log(e);
    }

    return new Promise( (resolve, reject) => {
        if ( fs.existsSync( dataPath ) )
            reject( `Something went wrong, (${dataPath}) still exists!` );
        else
            resolve( `File (${dataPath}) has been succesfully deleted!` );
    });
}

module.exports = { create, edit, destroy };