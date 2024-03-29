"use strict";
const binarySearch = require("binary-search");
function _colorByValueMap(value, valueColorMap) {
    let colorSteps = Array.from(valueColorMap.keys());
    colorSteps.sort(_compareNumbers);
    let max = colorSteps[colorSteps.length - 1];
    let min = colorSteps[0];
    let currentStep = value > max ? max : value < min ? min : value;
    if (currentStep === min || currentStep === max) {
        let color = valueColorMap.get(currentStep);
        if (color === undefined) {
            throw new Error(`Missing color mapping for ${currentStep}`);
        }
        return color;
    }
    else {
        let local = _localMinMax(colorSteps, currentStep, _compareNumbers);
        let minColor = valueColorMap.get(local.min);
        if (minColor == undefined) {
            throw new Error(`Missing color mapping for ${local.min}`);
        }
        let maxColor = valueColorMap.get(local.max);
        if (maxColor == undefined) {
            throw new Error(`Missing color mapping for ${local.max}`);
        }
        let relVal = relativeValue(local.min, local.max, value);
        return lerpArray(minColor, maxColor, relVal).map(Math.round);
    }
}
function lerpArray(start, end, t) {
    if (!Array.isArray(start) || !Array.isArray(end))
        throw new TypeError(`The first two arguments must be arrays, but start were ${typeof start} and end were ${typeof end}.`);
    if (start.length != end.length)
        throw new Error("Both arrays need to be from the same length.");
    let result = [];
    for (let i = 0; i < start.length && i < end.length; i++) {
        result.push(lerp(start[i], end[i], t));
    }
    return result;
}
function relativeValue(start, end, value) {
    return (value - start) / (end - start);
}
function lerp(start, end, t) {
    return (1 - t) * start + t * end;
}
function _localMinMax(array, value, comparator) {
    let localMaxIndex = binarySearch(array, value, comparator);
    if (localMaxIndex < 0)
        localMaxIndex = ~localMaxIndex;
    let localMax = array[localMaxIndex];
    let localMin = array[localMaxIndex > 0 ? localMaxIndex - 1 : localMaxIndex];
    return { min: localMin, max: localMax };
}
function _colorByValueObject(value, valueColorMap) {
    let colorSteps = Object.keys(valueColorMap).map(val => Number(val));
    colorSteps.sort(_compareNumbers);
    let max = colorSteps[colorSteps.length - 1];
    let min = colorSteps[0];
    let currentStep = value > max ? max : value < min ? min : value;
    if (currentStep === min || currentStep === max) {
        return valueColorMap[currentStep];
    }
    else {
        let local = _localMinMax(colorSteps, currentStep, _compareNumbers);
        let minColor = valueColorMap[local.min];
        let maxColor = valueColorMap[local.max];
        let relVal = 1 - (local.max - currentStep) / (local.max - local.min);
        let resColor = [];
        for (let i = 0; i < minColor.length; i++) {
            resColor[i] = (maxColor[i] - minColor[i]) * relVal - minColor[i];
        }
        return resColor;
    }
}
function _compareNumbers(a, b) {
    return a - b;
}
class ChatHelper {
    constructor(mod) {
        this.mod = mod;
        this.COLOR_ENABLE = ChatHelper.COLOR_ENABLE;
        this.COLOR_DISABLE = ChatHelper.COLOR_DISABLE;
        this.COLOR_COMMAND = ChatHelper.COLOR_COMMAND;
        this.COLOR_HIGHLIGHT = ChatHelper.COLOR_HIGHLIGHT;
        this.COLOR_VALUE_MIN = ChatHelper.COLOR_VALUE_MIN;
        this.COLOR_VALUE_MAX = ChatHelper.COLOR_VALUE_MAX;
        this.COLOR_VALUE = ChatHelper.COLOR_VALUE;
        this.mod = mod;
        this.timed = false;
        this.consoleOut = false;
    }
    static get COLOR_ENABLE() {
        return "#56B4E9";
    }
    static get COLOR_DISABLE() {
        return "#e64500";
    }
    static get COLOR_COMMAND() {
        return "#e6a321";
    }
    static get COLOR_SUBCOMMAND() {
        return "#e6d221";
    }
    static get COLOR_VALUE_MIN() {
        return "#ff2828";
    }
    static get COLOR_VALUE_NORMAL() {
        return "#ffff28";
    }
    static get COLOR_VALUE_MAX() {
        return "#28ff28";
    }
    static get COLOR_VALUE() {
        return "#09d1d1";
    }
    static get COLOR_HIGHLIGHT() {
        return "#81ee7b";
    }
    static get COLOR_COMMON() {
        return "#ffffff";
    }
    static get COLOR_UNCOMMON() {
        return "#4ecd30";
    }
    static get COLOR_RARE() {
        return "#00aeef";
    }
    static get COLOR_SUPERIOR() {
        return "#ffcc00";
    }
    static get COLOR_MYTHICAL() {
        return "#f93ece";
    }
    static parseColor(input) {
        if (input.substring(0, 1) == "#") {
            let collen = (input.length - 1) / 3;
            let fact = [17, 1, 0.062272][collen - 1];
            return [
                Math.round(parseInt(input.substring(1, collen + 1), 16) * fact),
                Math.round(parseInt(input.substring(1 + collen, 1 + 2 * collen), 16) * fact),
                Math.round(parseInt(input.substring(1 + 2 * collen, input.length), 16) * fact)
            ];
        }
        else
            return input
                .split("(")[1]
                .split(")")[0]
                .split(",")
                .map(Number)
                .map(Math.round);
    }
    static ColorToHex(input) {
        let clr = ChatHelper.parseColor(input);
        return (`#${ChatHelper.addPrefixZero(clr[0].toString(16))}`
            + ChatHelper.addPrefixZero(clr[1].toString(16))
            + ChatHelper.addPrefixZero(clr[2].toString(16)));
    }
    static ColorToRGB(input) {
        let clr = ChatHelper.parseColor(input);
        return `rgb(${clr[0]}, ${clr[1]}, ${clr[2]})`;
    }
    static colorByValue(value, valueColorMap) {
        let type = valueColorMap.toString();
        if (!valueColorMap || !["[object Object]", "[object Map]"].includes(type))
            throw new Error("Cannot generate a color without color map (Map or object). [value -> color]");
        if (type === "[object Object]") {
            if (Object(valueColorMap).keys().length)
                return _colorByValueObject(value, valueColorMap);
        }
        else if (type === "[object Map]") {
            if (valueColorMap.size)
                return _colorByValueMap(value, valueColorMap);
        }
        throw new Error("There should be at least 1 value to color mapping.");
    }
    setTimedMessage(timed) {
        this.timed = timed;
    }
    setConsoleOut(consoleOut) {
        this.consoleOut = consoleOut;
    }
    /**
     * Prints the message in game and in console with local time stamp.
     * @param  {string}  message           The message.
     * @param  {boolean} [consoleOut=false] Also print in console?
     * @memberOf ChatHelper
     */
    printMessage(message, consoleOut = false) {
        let time = `[${new Date().toLocaleTimeString()}]: `;
        this.mod.command.message(this.timed ? time + message : message);
        if (consoleOut || this.consoleOut) {
            this.mod.log(ChatHelper.cleanString(message));
        }
    }
    /**
     * Returns a html-tag-free string.
     * @param  {string} dirtyString the string with html tags.
     * @return {string}             a html-tag-free string.
     * @static
     * @memberOf ChatHelper
     */
    static cleanString(dirtyString) {
        return ChatHelper.unescapeHtml(dirtyString.replace(/<[^>]*>/g, ""));
    }
    static unescapeHtml(escaped) {
        if (escaped == undefined || typeof escaped !== "string")
            return escaped;
        return escaped
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");
    }
    // delegates to ChatHelper.cleanString
    cleanString(dirtyString) {
        return ChatHelper.cleanString(dirtyString);
    }
    /**
     * Converts a time in milliseconds to UTC time string.
     * @param  {number} timeInMs The time in milliseconds as integer.
     * @return {string}          Returns the time in the format: hh:MM:SS
     * @static
     * @memberOf ChatHelper
     */
    static msToUTCTimeString(timeInMs) {
        let secs = Math.floor(timeInMs / 1000.0), mins = Math.floor(secs / 60.0), h = Math.floor(mins / 60.0), s = secs % 60, m = mins % 60;
        return `${ChatHelper.addPrefixZero(h)}:${ChatHelper.addPrefixZero(m)}:${ChatHelper.addPrefixZero(s)}`;
    }
    // delegates to ChatHelper.msToUTCTimeString
    msToUTCTimeString(timeInMs) {
        return ChatHelper.msToUTCTimeString(timeInMs);
    }
    /**
     * Adds a zero to numbers smaller than base.
     * @param {[number|string]} num The number to be formatted.
     * @return Returns the number as string with 0 prefix or
     * the number if no prefix needed.
     * @static
     * @memberOf OutputHelper
     */
    static addPrefixZero(num, base = 10) {
        if (typeof num === 'number' ? num < base : parseInt(num, base) < base) {
            num = "0" + num;
        }
        return num;
    }
    // delegates to ChatHelper.addPrefixZero
    addPrefixZero(num) {
        return ChatHelper.addPrefixZero(num);
    }
    /**
     * Adds a space every intervall chars. E.g.:
     * addSpaceIntervall( "123456", 2 ) returns "12 34 56"
     * @param {string} s              The string where spaces should be added
     * @param {Number} [intervall=2]  The interval of spaces (Default: 2)
     */
    static addSpaceIntervall(s, intervall = 2) {
        return s.replace(new RegExp(`.{${intervall}}\\B`, "g"), "$& ");
    }
}
module.exports = ChatHelper;
