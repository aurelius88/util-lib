const binarySearch = require( "binary-search" );
const util = require( "util" );

/**
 * Manages hooks by grouping and storing their source and hook objects, when hooked.
 */
class HookManager {
    constructor( mod ) {
        this.hookTemplates = new Map();
        this.activeHooks = new Map();
        this.mod = mod;
    }

    /**
     * The active hooks.
     * @returns a map of group -> list of active hooks.
     * (\{group: groupname, args: [arg array], hook: hook\} array)
     */
    getActiveHooks() {
        return new Map( this.activeHooks );
    }

    /**
     * The hook templates.
     * @returns a map of group -> list of hook templates ([hook arg array] array)
     */
    getHookTemplates() {
        return new Map( this.hookTemplates );
    }

    /**
     * Returns the hook template with the specified id or an empty object
     * if there was no template found.
     * @param  {[type]} group The name of the group.
     * @param  {[type]} id    The id of the template.
     * @return {[type]}       the template with the specified id or an empty object
     *                        if there was no template found.
     */
    getHookTemplateById( group, id ) {
        let hookTemplateArray = this.hookTemplates.get( group );
        for( let template of hookTemplateArray ) {
            if( template.id === id ) return Object.assign({ group }, template );
        }
        return {};
    }

    /**
     * Returns the index of the specified hook within the specified group.
     * @param  {string|number} group    the name of the group
     * @param  {...Array} hookArgs      the arguments of the hook (name, version, [options], callback)
     * @return {number}     the index of the hook. If the hook could not be found,
     *                      it will return a negative index containing the last visited
     *                      index.
     */
    getHookIndex( group, ...hookArgs ) { // hookArgs: [def, version, [opt], cb]
        //     [ { args           , id } ]
        // <=> [ { [d, v, [o], cb], id } ]
        let hookTemplateArray = this.hookTemplates.get( group );
        let idx = binarySearch( hookTemplateArray, { args: hookArgs }, HookManager._compareTemplates );
        return idx;
    }

    /**
     * Returns the hook index with specified id.
     * @param  {string|number} group [description]
     * @param  {number} id    [description]
     * @return {number}       [description]
     */
    getHookIndexById( group, id ) {
        let hookTemplateArray = this.hookTemplates.get( group );
        for( let i = 0; i < hookTemplateArray.length; i++ ) {
            if( hookTemplateArray[i].id === id ) return i;
        }
        return {};
    }

    /**
     * Adds a grouped hook. Sorted insertion.
     * @param group       the name of the group.
     * @param hookArgs    the arguments of the hook (name, version, [options], callback)
     * @returns     a hook template to identify the hook or an empty object
     *              if the same template is already added. \{group, args, id\}
     */
    addTemplate( group, ...hookArgs ) {
        if ( !["string", "number"].includes( typeof group ) )
            throw new TypeError( "group should be a string or a number." );
        if ( !hookArgs || hookArgs.length < 3 ) {
            throw new Error(
                `ArgumentError: Missing arguments in\n
                ${JSON.stringify( hookArgs )}\n
                (length: ${hookArgs ? hookArgs.length : "Not even an array"}, but should be 3 or 4).`
            );
        }
        if ( hookArgs.length > 4 ) {
            throw new Error( `ArgumentError: Too many arguments. There were ${hookArgs.length}, but should be 3 or 4.` );
        }
        let id = 0;
        if ( this.hookTemplates.has( group ) ) {
            let hookTemplateArray = this.hookTemplates.get( group );
            let size = hookTemplateArray.length;
            if( size > 0 ) id = hookTemplateArray[size - 1].id + 1;
            let idx = this.getHookIndex( group, ...hookArgs );
            // sorted insert if not already added
            if ( idx < 0 ) hookTemplateArray.splice( ~idx, 0, { args: hookArgs, id: id });
            else return {}; // already added
        } else {
            this.hookTemplates.set( group, [{ args: hookArgs, id: id }]);
        }
        return { group: group, args: hookArgs, id: id };
    }

    /**
     * Removes a hook by an hook object containing group and template.
     * @param hookObj     The obj containing the group and the hook arguments:
     *                  \{group: <name>, args: <[arguments]>, id: <id>\}
     * @returns     true if removal was successful, otherwise false.
     */
    removeTemplate( templateObj ) {
        let hookTemplateArray = this.hookTemplate.get( templateObj.group );
        if ( !hookTemplateArray ) return false;
        let element = { args: templateObj.args, id: templateObj.id };
        let index = binarySearch( hookTemplateArray, element , HookManager._compareTemplates );
        return this._removeTemplateAt( templateObj.group, index, hookTemplateArray );
    }

