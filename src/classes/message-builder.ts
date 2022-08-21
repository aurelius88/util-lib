import ChatHelper from "./chat-helper";

const TYPE_COLOR = "color";
const TYPE_SIZE = "size";
const TYPE_TEXT = "text";
const TYPE_NONE = "none";

type Token = { type: string, value: string | number | bigint | boolean }

/**
 * [MessageBuilder description]
 */
class MessageBuilder {
    colorEnable: string;
    colorDisable: string;
    colorValue: string;
    colorValueMin: string;
    colorValueMid: string;
    colorValueMax: string;
    colorHighlight: string;
    colorCommand: string;
    colorCommon: string;
    colorUncommon: string;
    colorRare: string;
    colorSuperior: string;
    colorMythical: string;
    private tokens!: Token[];
    private usedAttributes!: { [prop: string]: number; color: number; size: number; };
    constructor() {
        this.clear();

        this.colorEnable = ChatHelper.COLOR_ENABLE;
        this.colorDisable = ChatHelper.COLOR_DISABLE;
        this.colorValue = ChatHelper.COLOR_VALUE;
        this.colorValueMin = ChatHelper.COLOR_VALUE_MIN;
        this.colorValueMid = ChatHelper.COLOR_VALUE_NORMAL;
        this.colorValueMax = ChatHelper.COLOR_VALUE_MAX;
        this.colorHighlight = ChatHelper.COLOR_HIGHLIGHT;
        this.colorCommand = ChatHelper.COLOR_COMMAND;
        this.colorCommon = ChatHelper.COLOR_COMMON;
        this.colorUncommon = ChatHelper.COLOR_UNCOMMON;
        this.colorRare = ChatHelper.COLOR_RARE;
        this.colorSuperior = ChatHelper.COLOR_SUPERIOR;
        this.colorMythical = ChatHelper.COLOR_MYTHICAL;
    }

    /**
     * Appends text to the builder. Depending on the specified parameter {@link escaped}, html tags
     * are escaped or not. (Default: `escaped = false`)
     * @param  {string|number|boolean|bigint} text the text to be appended
     * @param  {boolean} escaped wether html tags in the text are being escaped (Default: `false`)
     * @return {MessageBuilder}                    the builder (for chaining)
     */
    text(text: string | number | boolean | bigint, escaped: boolean = false) {
        let allowedTypes = ["string", "number", "boolean", "bigint"];
        if (!allowedTypes.some(x => typeof x))
            throw new TypeError(
                `${typeof text} is not an allowed type. Should be one of these: ${JSON.stringify(allowedTypes)}.`
            );
        this.tokens.push({ type: TYPE_TEXT, value: escaped ? MessageBuilder.escapeHtml(String(text)) : text });
        return this;
    }

    /**
     * Appends html ***escaped*** text to the builder.
     * @param  {string|number|boolean|bigint} text the text to be appended
     * @return {MessageBuilder}                    the builder (for chaining)
     */
    escaped(text: string | number | boolean | bigint) {
        this.tokens.push({ type: TYPE_TEXT, value: MessageBuilder.escapeHtml(String(text)) });
        return this;
    }

