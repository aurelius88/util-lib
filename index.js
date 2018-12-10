const fs = require( "fs" );
const path = require( "path" );

const CLASSES = retrieveClassNames();

function retrieveClassNames() {
    let files = fs.readdirSync( path.join( __dirname, "classes" ) );
    return files.map( file => file.substring( 0, file.lastIndexOf( "." ) ) );
}

class UtilLib {
    constructor( mod, version ) {
        this.classes = {};
        this.command = mod.command;
        this.cmd = this.command;

        function loadAllClasses() {
            for ( let name of CLASSES ) {
                try {
                    let tmp = require( `./classes/${name}` );
                    this.classes[name] = tmp;
                    this[name] = this.classes[name];
                } catch ( e ) {
                    mod.error( e );
                    mod.error( `Failed to load class ${name}.` );
                }
            }
        }

        if ( version || mod.majorPatchVersion ) loadAllClasses.call( this );
        else mod.hook( "C_LOGIN_ARBITER", "raw", loadAllClasses.bind( this ) );
    }
}

module.exports = UtilLib;