    /**
     * Removes a grouped hook template within the group named group at position index.
     * @param group   The group name.
     * @param index   The index of the hook to be removed inside the group.
     * @returns     true if removal was successful, otherwise false.
     */
    removeTemplateAt( group, index ) {
        if ( this.hookTemplates.has( group ) ) {
            return this._removeTemplateAt( group, index, this.hookTemplates.get( group ) );
        }
        return false;
    }

    /**
     * Removes a grouped hook template within the group named group at position index.
     * @param  {string|number} group    The group name.
     * @param  {number} index           The index of the element to be removed.
     * @param  {Array}  hookTemplateArray   The array containing the element to be removed.
     * @return {boolean}                true if removals was successful, otherwise false.
     */
    _removeTemplateAt( group, index, hookTemplateArray ) {
        if ( group && index >= 0 ) {
            if ( hookTemplateArray.length > 1 ) return hookTemplateArray.splice( index, 1 ).length;
            // last element to be removed => remove group
            else return this.hookTemplates.delete( group );
        }
        return false;
    }

    /**
     * Removes the template with the given id in the specified group.
     * @param  {number} id              The id of the hook (as specified in the hook object) to be removed.
     * @param  {string|number} group    The group that contains the hook template with the given id.
     * @return {boolean}       true, if successfully removed the template.
     *                         false, if there was nothing to remove.
     */
    removeTemplateById( group, id ) {
        if ( group ) {
            if ( !this.hookTemplates.has( group ) ) return false;
            let groupArr = this.hookTemplates.get( group );
            for( let i = 0; i < groupArr.length; i++ ) {
                if( groupArr[i].id === id ) return groupArr.splice( i, 1 ).length;
            }
        }
        return false;
    }

    /**
     * Removes all templates with the given name in the specified group
     * or in all groups if group is not specified.
     * @param  {[string|integer]} group The group that contains the hook template with the given name. [optional]
     * @param  {[string]} name  The name of the hook (as specified in the hook args) to be removed.
     * @return {[boolean]}       true, if successfully removed all occurences.
     *                        false, if there was nothing to remove.
     */
    removeTemplateByName( group, name ) {
        let result = [];
        if ( name != undefined ) {
            let foundArr = [];
            if ( !this.hookTemplates.has( group ) ) return false;
            let groupArr = this.hookTemplates.get( group );
            for ( let i = 0; i < groupArr.length; i++ ) {
                if ( groupArr[i].args[0] === name ) {
                    foundArr.push( i );
                }
            }
            result = foundArr.map( x => this._removeTemplateAt( group, x, groupArr ), this );
        } else {
            name = group;
            for ( let g of this.hookTemplates.keys() ) {
                result.push( this.removeTeplateByName( name, g ) );
            }
        }
        return result.length ? result.reduce( ( a, c ) => a || c ) : false;
    }

    /**
     * Removes a whole group of templates.
     * @returns     true if successfully removed, otherwise false.
     */
    removeGroup( group ) {
        return this.hookTemplates.delete( group );
    }

    /** Removes all templates. */
    removeAll() {
        this.hookTemplates.clear();
    }

    /**
     * Compares two templates with eachother.
     * @param argsA   The template object \{ hookArgs, id \} on the left side.
     * @param argsB   The template object \{ hookArgs, id \} on the right side.
     * @returns     -1 if argsA \< argsB, 0 if equal and 1 otherwise.
     */
    static _compareTemplates( argsA, argsB ) {
        return HookManager._compareArgs( argsA.args, argsB.args );
    }

    /**
     * Compares two argument arrays with eachother.
     * @param argsA   The argument array [dev, version(, opt), cb] on the left side.
     * @param argsB   The argument array [dev, version(, opt), cb] on the right side.
     * @returns     -1 if argsA \< argsB, 0 if equal and 1 otherwise.
     */
    static _compareArgs( argsA, argsB ) {
        if ( !argsA ) return argsB ? 1 : 0;
        if ( !argsB ) return -1;
        let strA = "",
            strB = "";
        strA = HookManager._appendArrayString( strA, argsA );
        strB = HookManager._appendArrayString( strB, argsB );
        return strA.localeCompare( strB );
    }

    /**
     * Compares two hook objects with eachother.
     * @param hookA   The left hook object. \{ args, hook, id \}
     * @param hookB   The right hook object. \{ args, hook, id \}
     * @returns     -1 if hookA \< hookB, 0 if equal or 1 otherwise.
     */
    static _compareHooks( hookA, hookB ) {
        if ( !hookA ) return hookB ? 1 : 0;
        if ( !hookB ) return -1;
        let strA = "",
            strB = "";
        strA = HookManager._appendObjectString( strA, hookA );
        strB = HookManager._appendObjectString( strB, hookB );
        return strA.localeCompare( strB );
    }