    static escapeHtml(unsafe: string) {
        if (!unsafe || typeof unsafe != "string") return unsafe;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static unescapeHtml(unsafe: string) {
        if (!unsafe || typeof unsafe != "string") return unsafe;
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
    coloredValue(value: string | number | bigint | boolean, max: number, min = 0, mid: number) {
        // bigint conversion (no precission required)
        value = Number(value);
        max = typeof max === "bigint" ? Number(max) : max;
        min = typeof min === "bigint" ? Number(min) : min;
        mid = typeof mid === "bigint" ? Number(mid) : mid;
        // default values
        if (max == undefined) max = 2 * value;
        if (mid == undefined) {
            mid = max > min ? 0.4 * (max - min) + min : 0.4 * (min - max) + max;
        }
        let map = new Map([
            [max, ChatHelper.parseColor(this.colorValueMax)],
            [mid, ChatHelper.parseColor(this.colorValueMid)],
            [min, ChatHelper.parseColor(this.colorValueMin)]
        ]);
        let clr = ChatHelper.colorByValue(value, map);
        return this.color(
            `#${ChatHelper.addPrefixZero(clr[0].toString(16))}`
            + ChatHelper.addPrefixZero(clr[1].toString(16))
            + ChatHelper.addPrefixZero(clr[2].toString(16))
        ).text(value);
    }

    /**
     * Adds a text with a fix color for values.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    value(value: string | number | bigint | boolean) {
        return this.color(this.colorValue).text(value);
    }

    /**
     * Adds a text with a fix color for commands.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    command(value: string | number | bigint | boolean) {
        return this.color(this.colorCommand).text(value);
    }

    /**
     * Adds a text with a fix color for highlighting.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    highlight(value: string | number | bigint | boolean) {
        return this.color(this.colorHighlight).text(value);
    }

    /**
     * Adds a text with a fix color for enabling.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    enable(value: string | number | bigint | boolean) {
        return this.color(this.colorEnable).text(value);
    }

    /**
     * Adds a text with a fix color for disabling.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    disable(value: string | number | bigint | boolean) {
        return this.color(this.colorDisable).text(value);
    }

    /**
     * Adds a text with a fix color for a common item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    common(value: string | number | bigint | boolean) {
        return this.rarity(0, value);
    }

    /**
     * Adds a text with a fix color for a uncommon item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    uncommon(value: string | number | bigint | boolean) {
        return this.rarity(1, value);
    }

    /**
     * Adds a text with a fix color for a rare item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    rare(value: string | number | bigint | boolean) {
        return this.rarity(2, value);
    }

    /**
     * Adds a text with a fix color for a superior item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    superior(value: string | number | bigint | boolean) {
        return this.rarity(3, value);
    }

    /**
     * Adds a text with a fix color for a mythical item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    mythical(value: string | number | bigint | boolean) {
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
    rarity(grade: number, value: string | number | bigint | boolean) {
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
    chatLink(itemId: number, name: number | string = '', grade: number = 0, dbid: bigint = 0n, author: string = ''): MessageBuilder {
        return this.rarity(grade, `<ChatLinkAction param="1#####${itemId}@${dbid}@${author}">${name}</ChatLinkAction>`);
    }

    /**
     * Adds color to the text. Color will remain until a new color is added or
     * an attribute changing method with no argument is called.
     * @param  {string} [color]   the color
     * @return {MessageBuilder} the builder (for chaining)
     */
    color(color: string): MessageBuilder {
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
    size(size: number | string) {
        if (size) {
            if (typeof size == "string") size = MessageBuilder.escapeHtml(size);
            else if (typeof size != "number")
                throw new TypeError(`${size} is from type ${typeof size}, but should be a number.`);
        }
        this.tokens.push({ type: TYPE_SIZE, value: size });
        return this;
    }

    _addAttribute(msg: string[], curToken: Token, lastToken: Token, lastAttrType: string, fontLevel: number) {
        let curType = curToken.type;
        if (fontLevel > 0) {
            if ((lastToken.type == TYPE_TEXT && curType == lastAttrType) || !curToken.value) {
                msg.push("</font>");
                for (let a in this.usedAttributes) {
                    this.usedAttributes[a] = 0;
                }
                fontLevel--;
            } else if ((lastToken.value && lastToken.type == curType) || this.usedAttributes[curType] > 0) {
                msg.push(">");
            }
        }
        if (curToken.value) {
            var typeString = ` ${curType}="${curToken.value}"`;
            if (
                lastToken.type == TYPE_TEXT
                || lastToken.type == TYPE_NONE
                || this.usedAttributes[curType] > 0
                || !lastToken.value
            ) {
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
        let msg: string[] = [];
        let lastToken: Token = {
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
        if (lastToken.type !== TYPE_TEXT && lastToken.value) msg.push(">");
        while (fontLevel--) {
            msg.push("</font>");
        }
        if (clearAfterwards) this.clear();
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
            if (token.type == TYPE_TEXT) msg.push(token.value);
        }
        if (clearAfterwards) this.clear();
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

export = MessageBuilder
