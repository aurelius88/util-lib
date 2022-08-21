// aka chat type
enum Channel {
    // ##### Basic ######
    Normal = 0,
    Party = 1,
    Guild = 2,
    Area = 3,
    Trade = 4, // Bargain
    // Team?
    // Dealing?
    Whisper = 7,
    Greet = 9, // Skill
    PartyNotice = 21,
    Emote = 26, // Social
    Global = 27,
    RaidNotice = 25,
    // RaidLeader?
    Raid = 32,
    Megaphone = 213,
    GuildPromotion = 214,   // Guild Advertising
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
    Private1 = 11,
    Private2 = 12,
    Private3 = 13,
    Private4 = 14,
    Private5 = 15,
    Private6 = 16,
    Private7 = 17,
    Private8 = 18,
}
export = Channel;
