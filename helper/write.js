const fs = require('fs');

/**
 * 
 * @param {Object} object Object to be saved as a JSON file
 * @param {String} path The directory path starting from directory home
 */
function writeJSON( object, path ) {

    object = JSON.stringify( object, null, 4 )

    console.group('write.writeJSON');
    try {
        console.log('Path: ' + path);
        console.log('Writing to disk...');
        fs.writeFileSync( path, object );
    }
    catch (e) {
        console.log('Something went wrong.');
    }
    finally {
        console.log('End of operation.');
        console.groupEnd();
    }

    return new Promise( (resolve, reject) => {

        if ( fs.existsSync( path ) )
            resolve(`The file was successfully written at (${path})`);
        else
            reject(`Something went wrong, (${path}) was unable to be written to.`);

    });
}


module.exports = { writeJSON };