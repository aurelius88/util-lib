/// <reference types="tera-toolbox-types" />
import { NetworkModInterface } from "tera-toolbox/bin/mod.js";
declare class ChatHelper {
    private mod;
    COLOR_ENABLE: string;
    COLOR_DISABLE: string;
    COLOR_COMMAND: string;
    COLOR_HIGHLIGHT: string;
    COLOR_VALUE_MIN: string;
    COLOR_VALUE_MAX: string;
    COLOR_VALUE: string;
    timed: boolean;
    consoleOut: boolean;
    constructor(mod: NetworkModInterface<ChatHelper, null, null>);
    static get COLOR_ENABLE(): string;
    static get COLOR_DISABLE(): string;
    static get COLOR_COMMAND(): string;
    static get COLOR_SUBCOMMAND(): string;
    static get COLOR_VALUE_MIN(): string;
    static get COLOR_VALUE_NORMAL(): string;
    static get COLOR_VALUE_MAX(): string;
    static get COLOR_VALUE(): string;
    static get COLOR_HIGHLIGHT(): string;
    static get COLOR_COMMON(): string;
    static get COLOR_UNCOMMON(): string;
    static get COLOR_RARE(): string;
    static get COLOR_SUPERIOR(): string;
    static get COLOR_MYTHICAL(): string;
    static parseColor(input: string): number[];
    static ColorToHex(input: string): string;
    static ColorToRGB(input: string): string;
    static colorByValue(value: number, valueColorMap: {
        [value: number]: number[];
    } | Map<number, number[]>): number[];
    setTimedMessage(timed: boolean): void;
    setConsoleOut(consoleOut: boolean): void;
    /**
     * Prints the message in game and in console with local time stamp.
     * @param  {string}  message           The message.
     * @param  {boolean} [consoleOut=false] Also print in console?
     * @memberOf ChatHelper
     */
    printMessage(message: string, consoleOut?: boolean): void;
    /**
     * Returns a html-tag-free string.
     * @param  {string} dirtyString the string with html tags.
     * @return {string}             a html-tag-free string.
     * @static
     * @memberOf ChatHelper
     */
    static cleanString(dirtyString: string): string;
    static unescapeHtml(escaped: string): string;
    cleanString(dirtyString: string): string;
    /**
     * Converts a time in milliseconds to UTC time string.
     * @param  {number} timeInMs The time in milliseconds as integer.
     * @return {string}          Returns the time in the format: hh:MM:SS
     * @static
     * @memberOf ChatHelper
     */
    static msToUTCTimeString(timeInMs: number): string;
    msToUTCTimeString(timeInMs: number): string;
    /**
     * Adds a zero to numbers smaller than base.
     * @param {[number|string]} num The number to be formatted.
     * @return Returns the number as string with 0 prefix or
     * the number if no prefix needed.
     * @static
     * @memberOf OutputHelper
     */
    static addPrefixZero(num: string | number, base?: number): string | number;
    addPrefixZero(num: string | number): string | number;
    /**
     * Adds a space every intervall chars. E.g.:
     * addSpaceIntervall( "123456", 2 ) returns "12 34 56"
     * @param {string} s              The string where spaces should be added
     * @param {Number} [intervall=2]  The interval of spaces (Default: 2)
     */
    static addSpaceIntervall(s: string, intervall?: number): string;
}
export = ChatHelper;
