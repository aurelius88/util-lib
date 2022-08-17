declare class FileHelper {
    constructor();
    /**
     * @description load json in UTF-8 from absolute path
     * @static
     * @param {string} path path to json file
     * @returns {object|array|null} parsed json or null if error
     * @memberof FileHelper
     */
    static loadJson(path: string): any;
    loadJson(path: string): any;
    /**
     * @description Resolve file path by root [default=__dirname]
     * @param  {string} head             relative path to root
     * @param  {string} [root=__dirname] root path
     * @return {string}                  absolute path
     * @memberof FileHelper
     */
    static getFullPath(head: string, root?: string): any;
    getFullPath(head: string, root?: string): any;
    /**
     * @description save object as json file
     * @static
     * @param {any} obj object to save
     * @param {string} path absolute path
     * @returns  {void|boolean} nothing or false if error
     * @memberof FileHelper
     */
    static saveJson(obj: any, path: string): boolean;
    saveJson(obj: any, path: string): boolean;
    static readOpcodes(rawFile: string, jsonFile: string, map?: Map<string | number, string>): Map<string | number, string>;
    readOpcodes(rawFile: string, jsonFile: string, map?: Map<string | number, string>): Map<string | number, string>;
    static readOpcodesRaw(pathToFile: string, isKeyFirst?: boolean): {
        [opcode: string]: string;
        [opcode: number]: string;
    };
    readOpcodesRaw(pathToFile: string, isKeyFirst?: boolean): {
        [opcode: string]: string;
        [opcode: number]: string;
    };
    static groupOpcodes(opcodeDefMap: Map<string | number, string | number>): Map<string, number[]>;
    groupOpcodes(map: Map<string | number, string | number>): Map<string, number[]>;
}
export = FileHelper;
