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
        let relVal = 1 - ( local.max - currentStep ) / ( local.max - local.min );
        let resColor = [];
        for ( let i = 0; i < minColor.length; i++ ) {
            resColor[i] = ( maxColor[i] - minColor[i]) * relVal - minColor[i];
        }
        return resColor;
    }
}

function _localMinMax( array, value, comparator ) {
    let localMinIndex = binarySearch( array, value, comparator );
    if ( localMinIndex < 0 ) localMinIndex = ~localMinIndex;
    let localMin = array[localMinIndex];
    let localMax = array[localMinIndex < array.length - 1 ? localMinIndex + 1 : localMinIndex];
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
        this.COLOR_ENABLE = "#56B4E9";
        this.COLOR_DISABLE = "#e64500";
        this.COLOR_COMMAND = "#e6a321";
        this.COLOR_VALUE = "#09d1d1";
        this.COLOR_HIGHLIGHT = "#81ee7b";
        this.mod = mod;
    }

    static colorByValue( value, valueColorMap ) {
        let type = valueColorMap.toString();
        if ( !valueColorMap || !["object", "Map"].includes( type ) )
            throw new Error( "Cannot generate a color without color map (Map or object). [value -> color]" );
        if ( type === "object" ) {
            if ( Object( valueColorMap ).keys().length ) return _colorByValueObject( value, valueColorMap );
        } else {
            if ( valueColorMap.size ) return _colorByValueMap( value, valueColorMap );
        }
        throw new Error( "There should be at least 1 value to color mapping." );
    }

    /**
     * Prints the message in game and in console with local time stamp.
     * @param  {string}  message           The message.
     * @param  {Boolean} [consoleOut=true] Also print in console?
     * @memberOf OutputHelper
     */
    printMessage( message, consoleOut = false ) {
        let timedMessage = `[${new Date().toLocaleTimeString()}]: ${message}`;
        this.mod.command.message( timedMessage );
        if ( consoleOut ) console.log( ChatHelper.cleanString( timedMessage ) );
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
        return ChatHelper.cleanString(dirtyString);
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
     * Adds a zero to numbers smaller than 10.
     * @param {[type]} num The number to be formatted.
     * @return Returns the number as string with 0 prefix or
     * the number if no prefix needed.
     * @static
     * @memberOf OutputHelper
     */
    static addPrefixZero( num ) {
        if ( num < 10 ) {
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
