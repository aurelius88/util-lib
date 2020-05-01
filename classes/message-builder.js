const ChatHelper = require( "./chat-helper" );

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

        this.colorEnable = ChatHelper.COLOR_ENABLE;
        this.colorDisable = ChatHelper.COLOR_DISABLE;
        this.colorValue = ChatHelper.COLOR_VALUE;
        this.colorValueMin = ChatHelper.COLOR_VALUE_MIN;
        this.colorValueMid = ChatHelper.COLOR_VALUE_NORMAL;
        this.colorValueMax = ChatHelper.COLOR_VALUE_MAX;
        this.colorHighlight = ChatHelper.COLOR_HIGHLIGHT;
        this.colorCommand = ChatHelper.COLOR_COMMAND;
    }

    /**
     * Appends text to the builder.
     * @param  {string|number|boolean|bigint} text the text to be appended
     * @return {MessageBuilder}                    the builder (for chaining)
     */
    text( text ) {
        let allowedTypes = ["string", "number", "boolean", "bigint"];
        if ( !allowedTypes.some( x => typeof x ) )
            throw new TypeError(
                `${typeof text} is not an allowed type. Should be one of these: ${JSON.stringify( allowedTypes )}.`
            );
        this.tokens.push({ type: TYPE_TEXT, value: MessageBuilder.escapeHtml( text ) });
        return this;
    }

    static escapeHtml( unsafe ) {
        if ( !unsafe || typeof unsafe != "string" ) return unsafe;
        return unsafe
            .replace( /&/g, "&amp;" )
            .replace( /</g, "&lt;" )
            .replace( />/g, "&gt;" )
            .replace( /"/g, "&quot;" )
            .replace( /'/g, "&#039;" );
    }

    /**
     * Adds a value with a value dependend color depending on max and min.
     * @param  {string|number} value           the value
     * @param  {number} [max=2 * value] the maximal value which value can reach
     * @param  {number} [min=0]         the minimal value which value can reach
     * @param  {number} [mid=max > min ? 0.4 * max : 0.4 * min] the value inbetween
     * @return {MessageBuilder}         the builder (for chaining)
     */
    coloredValue( value, max, min = 0, mid ) {
        // bigint conversion (no precission required)
        value = typeof value === "bigint" ? Number( value ) : value;
        max = typeof max === "bigint" ? Number( max ) : max;
        min = typeof min === "bigint" ? Number( min ) : min;
        mid = typeof mid === "bigint" ? Number( mid ) : mid;
        // default values
        if ( max == undefined ) max = 2 * value;
        if ( mid == undefined ) {
            mid = max > min ? 0.4 * ( max - min ) + min : 0.4 * ( min - max ) + max;
        }
        let map = new Map([
            [max, ChatHelper.parseColor( this.colorValueMax )],
            [mid, ChatHelper.parseColor( this.colorValueMid )],
            [min, ChatHelper.parseColor( this.colorValueMin )]
        ]);
        let clr = ChatHelper.colorByValue( value, map );
        return this.color(
            `#${ChatHelper.addPrefixZero( clr[0].toString( "16" ) )}`
                + ChatHelper.addPrefixZero( clr[1].toString( "16" ) )
                + ChatHelper.addPrefixZero( clr[2].toString( "16" ) )
        ).text( value );
    }

    /**
     * Adds a text with a fix color for values.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    value( value ) {
        return this.color( this.colorValue ).text( value );
    }

    /**
     * Adds a text with a fix color for commands.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    command( value ) {
        return this.color( this.colorCommand ).text( value );
    }

    /**
     * Adds a text with a fix color for highlighting.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    highlight( value ) {
        return this.color( this.colorHighlight ).text( value );
    }

    /**
     * Adds a text with a fix color for enabling.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    enable( value ) {
        return this.color( this.colorEnable ).text( value );
    }

    /**
     * Adds a text with a fix color for disabling.
     * @param  {string|number} value    the value
     * @return {MessageBuilder}  the builder (for chaining)
     */
    disable( value ) {
        return this.color( this.colorDisable ).text( value );
    }

    /**
     * Adds color to the text. Color will remain until a new color is added or
     * an attribute changing method with no argument is called.
     * @param  {string} color   the color
     * @return {MessageBuilder} the builder (for chaining)
     */
    color( color ) {
        if ( color && typeof color != "string" )
            throw new TypeError( `${color} is from type ${typeof color}, but should be a string in color format.` );
        this.tokens.push({ type: TYPE_COLOR, value: MessageBuilder.escapeHtml( color ) });
        return this;
    }

    /**
     * Adds size to the text. Size will remain until a new size is added or
     * an attribute changing method with no argument is called.
     * @param  {number|string} size the size
     * @return {MessageBuilder}     the builder (for chainingescapeHtml;

     */
    size( size ) {
        if ( size ) {
            if ( typeof size == "string" ) size = MessageBuilder.escapeHtml( size );
            else if ( typeof size != "number" )
                throw new TypeError( `${size} is from type ${typeof size}, but should be a number.` );
        }
        this.tokens.push({ type: TYPE_SIZE, value: size });
        return this;
    }

    _addAttribute( msg, curToken, lastToken, lastAttrType, fontLevel ) {
        let curType = curToken.type;
        if ( fontLevel > 0 ) {
            if ( ( lastToken.type == TYPE_TEXT && curType == lastAttrType ) || !curToken.value ) {
                msg.push( "</font>" );
                for ( let a in this.usedAttributes ) {
                    this.usedAttributes[a] = 0;
                }
                fontLevel--;
            } else if ( ( lastToken.value && lastToken.type == curType ) || this.usedAttributes[curType] > 0 ) {
                msg.push( ">" );
            }
        }
        if ( curToken.value ) {
            var typeString = ` ${curType}="${curToken.value}"`;
            if (
                lastToken.type == TYPE_TEXT
                || lastToken.type == TYPE_NONE
                || this.usedAttributes[curType] > 0
                || !lastToken.value
            ) {
                msg.push( "<font" );
                for ( let a in this.usedAttributes ) {
                    this.usedAttributes[a] = 0;
                }
                fontLevel++;
            }
            this.usedAttributes[curType] = 1;
            msg.push( typeString );
        }
        return fontLevel;
    }

    toHtml( clearAfterwards = false ) {
        let msg = [];
        let lastToken = {
            type: TYPE_NONE
        };
        let lastAttrType = "";
        let fontLevel = 0;
        for ( let i = 0; i < this.tokens.length; i++ ) {
            let curToken = this.tokens[i];
            switch ( curToken.type ) {
                case TYPE_COLOR:
                    fontLevel = this._addAttribute( msg, curToken, lastToken, lastAttrType, fontLevel );
                    lastAttrType = TYPE_COLOR;
                    break;
                case TYPE_SIZE:
                    fontLevel = this._addAttribute( msg, curToken, lastToken, lastAttrType, fontLevel );
                    lastAttrType = TYPE_SIZE;
                    break;
                case TYPE_TEXT:
                    if ( lastToken.type !== TYPE_NONE && lastToken.type !== TYPE_TEXT ) {
                        if ( lastToken.value ) {
                            msg.push( ">" );
                        }
                    }
                    msg.push( curToken.value );
                    break;
                default: // illegal token
            }
            lastToken = curToken;
        }
        if ( lastToken.type !== TYPE_TEXT && lastToken.value ) msg.push( ">" );
        while ( fontLevel-- ) {
            msg.push( "</font>" );
        }
        if ( clearAfterwards ) this.clear();
        return msg.join( "" );
    }

    toString( clearAfterwards = false ) {
        let msg = [];
        for ( let token of this.tokens ) {
            if ( token.type == TYPE_TEXT ) msg.push( token.value );
        }
        if ( clearAfterwards ) this.clear();
        return msg.join( "" );
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
