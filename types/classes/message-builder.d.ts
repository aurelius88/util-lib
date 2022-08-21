declare type Token = {
    type: string;
    value: string | number | bigint | boolean;
};
/**
 * [MessageBuilder description]
 */
declare class MessageBuilder {
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
    private tokens;
    private usedAttributes;
    constructor();
    /**
     * Appends text to the builder.
     * @param  {string|number|boolean|bigint} text the text to be appended
     * @return {MessageBuilder}                    the builder (for chaining)
     */
    text(text: string | number | boolean | bigint): this;
    static escapeHtml(unsafe: string): string;
    static unescapeHtml(unsafe: string): string;
    /**
     * Adds a value with a value dependend color depending on max and min.
     * @param  {string|number} value           the value
     * @param  {number} [max=2 * value] the maximal value which value can reach
     * @param  {number} [min=0]         the minimal value which value can reach
     * @param  {number} [mid=max > min ? 0.4 * max : 0.4 * min] the value inbetween
     * @return {MessageBuilder}         the builder (for chaining)
     */
    coloredValue(value: string | number | bigint | boolean, max: number, min: number | undefined, mid: number): MessageBuilder;
    /**
     * Adds a text with a fix color for values.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    value(value: string | number | bigint | boolean): MessageBuilder;
    /**
     * Adds a text with a fix color for commands.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    command(value: string | number | bigint | boolean): MessageBuilder;
    /**
     * Adds a text with a fix color for highlighting.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    highlight(value: string | number | bigint | boolean): MessageBuilder;
    /**
     * Adds a text with a fix color for enabling.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    enable(value: string | number | bigint | boolean): MessageBuilder;
    /**
     * Adds a text with a fix color for disabling.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    disable(value: string | number | bigint | boolean): MessageBuilder;
    /**
     * Adds a text with a fix color for a common item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    common(value: string | number | bigint | boolean): this;
    /**
     * Adds a text with a fix color for a uncommon item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    uncommon(value: string | number | bigint | boolean): this;
    /**
     * Adds a text with a fix color for a rare item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    rare(value: string | number | bigint | boolean): this;
    /**
     * Adds a text with a fix color for a superior item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    superior(value: string | number | bigint | boolean): this;
    /**
     * Adds a text with a fix color for a mythical item.
     * @param  {string|number} value    the text
     * @return {MessageBuilder}  the builder (for chaining)
     */
    mythical(value: string | number | bigint | boolean): this;
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
    rarity(grade: number, value: string | number | bigint | boolean): this;
    /**
     * Adds an item link by a given {@link itemId}, a rarity {@link grade} and a {@link name}.
     * @param {number} itemId the id of the item
     * @param {string|number} name the name of the item
     * @param {number} grade the rarity grade (0 = common, 1 = uncommon, 2 = rare, 3 = superior, 4 = mythical)
     * @param {bigint} dbid the dbid of the item
     * @param {string} author the character's name of who created the link
     * @returns the builder (for chaining)
     */
    chatLink(itemId: number, name?: number | string, grade?: number, dbid?: bigint, author?: string): MessageBuilder;
    /**
     * Adds color to the text. Color will remain until a new color is added or
     * an attribute changing method with no argument is called.
     * @param  {string} [color]   the color
     * @return {MessageBuilder} the builder (for chaining)
     */
    color(color: string): MessageBuilder;
    /**
     * Adds size to the text. Size will remain until a new size is added or
     * an attribute changing method with no argument is called.
     * @param  {number|string} size the size
     * @return {MessageBuilder}     the builder (for chaining)
     */
    size(size: number | string): this;
    _addAttribute(msg: string[], curToken: Token, lastToken: Token, lastAttrType: string, fontLevel: number): number;
    /**
     * Builds and returns the message as an html-formatted string.
     * HTML-tags are created through build commands and HTML-tags entered via text
     * are escaped to the corresponding characters.
     * By default clears the message builder afterwards.
     * @param {boolean} clearAfterwards wether the message builder should be cleared
     * after building the message
     * @return {string} the concatenated message as a html-formatted string
     */
    toHtml(clearAfterwards?: boolean): string;
    /**
     * Builds and returns the message as a string.
     * By default clears the message builder afterwards.
     * @param {boolean} clearAfterwards wether the message builder should be cleared
     * after building the message
     * @return {string} the concatenated message as a string
     */
    toString(clearAfterwards?: boolean): string;
    clear(): void;
}
export = MessageBuilder;