    /**
     * Appends object elements and it's children to a string.
     * @param {string} str    The string to be appended.
     * @param {object} obj    The object with its elements.
     */
    static _appendObjectString( str, obj ) {
        if ( !obj ) return str;
        if ( typeof obj != "object" ) throw new Error( "2nd argument is not an object." );
        str += "{";
        let keys = Object.keys( obj );
        let i = 0;
        for ( ; i < keys.length - 1; i++ ) {
            let o = keys[i];
            str += o + ":";
            str = HookManager._append( str, obj[o]) + ",";
        }
        if ( i < keys.length ) {
            let o = keys[i];
            str += o + ":";
            str = HookManager._append( str, obj[o]);
        }
        return str + "}";
    }

    /** Appends an object to a string.  */
    static _append( str, obj ) {
        if ( Array.isArray( obj ) ) {
            return HookManager._appendArrayString( str, obj );
        } else if ( typeof obj == "object" ) {
            return HookManager._appendObjectString( str, obj );
        } else if ( typeof obj == "function" ) str += obj.toString().replace( /\s/g, "" );
        else if ( typeof obj == "bigint" ) str += util.inspect( obj );
        else str += JSON.stringify( obj );
        return str;
    }

    /**
     * Appends all array elements and it's children to a string.
     * @param {string} str    The string to be appended.
     * @param {Array} arr     The array with its elements.
     */
    static _appendArrayString( str, arr ) {
        if ( !arr ) return str;
        str += "[";
        let i = 0;
        for ( ; i < arr.length - 1; i++ ) {
            str = HookManager._append( str, arr[i]) + ",";
        }
        if ( i < arr.length ) {
            str = HookManager._append( str, arr[i]);
        }
        str += "]";
        return str;
    }

    /**
     * Hooks and saves the return value of {@link dispatch#hook}.
     * @param {string|int} group      The group of the hook
     * @param {...array} hookArgs    The hook arguments as in {@link mod#hook} (name, version[, opts], cb)
     *                                name = definition name
     *                                version = version of definition
     *                                opts = \{
     *                                    order=A number for priorization. Lower numbers are more priorized than higher,
     *                                    filter=\{
     *                                      fake=true|false|null,
     *                                      incoming=true|false|null,
     *                                      modified=true|false|null,
     *                                      silenced=true|false|null
     *                                    \}
     *                                  \} (optional)
     *                                cb = callback function (event) => \{\} return true if packet is modified, false if packet is ignored, undefined otherwise
     * @returns     a hook obj: \{group, args, hook\} or \{group, args\} if the hook already exists or could not be hooked of some reason
     */
    hook( group, ...hookArgs ) {
        if ( !["string", "number"].includes( typeof group ) ) throw new TypeError( "group should be a string or a number." );
        let tmpObj = this.addTemplate( group, ...hookArgs );
        if( !Object.keys( tmpObj ).length ) tmpObj = this.hookTemplates.get( group );
        var h = {};
        try {
            h = this.mod.hook( ...hookArgs );
        } catch ( err ) {
            // could not hook packet (missing definition or name<->opcode mapping)
            // mod.dispatch.latestDefVersion
            // try raw hook
            let opcode = this.mod.dispatch.protocolMap.name.get( hookArgs[0]);
            if( opcode ) this.mod.error( `Could not hook definition "${hookArgs[0]}" -> opcode "${opcode}". Original error message: ${err}` );
            // missing mapping name -> opcode
            else this.mod.error( `Missing mapping definition "${hookArgs[0]}" -> opcode "${opcode}". Original error message: ${err}` );
            return { group: group, args: hookArgs };
        }
        let hookGroup = this.activeHooks.get( group );
        let hookObj = Object.assign( tmpObj, { hook: h });
        if ( hookGroup ) {
            let idx = binarySearch( hookGroup, hookObj, HookManager._compareHooks );
            // add hook if not exists
            if ( idx < 0 ) hookGroup.splice( ~idx, 0, hookObj );
            else {
                // XXX maybe to expensive operation. other solution?
                // revert hook
                this.mod.unhook( h );
                return tmpObj;
            }
        } else {
            this.activeHooks.set( group, [hookObj]);
        }
        return Object.freeze( Object.assign({}, hookObj ) );
    }

    hasGroup( group ) {
        return this.hookTemplates.has( group );
    }

    hasActiveGroup( group ) {
        return this.activeHooks.has( group );
    }

    /**
     * Hooks a group of templates.
     * @returns     an array of hook objects or an empty array if there was nothing to hook.
     */
    hookGroup( group ) {
        if( arguments.length != 1 )
            throw new Error( "ArgumentError: There should be only 1 argument which is the group name you want to hook." )
        let hooks = [];
        if ( this.hookTemplates.has( group ) ) {
            let templates = this.hookTemplates.get( group ).slice();
            for ( let template of templates ) {
                hooks.push( this.hook( group, ...template.args ) );
            }
        }
        return hooks;
    }

