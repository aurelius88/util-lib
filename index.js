require("child_process").exec(`npm i`, { cwd: __dirname }, (error, stdout, stderr) => {
    if(error) {
        console.error(`[utility-box] exec error: ${error}`);
        return;
    }
} );

const fs = require( "fs" );
const path = require( "path" );

const CLASS_PATH = path.join( __dirname, "classes" );
const DATA_PATH = path.join( __dirname, "data" );
const CLASSES = retrieveFileNames( CLASS_PATH );
const DATA = retrieveFileNames( DATA_PATH );

function retrieveFileNames( dir ) {
    let files = fs.readdirSync( dir );
    return files.map( file => file.substring( 0, file.lastIndexOf( "." ) ) );
}

function load( dir, files, mod ) {
    let loaded = {};
    for ( let name of files ) {
        try {
            loaded[name] = require( `./${path.posix.join( path.relative( __dirname, dir ), name )}` );
        } catch ( e ) {
            mod.error( e );
            mod.error( `Failed to load class ${name}.` );
        }
    }
    return loaded;
}

class UtilLib {
    constructor( mod, base ) {
        this.classes = {};
        this.command = mod.command;
        this.cmd = this.command;
        this.data = {};
        this.mod = mod;
        this.base = base;
        if ( mod.majorPatchVersion ) this.loadAll();
        else mod.hook( "C_LOGIN_ARBITER", "raw", this.loadAll.bind( this ) );
    }

    loadAll() {
        this.loadClasses();
        this.loadData();
    }

    loadClasses() {
        this.classes = load( CLASS_PATH, CLASSES, this.mod );
        for ( let name of CLASSES ) this[name] = this.classes[name];
    }

    loadData() {
        this.data = load( DATA_PATH, DATA, this.mod );
    }
}

module.exports = {
    NetworkMod: UtilLib,
    RequireInterface: ( globalMod, clientMod, networkMod, requiredBy ) => networkMod,
};
