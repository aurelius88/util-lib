const fs = require( "fs" );
const path = require( "path" );

class FileHelper {
    constructor() {}

    /**
     * @description load json in UTF-8 from absolute path
     * @static
     * @param {string} path path to json file
     * @returns {object|array|null} parsed json or null if error
     * @memberof FileHelper
     */
    static loadJson( path: string ) {
        try {
            return JSON.parse( fs.readFileSync( path, "utf8" ) );
        } catch ( err ) {
            return null;
        }
    }

    loadJson( path: string ) {
        return FileHelper.loadJson( path );
    }

    /**
     * @description Resolve file path by root [default=__dirname]
     * @param  {string} head             relative path to root
     * @param  {string} [root=__dirname] root path
     * @return {string}                  absolute path
     * @memberof FileHelper
     */
    static getFullPath( head: string, root = __dirname ) {
        return path.resolve( root, head );
    }

    getFullPath( head: string, root = __dirname ) {
        return FileHelper.getFullPath( head, root );
    }

    /**
     * @description save object as json file
     * @static
     * @param {any} obj object to save
     * @param {string} path absolute path
     * @returns  {void|boolean} nothing or false if error
     * @memberof FileHelper
     */
    static saveJson( obj: any, path: string ) {
        if ( typeof path !== "string" )
            throw new TypeError( `2nd argument "path" must be a string. But was ${typeof path}.` );
        try {
            fs.writeFileSync( path, JSON.stringify( obj, null, 4 ) );
            return true;
        } catch ( err ) {
            return false;
        }
    }

    saveJson( obj: any, path: string ) {
        return FileHelper.saveJson( obj, path );
    }

    static readOpcodes( rawFile: string, jsonFile: string, map?: Map<string|number, string> ) {
        let data = FileHelper.loadJson( jsonFile );
        let newData = FileHelper.readOpcodesRaw( rawFile );
        if ( !data ) 
            data = newData;
        else 
            data.concat( newData );
        if ( map !== undefined ) {
            data.map( (x:[key:string|number, value: string]) => map?.set( x[0], x[1]) );
        } else {
            map = new Map( data );
        }
        return map;
    }

    readOpcodes( rawFile: string, jsonFile: string, map?: Map<string|number, string> ) {
        return FileHelper.readOpcodes( rawFile, jsonFile, map );
    }

    static readOpcodesRaw( pathToFile: string, isKeyFirst = true ) {
        let objMap: {[opcode: string|number]: string} = {};
        let data = fs.readFileSync( path.join( __dirname, pathToFile ), "utf8" ) as string | undefined;
        if ( !data ) 
            throw new Error( "[InputError]: Could not read file." );
        let lines = data.split( /\s*\r?\n\s*/ );
        // init OPCODE_MAP
        for ( let line of lines ) {
            let divided = line.trim().split( /\s*=\s*|\s*\s\s*/ );
            if ( divided.length >= 2 ) {
                if( !isKeyFirst )
                    divided.reverse();
                objMap[divided[0]] = divided[1];
            }
        }
        return objMap;
    }

    readOpcodesRaw( pathToFile: string, isKeyFirst = true ) {
        return FileHelper.readOpcodesRaw( pathToFile, isKeyFirst );
    }

    static groupOpcodes( opcodeDefMap: Map<string|number, string|number> ) {
        let groupedMap = new Map<string, number[]>();
        for ( let [key, value] of opcodeDefMap ) {
            let opcode: number;
            let def: string;
            if ( Array.isArray( key ) || !Number.isInteger( Number( key ) ) ) {
                def = key as string;
                opcode = value as number;
            } else {
                def = value as string;
                opcode = key as number;
            }
            let divisionPos = def.indexOf( "_" );
            let group = def.slice( 0, divisionPos );
            if ( groupedMap.has( group ) ) {
                groupedMap.get( group )!.push( opcode );
            } else {
                groupedMap.set( group, [opcode]);
            }
        }
        return groupedMap;
    }

    groupOpcodes( map: Map<string|number, string|number> ) {
        return FileHelper.groupOpcodes( map );
    }
}

export = FileHelper
