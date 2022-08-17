/// <reference types="tera-toolbox-types" />
/// <reference types="node" />
import { NetworkModInterface } from "tera-toolbox/bin/mod.js";
declare class ChecksumPacketSender {
    private mod;
    private context;
    private packetCorrector;
    constructor(mod: NetworkModInterface<null, null, ChecksumPacketSender>);
    /**
     * Sends the packet with the correct count and checksum.
     * Only supported packets are allowed.
     * @param identifier the definition name of the packet
     * @param version the version number of the packet
     * @param data the data as defined in the definition
     * @returns `true`, if it is sent successfully. Otherwise `false`.
     */
    send(identifier: string | number, version: number | '*', data: object): boolean;
    /**
     * Sends the raw packet with the correct count and checksum.
     * Only supported packets are allowed.
     * @param data the data as a {@link Buffer} in the correct format
     * @returns `true`, if it is sent successfully. Otherwise `false`.
     */
    sendRaw(data: Buffer): boolean;
    /**
     * Sends the `C_STORE_COMMIT` packet with the correct count and checksum.
     * Closes the deal with the vendor. The items in the buy-basket will
     * bought and the items in the sell-basket will be sold.
     * @param version the version of the packet definition
     * @returns `true`, if it is sent successfully. Otherwise `false`.
     */
    sendStoreCommit(version?: number | '*'): boolean;
    /**
     * Sends the `C_STORE_SELL_ADD_BASKET` packet with the correct count and checksum.
     * The {@link amount} times items with {@link itemId} are added
     * to the vendor's basket and transferred from the pocket with number
     * {@link pocket} and slot number {@link slot}.
     * @param version the version of the packet definition
     * @param itemId the itemId of the item
     * @param amount the amount of the item
     * @param pocket the pocket number to be transferred from. Where 0
     * is the common inventory and 1-4 are the additional pockets.
     * @param slot the slot number to be transferred from. Starting from top
     * left with 0. Increasing from left to right, top to bottom.
     * @returns `true`, if it is sent successfully. Otherwise `false`.
     */
    sendStoreSellAddBasket(itemId: number, amount: number, pocket: number, slot: number, version?: number | '*'): boolean;
    /**
     * Sends the `C_STORE_SELL_DEL_BASKET` packet with the correct count and checksum.
     * The {@link amount} times items with {@link itemId} are removed
     * from the vendor's basket and transferred to the pocket with number
     * {@link pocket} and slot number {@link slot}.
     * @param version the version of the packet definition
     * @param itemId the itemId of the item
     * @param amount the amount of the item
     * @param pocket the pocket number to be transferred to. Where 0
     * is the common inventory and 1-4 are the additional pockets.
     * @param slot the slot number to be transferred to. Starting from top
     * left with 0. Increasing from left to right, top to bottom.
     * @returns `true`, if it is sent successfully. Otherwise `false`.
     */
    sendStoreSellDelBasket(itemId: number, amount: number, pocket: number, slot: number, version?: number | '*'): boolean;
}
export = ChecksumPacketSender;
