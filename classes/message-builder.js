"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const chat_helper_1 = __importDefault(require("./chat-helper"));
const TYPE_COLOR = "color";
const TYPE_SIZE = "size";
const TYPE_TEXT = "text";
const TYPE_NONE = "none";
/**
 * [MessageBuilder description]
 */
class MessageBuilder {
    constructor() {
        this.clear();
        this.colorEnable = chat_helper_1.default.COLOR_ENABLE;
        this.colorDisable = chat_helper_1.default.COLOR_DISABLE;
        this.colorValue = chat_helper_1.default.COLOR_VALUE;
        this.colorValueMin = chat_helper_1.default.COLOR_VALUE_MIN;
        this.colorValueMid = chat_helper_1.default.COLOR_VALUE_NORMAL;
        this.colorValueMax = chat_helper_1.default.COLOR_VALUE_MAX;
        this.colorHighlight = chat_helper_1.default.COLOR_HIGHLIGHT;
        this.colorCommand = chat_helper_1.default.COLOR_COMMAND;
        this.colorCommon = chat_helper_1.default.COLOR_COMMON;
        this.colorUncommon = chat_helper_1.default.COLOR_UNCOMMON;
        this.colorRare = chat_helper_1.default.COLOR_RARE;
        this.colorSuperior = chat_helper_1.default.COLOR_SUPERIOR;
        this.colorMythical = chat_helper_1.default.COLOR_MYTHICAL;
    }
    /**
     * Appends text to the builder.
     * @param  {string|number|boolean|bigint} text the text to be appended
     * @return {MessageBuilder}                    the builder (for chaining)
     */
    text(text) {
        let allowedTypes = ["string", "number", "boolean", "bigint"];
        if (!allowedTypes.some(x => typeof x))
            throw new TypeError(`${typeof text} is not an allowed type. Should be one of these: ${JSON.stringify(allowedTypes)}.`);
        this.tokens.push({ type: TYPE_TEXT, value: MessageBuilder.escapeHtml(String(text)) });
        return this;
    }
    static escapeHtml(unsafe) {
        if (!unsafe || typeof unsafe != "string")
            return unsafe;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    static unescapeHtml(unsafe) {
        if (!unsafe || typeof unsafe != "string")
            return unsafe;
        return unsafe
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");
    }
    /**
     * Adds a value with a value dependend color depending on max and min.
     * @param  {string|number} value           the value
     * @param  {number} [max=2 * value] the maximal value which value can reach
     * @param  {number} [min=0]         the minimal value which value can reach
     * @param  {number} [mid=max > min ? 0.4 * max : 0.4 * min] the value inbetween
     * @return {MessageBuilder}         the builder (for chaining)
     */
    coloredValue(value, max, min = 0, mid) {
        // bigint conversion (no precission required)
        value = Number(value);
        max = typeof max === "bigint" ? Number(max) : max;
        min = typeof min === "bigint" ? Number(min) : min;
        mid = typeof mid === "bigint" ? Number(mid) : mid;
        // default values
        if (max == undefined)
            max = 2 * value;
        if (mid == undefined) {
            mid = max > min ? 0.4 * (max - min) + min : 0.4 * (min - max) + max;
        }
        let map = new Map([
            [max, chat_helper_1.default.parseColor(this.colorValueMax)],
            [mid, chat_helper_1.default.parseColor(this.colorValueMid)],
            [min, chat_helper_1.default.parseColor(this.colorValueMin)]
        ]);
        let clr = chat_helper_1.default.colorByValue(value, map);
        return this.color(`#${chat_helper_1.default.addPrefixZero(clr[0].toString(16))}`
            + chat_helper_1.default.addPrefixZero(clr[1].toString(16))
            + chat_helper_1.default.addPrefixZero(clr[2].toString(16))).text(value);
    }
    /**
     * Adds a text with a fix color for values.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    value(value) {
        return this.color(this.colorValue).text(value);
    }
    /**
     * Adds a text with a fix color for commands.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    command(value) {
        return this.color(this.colorCommand).text(value);
    }
    /**
     * Adds a text with a fix color for highlighting.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    highlight(value) {
        return this.color(this.colorHighlight).text(value);
    }
    /**
     * Adds a text with a fix color for enabling.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    enable(value) {
        return this.color(this.colorEnable).text(value);
    }
    /**
     * Adds a text with a fix color for disabling.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    disable(value) {
        return this.color(this.colorDisable).text(value);
    }
    /**
     * Adds a text with a fix color for a common item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    common(value) {
        return this.rarity(0, value);
    }
    /**
     * Adds a text with a fix color for a uncommon item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    uncommon(value) {
        return this.rarity(1, value);
    }
    /**
     * Adds a text with a fix color for a rare item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    rare(value) {
        return this.rarity(2, value);
    }
    /**
     * Adds a text with a fix color for a superior item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    superior(value) {
        return this.rarity(3, value);
    }
    /**
     * Adds a text with a fix color for a mythical item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    mythical(value) {
        return this.rarity(4, value);
    }
    /**
     * Adds a text with a fix color depending on the {@link grade} of the item.
     * The grades range from 0-4. Any other number will be treated as 0.
     * - `0 = common`
     * - `1 = uncommon`
     * - `2 = rare`
     * - `3 = superior`
     * - `4 = mythical`
     * @param  {string|number} value    the text
     * @param  {number} grade           the rarity grade
     * @return {MessageBuilder}  the builder (for chaining)
     */
    rarity(grade, value) {
        let msg = this;
        switch (grade) {
            case 0: {
                msg.color(this.colorCommon);
                break;
            }
            case 1: {
                msg.color(this.colorUncommon);
                break;
            }
            case 2: {
                msg.color(this.colorRare);
                break;
            }
            case 3: {
                msg.color(this.colorSuperior);
                break;
            }
            case 4: {
                msg.color(this.colorMythical);
                break;
            }
            default: {
                msg.color(this.colorUncommon);
            }
        }
        this.tokens.push({ type: TYPE_TEXT, value });
        return this;
    }
    /**
     * Adds an item link by a given {@link itemId}, a rarity {@link grade} and a {@link name}.
     * @param {number} itemId the id of the item
     * @param {string|number} name the name of the item
     * @param {number} grade the rarity grade (0 = common, 1 = uncommon, 2 = rare, 3 = superior, 4 = mythical)
     * @param {bigint} dbid the dbid of the item
     * @param {string} author the character's name of who created the link
     * @returns the builder (for chaining)
     */
    chatLink(itemId, name = '', grade = 0, dbid = 0n, author = '') {
        return this.rarity(grade, `<ChatLinkAction param="1#####${itemId}@${dbid}@${author}">${name}</ChatLinkAction>`);
    }
    /**
     * Adds color to the text. Color will remain until a new color is added or
     * an attribute changing method with no argument is called.
     * @param  {string} [color]   the color
     * @return {MessageBuilder} the builder (for chaining)
     */
    color(color) {
        if (color && typeof color != "string")
            throw new TypeError(`${color} is from type ${typeof color}, but should be a string in color format.`);
        this.tokens.push({ type: TYPE_COLOR, value: MessageBuilder.escapeHtml(color) });
        return this;
    }
    /**
     * Adds size to the text. Size will remain until a new size is added or
     * an attribute changing method with no argument is called.
     * @param  {number|string} size the size
     * @return {MessageBuilder}     the builder (for chaining)
     */
    size(size) {
        if (size) {
            if (typeof size == "string")
                size = MessageBuilder.escapeHtml(size);
            else if (typeof size != "number")
                throw new TypeError(`${size} is from type ${typeof size}, but should be a number.`);
        }
        this.tokens.push({ type: TYPE_SIZE, value: size });
        return this;
    }
    _addAttribute(msg, curToken, lastToken, lastAttrType, fontLevel) {
        let curType = curToken.type;
        if (fontLevel > 0) {
            if ((lastToken.type == TYPE_TEXT && curType == lastAttrType) || !curToken.value) {
                msg.push("</font>");
                for (let a in this.usedAttributes) {
                    this.usedAttributes[a] = 0;
                }
                fontLevel--;
            }
            else if ((lastToken.value && lastToken.type == curType) || this.usedAttributes[curType] > 0) {
                msg.push(">");
            }
        }
        if (curToken.value) {
            var typeString = ` ${curType}="${curToken.value}"`;
            if (lastToken.type == TYPE_TEXT
                || lastToken.type == TYPE_NONE
                || this.usedAttributes[curType] > 0
                || !lastToken.value) {
                msg.push("<font");
                for (let a in this.usedAttributes) {
                    this.usedAttributes[a] = 0;
                }
                fontLevel++;
            }
            this.usedAttributes[curType] = 1;
            msg.push(typeString);
        }
        return fontLevel;
    }
    /**
     * Builds and returns the message as an html-formatted string.
     * HTML-tags are created through build commands and HTML-tags entered via text
     * are escaped to the corresponding characters.
     * By default clears the message builder afterwards.
     * @param {boolean} clearAfterwards wether the message builder should be cleared
     * after building the message
     * @return {string} the concatenated message as a html-formatted string
     */
    toHtml(clearAfterwards = true) {
        let msg = [];
        let lastToken = {
            type: TYPE_NONE,
            value: ""
        };
        let lastAttrType = "";
        let fontLevel = 0;
        for (let i = 0; i < this.tokens.length; i++) {
            let curToken = this.tokens[i];
            switch (curToken.type) {
                case TYPE_COLOR:
                    fontLevel = this._addAttribute(msg, curToken, lastToken, lastAttrType, fontLevel);
                    lastAttrType = TYPE_COLOR;
                    break;
                case TYPE_SIZE:
                    fontLevel = this._addAttribute(msg, curToken, lastToken, lastAttrType, fontLevel);
                    lastAttrType = TYPE_SIZE;
                    break;
                case TYPE_TEXT:
                    if (lastToken.type !== TYPE_NONE && lastToken.type !== TYPE_TEXT) {
                        if (lastToken.value) {
                            msg.push(">");
                        }
                    }
                    msg.push(curToken.value.toString());
                    break;
                default: // illegal token
            }
            lastToken = curToken;
        }
        if (lastToken.type !== TYPE_TEXT && lastToken.value)
            msg.push(">");
        while (fontLevel--) {
            msg.push("</font>");
        }
        if (clearAfterwards)
            this.clear();
        return msg.join("");
    }
    /**
     * Builds and returns the message as a string.
     * By default clears the message builder afterwards.
     * @param {boolean} clearAfterwards wether the message builder should be cleared
     * after building the message
     * @return {string} the concatenated message as a string
     */
    toString(clearAfterwards = true) {
        let msg = [];
        for (let token of this.tokens) {
            if (token.type == TYPE_TEXT)
                msg.push(token.value);
        }
        if (clearAfterwards)
            this.clear();
        return MessageBuilder.unescapeHtml(msg.join(""));
    }
    clear() {
        this.tokens = [];
        this.usedAttributes = {
            color: 0,
            size: 0
        };
    }
}
module.exports = MessageBuilder;
