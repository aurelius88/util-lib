const fs = require( "fs" );
const path = require( "path" );

class FileHelper {
    constructor() {}

    /**
     * @description load json in UTF-8 from absolute path
     * @static
     * @param {string} path path to json file
     * @returns {Object|null} parsed json or null if error
     * @memberof FileHelper
     */
    static loadJson( path ) {
        try {
            return JSON.parse( fs.readFileSync( path, "utf8" ) );
        } catch ( err ) {
            return null;
        }
    }

    loadJson( path ) {
        return FileHelper.loadJson( path );
    }

    /**
     * @description Resolve file path by root [default=__dirname]
     * @param  {[type]} head             relative path to root
     * @param  {[type]} [root=__dirname] root path
     * @return {[type]}                  absolute path
     * @memberof FileHelper
     */
    static getFullPath( head, root = __dirname ) {
        return path.resolve( root, head );
    }

    getFullPath( head, root = __dirname ) {
        return FileHelper.getFullPath( head, root );
    }

    /**
     * @description save object as json file
     * @static
     * @param {any} obj object to save
     * @param {any} path absolute path
     * @returns  {void|boolean} nothing or false if error
     * @memberof FileHelper
     */
    static saveJson( obj, path ) {
        if ( typeof path !== "string" )
            throw new TypeError( `2nd argument "path" must be a string. But was ${typeof path}.` );
        try {
            fs.writeFileSync( path, JSON.stringify( obj, null, 4 ) );
            return true;
        } catch ( err ) {
            return false;
        }
    }

    saveJson( obj, path ) {
        return FileHelper.saveJson( obj, path );
    }

    static readOpcodes( rawFile, jsonFile, map ) {
        let data = FileHelper.loadJson( jsonFile );
        let newData = FileHelper.readOpcodesRaw( rawFile );
        if ( !data ) data = newData;
        else data.concat( newData );
        if ( map ) {
            data.map( x => map.set( x[0], x[1]) );
        } else {
            map = new Map( data );
        }
        return map;
    }

    readOpcodes( rawFile, jsonFile, map ) {
        return FileHelper.readOpcodes( rawFile, jsonFile, map );
    }

    static readOpcodesRaw( pathToFile, isKeyFirst = true ) {
        let objMap = {};
        let data = fs.readFileSync( path.join( __dirname, pathToFile ), "utf8" );
        if ( !data ) throw new Error( "[InputError]: Could not read file." );
        let lines = data.split( /\s*\r?\n\s*/ );
        // init OPCODE_MAP
        for ( let line of lines ) {
            let divided = line.trim().split( /\s*=\s*|\s*\s\s*/ );
            if ( divided.length >= 2 ) {
                let key = parseInt( isKeyFirst ? divided[0] : divided[1]);
                let value = isKeyFirst ? divided[1] : divided[0];
                objMap[key] = value;
            }
        }
        return objMap;
    }

    readOpcodesRaw( pathToFile, isKeyFirst = true ) {
        return FileHelper.readOpcodesRaw( pathToFile, isKeyFirst );
    }

    static groupOpcodes( opcodeDefMap ) {
        let groupedMap = new Map();
        for ( let [opcode, def] of opcodeDefMap ) {
            if( Array.isArray( opcode ) || Number.isInteger( parseInt( opcode ) ) ) {
                let tmpDef = def;
                def = opcode;
                opcode = tmpDef;
            }
            let divisionPos = def.indexOf( "_" );
            let group = def.slice( 0, divisionPos );
            if ( groupedMap.has( group ) ) {
                groupedMap.get( group ).push( opcode );
            } else {
                groupedMap.set( group, [opcode]);
            }
        }
        return groupedMap;
    }

    groupOpcodes( map ) {
        return FileHelper.groupOpcodes( map );
    }
}

module.exports = FileHelper;
