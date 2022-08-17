/// <reference types="tera-toolbox-types" />
/// <reference types="tera-toolbox-types" />
import { Hook, HookOptions } from "tera-network-proxy/connection/dispatch.js";
import { NetworkModInterface } from "tera-toolbox/bin/mod.js";
declare class Ids {
    private ids;
    private highestId;
    private max;
    constructor(maxSize: number);
    add(): number;
    contains(id: number): boolean;
    remove(id: number): boolean | undefined;
    isFull(): boolean;
    clear(): void;
}
declare type Template = {
    group: string | number;
    args: Arguments;
    id: number;
};
declare type ActiveTemplate = Template & {
    hook: Hook;
};
declare type Arguments = [name: string, version: number | '*' | 'raw' | 'event', options: HookOptions, callback: Function];
/**
 * Manages hooks by grouping and storing their source and hook objects, when hooked.
 */
declare class HookManager {
    private mod;
    hookTemplates: Map<string | number, Template[]>;
    activeHooks: Map<string | number, ActiveTemplate[]>;
    ids: Ids;
    constructor(mod: NetworkModInterface<null, null, HookManager>);
    /**
     * The active hooks.
     * @returns a map of group -> list of active hooks.
     * (\{ group: <string>, args: <array>, id: <number>, hook: <object>\} array )
     */
    getActiveHooks(): Map<string | number, ActiveTemplate[]>;
    /**
     * The hook templates.
     * @returns a map of group -> list of hook templates
     * ( hook template: \{ group: <string>, args: <array>, id: <number> \} array )
     */
    getHookTemplates(): Map<string | number, Template[]>;
    /**
     * Returns the hook template with the specified id or an empty object
     * if there was no template found.
     * @param  {[type]} group The name of the group.
     * @param  {[type]} id    The id of the template.
     * @return {[type]}       the template with the specified id or an empty object
     *                        if there was no template found.
     */
    getHookTemplateById(group: string | number, id: number): {};
    getHookTemplate(group: string | number, ...hookArgs: any[]): {
        group: string | number;
        args: (string | number | Function | HookOptions)[];
        id: number;
    };
    /**
     * Returns the index of the specified hook within the specified group.
     * @param  {string|number} group    the name of the group
     * @param  {...Array} hookArgs      the arguments of the hook (name, version, [options], callback)
     * @return {number}     the index of the hook. If the hook could not be found,
     *                      it will return a negative index containing the last visited
     *                      index.
     */
    getHookIndex(group: string | number, ...hookArgs: any[]): any;
    /**
     * Returns the hook index with specified id.
     * @param  {string|number} group [description]
     * @param  {number} id    [description]
     * @return {number}       [description]
     */
    getHookIndexById(group: string | number, id: number): number;
    /**
     * Adds a grouped hook. Sorted insertion.
     * @param group       the name of the group.
     * @param hookArgs    the arguments of the hook (name, version, [options], callback)
     * @returns     a hook template \{group, args, id\} to identify the hook
     *              or an empty object undefined if the template could not be added
     *              because of same template is already added or there is no more
     *              space available to add new templates.
     */
    addTemplate(group: string | number, ...hookArgs: Arguments): {
        group: string | number;
        args: Arguments;
        id: number;
    } | undefined;
    /**
     * Removes a hook by an hook object containing group and template.
     * @param hookObj     The obj containing the group and the hook arguments:
     *                  \{group: <name>, args: <[arguments]>, id: <id>\}
     * @returns     true if removal was successful, otherwise false.
     */
    removeTemplate(templateObj: Template): boolean;
    /**
     * Removes a grouped hook template within the group named group at position index.
     * @param group   The group name.
     * @param index   The index of the hook to be removed inside the group.
     * @returns     true if removal was successful, otherwise false.
     */
    removeTemplateAt(group: string | number, index: number): boolean;
    /**
     * Removes a grouped hook template within the group named group at position index.
     * @param  {string|number} group    The group name.
     * @param  {number} index           The index of the element to be removed.
     * @param  {Array}  hookTemplateArray   The array containing the element to be removed.
     * @return {boolean}                true if removals was successful, otherwise false.
     */
    _removeTemplateAt(group: string | number, index: number, hookTemplateArray: Template[]): boolean;
    /**
     * Removes the template with the given id in the specified group or in all
     * groups if only one arguement is specified.
     * @param  {number} id              The id of the hook (as specified in the hook object) to be removed.
     * @param  {string|number} group    The group that contains the hook template with the given id. [optional]
     * @return {boolean}       true, if successfully removed at least one template.
     *                         false, if there was nothing to remove.
     */
    removeTemplateById(group: string | number, id: number): boolean;
    /**
     * Removes all templates with the given name in the specified group
     * or in all groups if group is not specified.
     * @param  {[string|integer]} group The group that contains the hook template with the given name. [optional]
     * @param  {[string]} name  The name of the hook (as specified in the hook args) to be removed.
     * @return {[boolean]}       true, if successfully removed at least one occurence.
     *                        false, if there was nothing to remove.
     */
    removeTemplateByName(group: string | number, name: string): boolean;
    /**
     * Removes a whole group of templates.
     * @returns     true if successfully removed, otherwise false.
     */
    removeGroup(group: string | number): boolean;
    /** Removes all templates. */
    removeAll(): void;
    /**
     * Compares two templates with eachother.
     * @param templateA   The template object \{group, args, id\} on the left side.
     * @param templateB   The template object \{group, args, id\} on the right side.
     * @returns     -1 if argsA \< argsB, 0 if equal and 1 otherwise.
     */
    static _compareTemplates(templateA: Template, templateB: Template): number;
    /**
     * Compares two argument arrays with eachother.
     * @param argsA   The argument array [dev, version(, opt), cb] on the left side.
     * @param argsB   The argument array [dev, version(, opt), cb] on the right side.
     * @returns     -1 if argsA \< argsB, 0 if equal and 1 otherwise.
     */
    static _compareArgs(argsA: Arguments, argsB: Arguments): number;
    /**
     * Compares two hook objects with eachother.
     * @param hookA   The left hook object. \{ args, hook, id \}
     * @param hookB   The right hook object. \{ args, hook, id \}
     * @returns     -1 if hookA \< hookB, 0 if equal or 1 otherwise.
     */
    static _compareHooks(hookA: ActiveTemplate, hookB: ActiveTemplate): number;
    /**
     * Appends object elements and it's children to a string.
     * @param {string} str    The string to be appended.
     * @param {object} obj    The object with its elements.
     */
    static _appendObjectString(str: string, obj: {
        [key: string]: any;
    }): string;
    /** Appends an object to a string.  */
    static _append(str: string, obj: any): string;
    /**
     * Appends all array elements and it's children to a string.
     * @param {string} str    The string to be appended.
     * @param {Array} arr     The array with its elements.
     */
    static _appendArrayString(str: string, arr: any[]): string;
    /**
     * Hooks and saves the return value of {@link dispatch#hook}.
     * @param {string|int} group      The group of the hook
     * @param {...array} hookArgs    The hook arguments as in {@link mod#hook} (name, version[, opts], cb)
     *      name = definition name
     *      version = version of definition
     *      opts = \{order, filter\} (optional) order is priorisation number.
     *          Smaller numbers are priorized.
     *          filter=\{ fake, incoming, modified, silenced \}
     *              fake=true|false|null,
     *              incoming=true|false|null,
     *              modified=true|false|null,
     *              silenced=true|false|null
     *      cb = callback function (event) => \{\}
     *          return true if packet is modified, false if packet
     *          is ignored, undefined otherwise
     * @returns   a hook obj: \{group, args, id, hook\} or the template \{group, args, id\}
     *            if the hook already exists or could not be hooked for some reason
     */
    hook(group: string | number, ...hookArgs: Arguments): Readonly<Template> | undefined;
    /**
     *
     * @param  {object} template The hook template \{ group, args, id \}
     * @return {object}          A hook object \{ group, args, id, hook \} or
     *                          \{group, args, id\} if the hook already exists or
     *                          could not be hooked of some reason
     */
    hookTemplate(template: Template): Readonly<Template>;
    hasGroup(group: string | number): boolean;
    hasActiveGroup(group: string | number): boolean;
    /**
     * Hooks a group of templates.
     * @returns     an array of hook objects or an empty array if there was nothing to hook.
     */
    hookGroup(group: string | number): Readonly<Template>[];
    /**
     * Hooks all not yet hooked templates.
     * @returns     an array of the hooked objects or an empty array if there was nothing to hook.
     */
    hookAll(): Readonly<Template>[];
    /**
     * Unhooks the specific hook object.
     * @param hookObj     The hook object: \{ group: <string>, args: <array>, id: <number>, hook : <object>\}
     * @returns true if the hook object could be unhooked. Otherwise false.
     */
    unhook(hookObj: ActiveTemplate): boolean;
    /**
     * Unhooks the specific hook object at the given group and index.
     * @param group   The group that includes the hook object.
     * @param index   The index of the hook object.
     * @returns true if the hook at index could be unhooked. Otherwise false.
     */
    unhookAt(group: string | number, index: number): boolean;
    _unhookAt(group: string | number, index: number, hooks: ActiveTemplate[]): boolean;
    /**
     * Unhooks all hooks with the given name in the specified group or in all groups
     * if group is not specified.
     * @param  {[type]} group The group that contains the hook. [optional]
     * @param  {[type]} packetName  The name of the hooked packet aka definition name.
     * @returns the number of unhooked hooks.
     */
    unhookByName(group: string | number, packetName: string): number;
    /**
     * Unhooks a group of hooks.
     * @params group The group to unhook.
     * @returns true if group could be unhooked. Otherwise false.
     */
    unhookGroup(group: string | number): boolean;
    /** Unhooks them all. */
    unhookAll(): void;
    /** Prints the message in game and in console with local time stamp. */
    static printMessage(message: string): void;
    /**
     * @returns Returns a html-tag-free string.
     */
    static cleanString(dirtyString: string): string;
    /**
     * A string representation of the HookManager.
     * @see Object#toString()
     * @override
     */
    toString(): string;
}
export = HookManager;
