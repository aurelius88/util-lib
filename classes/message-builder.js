const TYPE_COLOR = "color";
const TYPE_SIZE = "size";
const TYPE_TEXT = "text";
const TYPE_NONE = "none";

/**
 * [MessageBuilder description]
 */
class MessageBuilder {
    constructor( mod, classes ) {
        this.mod = mod;
        this.classes = classes;
        this.tokens = [];
        this.usedAttributes = {
            color: 0,
            size: 0
        };
    }

    newInstance() {
        let instance = new MessageBuilder( this.mod, this.classes );
        instance.classes["message-builder"] = instance;
        return instance;
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
        if ( !unsafe ) return unsafe;
        return unsafe
            .replace( /&/g, "&amp;" )
            .replace( /</g, "&lt;" )
            .replace( />/g, "&gt;" )
            .replace( /"/g, "&quot;" )
            .replace( /'/g, "&#039;" );
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
                lastToken.type == TYPE_TEXT ||
                lastToken.type == TYPE_NONE ||
                this.usedAttributes[curType] > 0 ||
                !lastToken.value
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

    toHtml() {
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
        return msg.join( "" );
    }

    toString() {
        let msg = [];
        for ( let token of this.tokens ) {
            if ( token.type == TYPE_TEXT ) msg.push( token.value );
        }
        return msg.join( "" );
    }
}

module.exports = MessageBuilder;