    /**
     * Hooks all not yet hooked templates.
     * @returns     an array of the hooked objects or an empty array if there was nothing to hook.
     */
    hookAll() {
        let hooks = [];
        for ( let [ group, temps ] of this.hookTemplates.slice() ) {
            for ( let argObj of temps ) hooks.push( this.hook( group, ...argObj.args ) );
        }
        return hooks;
    }

    /**
     * Unhooks the specific hook object.
     * @param hookObj     The hook object: \{ group : ..., args : ..., id: ..., hook : ...\}
     */
    unhook( hookObj ) {
        if ( !hookObj ) {
            throw new Error( "ArgumentError: hookObj must not be undefined." );
        }

        if ( this.activeHooks.size && hookObj.hook ) {
            let hooks = this.activeHooks.get( hookObj.group );
            if ( !hooks ) hooks = [];
            let index = binarySearch( hooks, hookObj, HookManager._compareHooks );
            this._unhookAt( hookObj.group, index, hooks );
        }
    }

    /**
     * Unhooks the specific hook object at the given group and index.
     * @param group   The group that includes the hook object.
     * @param index   The index of the hook object.
     */
    unhookAt( group, index ) {
        this._unhookAt( group, index, this.activeHooks.get( group ) );
    }

    _unhookAt( group, index, hooks ) {
        if ( !["string", "number"].includes( typeof group ) ) throw new TypeError( "group should be a string or a number." );
        if ( index >= 0 && index < hooks.length ) {
            this.mod.unhook( hooks[index].hook );
            if ( hooks.length > 1 ) hooks.splice( index, 1 );
            else {
                this.activeHooks.delete( group );
            }
            // else nothing to unhook
        }
    }

    /**
     * Unhooks all hooks with the given name in the specified group or in all groups
     * if group is not specified.
     * @param  {[type]} name  The name of the hook.
     * @param  {[type]} group The group that contains the hook. [optional]
     */
    unhookByName( name, group ) {
        if ( group ) {
            if ( !this.activeHooks.has( group ) ) return false;
            let foundNameIndices = [];
            let hookObjs = this.activeHooks.get( group );
            for ( let i = 0; i < hookObjs.length; i++ ) {
                if ( hookObjs[i].args[0] === name ) foundNameIndices.push( i );
            }
            foundNameIndices.map( nameIndex => this.unhookAt( group, nameIndex ) );
        } else {
            for ( let g of this.activeHooks.keys() ) {
                this.unhookByName( name, g );
            }
        }
    }

    /**
     * Unhooks a group of hooks.
     * @params group The group to unhook.
     * @returns true if group could be unhooked. Otherwise false.
     */
    unhookGroup( group ) {
        let activeGroupedHooks = this.activeHooks.get( group );
        if ( activeGroupedHooks ) {
            for ( let activeHook of activeGroupedHooks ) this.mod.unhook( activeHook.hook );
            return this.activeHooks.delete( group );
        } else {
            // Group does not exist
            return false;
        }
    }

    /** Unhooks them all. */
    unhookAll() {
        if ( this.activeHooks.size ) {
            for ( let activeHooks of this.activeHooks.values() ) {
                for ( let activeHook of activeHooks ) this.mod.unhook( activeHook.hook );
            }
            this.activeHooks.clear();
        }
    }

    //###################
    // Helper Functions
    //#################
    /** Prints the message in game and in console with local time stamp. */
    static printMessage( message ) {
        let timedMessage = `[${new Date().toLocaleTimeString()}]: ${message}`;
        console.log( HookManager.cleanString( timedMessage ) );
    }

    /**
     * @returns Returns a html-tag-free string.
     */
    static cleanString( dirtyString ) {
        return dirtyString.replace( /<[^>]*>/g, "" );
    }

    /**
     * A string representation of the HookManager.
     * @see Object#toString()
     * @override
     */
    toString() {
        let str = "\nHookManager {\n  Templates: [\n";
        let i = 0;
        // group => [ { args, id } ]; args = [dev, version(, opt), cb]
        for ( let [g, t] of this.hookTemplates ) {
            str += "    " + g + " => " + JSON.stringify( t );
            if ( i++ < this.hookTemplates.size - 1 ) str += ",\n";
        }
        i = 0;
        str += "\n  ],\n  Active Hooks: [\n";
        // group => [ { group, args, hook, id } ]
        for ( let [g, t] of this.activeHooks ) {
            str += "    " + g + " => " + JSON.stringify( t );
            if ( i++ < this.activeHooks.size - 1 ) str += ",\n";
        }
        return str + "\n  ]\n}\n";
    }
}

module.exports = HookManager;
