const binarySearch = require( "binary-search" );

function _colorByValueMap( value, valueColorMap ) {
    let colorSteps = Array.from( valueColorMap.keys() );
    colorSteps.sort( _compareNumbers );
    let max = colorSteps[colorSteps.length - 1];
    let min = colorSteps[0];
    let currentStep = value > max ? max : value < min ? min : value;
    if ( currentStep === min || currentStep === max ) {
        return valueColorMap.get( currentStep );
    } else {
        let local = _localMinMax( colorSteps, currentStep, _compareNumbers );
        let minColor = valueColorMap.get( local.min );
        let maxColor = valueColorMap.get( local.max );
        let relVal = relativeValue( local.min, local.max, value );
        return lerpArray( minColor, maxColor, relVal ).map( Math.round );
    }
}

function lerpArray( start, end, t ) {
    if ( !Array.isArray( start ) || !Array.isArray( end ) )
        throw new TypeError(
            `The first two arguments must be arrays, but start were ${typeof start} and end were ${typeof end}.`
        );
    if ( start.length != end.length ) throw new Error( "Both arrays need to be from the same length." );
    let result = [];
    for ( let i = 0; i < start.length && i < end.length; i++ ) {
        result.push( lerp( start[i], end[i], t ) );
    }
    return result;
}

function relativeValue( start, end, value ) {
    return ( value - start ) / ( end - start );
}

function lerp( start, end, t ) {
    return ( 1 - t ) * start + t * end;
}

function _localMinMax( array, value, comparator ) {
    let localMaxIndex = binarySearch( array, value, comparator );
    if ( localMaxIndex < 0 ) localMaxIndex = ~localMaxIndex;
    let localMax = array[localMaxIndex];
    let localMin = array[localMaxIndex > 0 ? localMaxIndex - 1 : localMaxIndex];
    return { min: localMin, max: localMax };
}

function _colorByValueObject( value, valueColorMap ) {
    let colorSteps = Object.keys( valueColorMap );
    colorSteps.sort( _compareNumbers );
    let max = colorSteps[colorSteps.length - 1];
    let min = colorSteps[0];
    let currentStep = value > max ? max : value < min ? min : value;
    if ( currentStep === min || currentStep === max ) {
        return valueColorMap[currentStep];
    } else {
        let local = _localMinMax( colorSteps, currentStep, _compareNumbers );
        let minColor = valueColorMap[local.min];
        let maxColor = valueColorMap[local.max];
        let relVal = 1 - ( local.max - currentStep ) / ( local.max - local.min );
        let resColor = [];
        for ( let i = 0; i < minColor.length; i++ ) {
            resColor[i] = ( maxColor[i] - minColor[i]) * relVal - minColor[i];
        }
        return resColor;
    }
}

function _compareNumbers( a, b ) {
    return a - b;
}

class ChatHelper {
    constructor( mod ) {
        this.COLOR_ENABLE = ChatHelper.COLOR_ENABLE;
        this.COLOR_DISABLE = ChatHelper.COLOR_DISABLE;
        this.COLOR_COMMAND = ChatHelper.COLOR_COMMAND;
        this.COLOR_VALUE = ChatHelper.COLOR_VALUE;
        this.COLOR_HIGHLIGHT = ChatHelper.COLOR_HIGHLIGHT;
        this.mod = mod;
        this.timed = false;
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
        return "rgb(255, 40, 40)";
    }
    static get COLOR_VALUE_NORMAL() {
        return "rgb(255, 255, 40)";
    }
    static get COLOR_VALUE_MAX() {
        return "rgb(40, 255, 40)";
    }
    static get COLOR_VALUE() {
        return "#09d1d1";
    }
    static get COLOR_HIGHLIGHT() {
        return "#81ee7b";
    }

    static parseColor( input ) {
        if ( input.substr( 0, 1 ) == "#" ) {
            let collen = ( input.length - 1 ) / 3;
            let fact = [17, 1, 0.062272][collen - 1];
            return [
                Math.round( parseInt( input.substr( 1, collen ), 16 ) * fact ),
                Math.round( parseInt( input.substr( 1 + collen, collen ), 16 ) * fact ),
                Math.round( parseInt( input.substr( 1 + 2 * collen, collen ), 16 ) * fact )
            ];
        } else
            return input
                .split( "(" )[1]
                .split( ")" )[0]
                .split( "," )
                .map( Math.round );
    }

    static colorByValue( value, valueColorMap ) {
        let type = valueColorMap.toString();
        if ( !valueColorMap || !["[object Object]", "[object Map]"].includes( type ) )
            throw new Error( "Cannot generate a color without color map (Map or object). [value -> color]" );
        if ( type === "object" ) {
            if ( Object( valueColorMap ).keys().length ) return _colorByValueObject( value, valueColorMap );
        } else {
            if ( valueColorMap.size ) return _colorByValueMap( value, valueColorMap );
        }
        throw new Error( "There should be at least 1 value to color mapping." );
    }

    setTimedMessage( timed ) {
        this.timed = timed;
    }

    setConsoleOut( consoleOut ) {
        this.consoleOut = consoleOut;
    }

    /**
     * Prints the message in game and in console with local time stamp.
     * @param  {string}  message           The message.
     * @param  {Boolean} [consoleOut=true] Also print in console?
     * @memberOf OutputHelper
     */
    printMessage( message, consoleOut = false ) {
        let time = `[${new Date().toLocaleTimeString()}]: `;
        if ( this.timed ) {
            message = time + message;
        }
        this.mod.command.message( message );
        if ( consoleOut ) {
            if ( !this.timed ) message = time + message;
            this.mod.log( ChatHelper.cleanString( message ) );
        }
    }

    /**
     * Returns a html-tag-free string.
     * @param  {string} dirtyString the string with html tags.
     * @return {string}             a html-tag-free string.
     * @static
     * @memberOf OutputHelper
     */
    static cleanString( dirtyString ) {
        return dirtyString.replace( /<[^>]*>/g, "" );
    }

    // delegates to ChatHelper.cleanString
    cleanString( dirtyString ) {
        return ChatHelper.cleanString( dirtyString );
    }

    /**
     * Converts a time in milliseconds to UTC time string.
     * @param  {Number} timeInMs The time in milliseconds as integer.
     * @return {string}          Returns the time in the format: hh:MM:SS
     * @static
     * @memberOf OutputHelper
     */
    static msToUTCTimeString( timeInMs ) {
        let secs = Math.floor( timeInMs / 1000.0 ),
            mins = Math.floor( secs / 60.0 ),
            h = Math.floor( mins / 60.0 ),
            s = secs % 60,
            m = mins % 60;
        s = ChatHelper.addPrefixZero( s );
        m = ChatHelper.addPrefixZero( m );
        h = ChatHelper.addPrefixZero( h );
        return `${h}:${m}:${s}`;
    }

    // delegates to ChatHelper.msToUTCTimeString
    msToUTCTimeString( timeInMs ) {
        return ChatHelper.msToUTCTimeString( timeInMs );
    }

    /**
     * Adds a zero to numbers smaller than base.
     * @param {[number|string]} num The number to be formatted.
     * @return Returns the number as string with 0 prefix or
     * the number if no prefix needed.
     * @static
     * @memberOf OutputHelper
     */
    static addPrefixZero( num, base = 10 ) {
        if ( parseInt( num, base ) < base ) {
            num = "0" + num;
        }
        return num;
    }

    // delegates to ChatHelper.addPrefixZero
    addPrefixZero( num ) {
        return ChatHelper.addPrefixZero( num );
    }
}

module.exports = ChatHelper;
