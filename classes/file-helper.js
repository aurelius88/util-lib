const fs = require( 'fs' );
const path = require( 'path' );

class FileHelper {

    constructor(mod, classes) {}

    /**
     * @description load json in UTF-8 from absolute path
     * @static
     * @param {string} path path to json file
     * @returns {Object|null} parsed json or null if error
     * @memberof FileHelper
     */
    loadJson( path ) {
        try {
            return JSON.parse( fs.readFileSync( path, "utf8" ) );
        } catch ( err ) {
            return null;
        }
    }

    /**
     * @description Resolve file path by root [default=__dirname]
     * @param  {[type]} head             relative path to root
     * @param  {[type]} [root=__dirname] root path
     * @return {[type]}                  absolute path
     * @memberof FileHelper
     */
    getFullPath( head, root = __dirname ) {
        return path.resolve( root, head );
    }

    /**
     * @description save object as json file
     * @static
     * @param {any} obj object to save
     * @param {any} path absolute path
     * @returns  {void|boolean} nothing or false if error
     * @memberof FileHelper
     */
    saveJson( obj, path ) {
        try {
            fs.writeFileSync( path, JSON.stringify( obj, null, 4 ) );
        } catch ( err ) {
            return false;
        }
    }

    readOpcodes(rawFile, jsonFile, map) {
        let data = FileHelper.loadJson(jsonFile);
        let newData = FileHelper.readOpcodesRaw(rawFile);
        if(!data) data = newData;
        else data.concat(newData);
        if(map) {
            data.map(x => map.set(x[0],x[1]))
        } else {
            map = new Map(data);
        }
        return map;
    }

    readOpcodesRaw( pathToFile, isKeyFirst = true ) {
        let objMap = {};
        let data = fs.readFileSync(path.join(__dirname, pathToFile), 'utf8');
        if(!data) throw new Error("[InputError]: Could not read file.");
        let lines = data.split(/\s*\r?\n\s*/);
        // init OPCODE_MAP
        for(let line of lines) {
            let divided = line.trim().split(/\s*=\s*|\s*\s\s*/);
            if(divided.length >= 2) {
                let key = parseInt(isKeyFirst ? divided[0] : divided[1]);
                let value = isKeyFirst ? divided[1] : divided[0];
                objMap[key] = value;
            }
        }
        return objMap;
    }

    groupOpcodes( map ) {
        let groupedMap = new Map();
        for(let e of map) {
            let divisionPos = e[1].indexOf('_');
            let group = e[1].slice(0, divisionPos);
            if(groupedMap.has(group)) {
                groupedMap.get(group).push(e[0]);
            } else {
                groupedMap.set(group, [e[0]]);
            }
        }
        return groupedMap;
    }
}

module.exports = FileHelper;
