/**
 * [CommandBuilder description]
 */
class CommandBuilder {
    constructor() {
        this.commands = {};
    }

    _getSubCommand( subCommand ) {
        let parts = subCommand ? subCommand.split( "." ) : [];
        let result = this.commands;
        for ( let part of parts ) {
            if ( part ) result = result[part];
        }
        return result;
    }

    addCommand( commandName, commandCallback, subCommand = "" ) {
        this._getSubCommand( subCommand )[commandName] = commandCallback;
        this._creatHelp( commandName, subCommand );
    }

    _createHelp( commandName, subCommand = "" ) {
        subCommand = subCommand ? "help." + subCommand : "help";
        let helpCmd = this._getSubCommand( subCommand )[commandName];
    }
}

module.exports = CommandBuilder;
