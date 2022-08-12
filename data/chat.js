"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
// aka chat type
var Channel;
(function (Channel) {
    // ##### Basic ######
    Channel[Channel["Normal"] = 0] = "Normal";
    Channel[Channel["Party"] = 1] = "Party";
    Channel[Channel["Guild"] = 2] = "Guild";
    Channel[Channel["Area"] = 3] = "Area";
    Channel[Channel["Trade"] = 4] = "Trade";
    // Team?
    // Dealing?
    Channel[Channel["Whisper"] = 7] = "Whisper";
    Channel[Channel["Greet"] = 9] = "Greet";
    Channel[Channel["PartyNotice"] = 21] = "PartyNotice";
    Channel[Channel["Emote"] = 26] = "Emote";
    Channel[Channel["Global"] = 27] = "Global";
    Channel[Channel["RaidNotice"] = 25] = "RaidNotice";
    // RaidLeader?
    Channel[Channel["Raid"] = 32] = "Raid";
    Channel[Channel["Megaphone"] = 213] = "Megaphone";
    Channel[Channel["GuildPromotion"] = 214] = "GuildPromotion";
    // LFGLimit
    // LFG
    // RP
    // ###### Battle ######
    // MyAttack
    // MyCriticalAttack
    // MyFallingDamage
    // MyDamageSmall
    // MyCriticalDamageSmall
    // MyDamage
    // MyCriticalDamage
    // MyDamageLarge
    // MyCriticalDamageLarge
    // ###### System ######
    // AdminNotice
    // Info         // Alerts
    // WorldInfo    // WorldAlerts
    // ErrorInfo    // Notices
    // PartyInfo    // PartyAlerts
    // GuildInfo    // GuildAlerts
    // TeamInfo     // TeamAlerts
    // InteractionInfo  // UIAlerts
    // Warning
    // GetItemCommon
    // GetItemUncommon
    // GetItemRare
    // GetItemLegend
    // GetExp
    // GetMoney
    // ###### Private ######
    Channel[Channel["Private1"] = 11] = "Private1";
    Channel[Channel["Private2"] = 12] = "Private2";
    Channel[Channel["Private3"] = 13] = "Private3";
    Channel[Channel["Private4"] = 14] = "Private4";
    Channel[Channel["Private5"] = 15] = "Private5";
    Channel[Channel["Private6"] = 16] = "Private6";
    Channel[Channel["Private7"] = 17] = "Private7";
    Channel[Channel["Private8"] = 18] = "Private8";
})(Channel = exports.Channel || (exports.Channel = {}));
