
import { Dispatch, ProtocolMap } from "tera-network-proxy/connection/dispatch.js";
// import { resolve } from "path";
import { NetworkMod } from "tera-game-state";
import { NetworkModInterface } from "tera-toolbox/bin/mod.js";
const { generateChecksum, addresses, initialValueAddress } = require("../helper.node");
const memoryjs = require('memoryjs');

interface IPacketContext {

    /**
     * The definition names of the definitions that are supported by
     * this context.
     */
    get supportedDefinitions(): string[]
    /**
     * The dispatch containing the protocolMap and methods to 
     * process packets.
     */
    get dispatch(): Dispatch
    /**
     * The initial hash value used for the checksum calculation.
     */
    get initialHashValue(): number;
    /**
     * The id of the current game character.
     */
    get gameId(): bigint;
    /**
     * The id of the current contract. A contract often is a trade, but can also
     * be a teleportation request, fish delivery, storage or post access.
     */
    get contractId(): number;
    /**
     * Returns the client's packet count of the specified packet.
     * @param identifier either the opcode number or the packet name
     * @returns the packet count of the specified packet
     */
    count(identifier: string | number): number;
    /**
     * Increases the client's packet count of the specified packet by 1.
     * @param identifier either the opcode number or the packet name
     * @returns the incremented packet count of the specified packet
     */
    incrementCount(identifier: string | number): number;
    /**
     * Decreases the client's packet count of the specified packet by 1.
     * @param identifier either the opcode number or the packet name
     * @returns the incremented packet count of the specified packet
     */
    decrementCount(identifier: string | number): number;
}

class PacketContext implements IPacketContext {
    // private static readonly Path = resolve('.', 'packet-factory.json');
    private protocolMap: ProtocolMap;
    private packetCountAddresses: { [name: string]: number };

    constructor(
        public dispatch: Dispatch,
        private teraGameState: NetworkMod
    ) {
        this.protocolMap = dispatch.protocolMap;
        this.packetCountAddresses = addresses;
        // TODO what packets are countable?
        this.teraGameState.initialize('contract');
    }

    get supportedDefinitions(): string[] {
        return Object.keys(this.packetCountAddresses);
    }

    get initialHashValue(): number {
        const processObject = memoryjs.openProcess('TERA.exe');
        return memoryjs.readMemory(processObject.handle, processObject.modBaseAddr + initialValueAddress, memoryjs.UINT32) as number;
    }

    get gameId(): bigint {
        return this.teraGameState.me.gameId;
    }

    get contractId(): number {
        return this.teraGameState.contract.id;
    }

    count(identifier: number | string): number {
        let packetName = typeof identifier == 'number' ? this.protocolMap.code.get(identifier) : identifier;
        if (packetName == undefined) {
            throw new Error(`Cannot retrieve count of unknown opcode: Missing opcode mapping for ${identifier}.`);
        }
        let relativeAddress = this.packetCountAddresses[packetName];
        if (relativeAddress == undefined) {
            throw new Error(`Retrieving count is not supported for '${packetName}'`);
        }
        const processObject = memoryjs.openProcess('TERA.exe');
        return memoryjs.readMemory(processObject.handle, processObject.modBaseAddr + relativeAddress, memoryjs.UINT32) as number;
    }

    /**
     * 
     * @param identifier either the opcode number or the packet name
     * @returns the incremented packet count of the specified packet
     * @throws {@link Error} if there is a missing opcode mapping or the packet is not supported
     */
    incrementCount(identifier: string | number): number {
        return this.addCount(identifier, 1);
    }

    private addCount(identifier: string | number, value: number): number {
        const packetName = typeof identifier == 'number' ? this.protocolMap.code.get(identifier) : identifier;
        if (packetName == undefined) {
            throw new Error(`Cannot increase count of unknown opcode: Missing opcode mapping for ${identifier}.`);
        }
        const relativeAddress = this.packetCountAddresses[packetName];
        if (relativeAddress == undefined) {
            throw new Error(`Manipulating count is not supported for '${packetName}'`);
        }
        const processObject = memoryjs.openProcess('TERA.exe');
        const count = memoryjs.readMemory(processObject.handle, processObject.modBaseAddr + relativeAddress, memoryjs.UINT32) as number;
        memoryjs.writeMemory(processObject.handle, processObject.modBaseAddr + relativeAddress, count + value, memoryjs.UINT32);
        return memoryjs.readMemory(processObject.handle, processObject.modBaseAddr + relativeAddress, memoryjs.UINT32) as number;
    }

    /**
     * 
     * @param identifier either the opcode number or the packet name
     * @returns the decremented packet count of the specified packet
     * @throws {@link Error} if there is a missing opcode mapping or the packet is not supported
     */
    decrementCount(identifier: string | number): number {
        return this.addCount(identifier, -1);
    }
}

class ChecksumPacketSender {
    private context: PacketContext;
    private packetCorrector: PacketCorrector;

    constructor(private mod: NetworkModInterface<null, null, ChecksumPacketSender>) {
        this.context = new PacketContext(mod.dispatch, mod.game);
        this.packetCorrector = new PacketCorrector(this.context);
    }

    /**
     * Sends the packet with the correct count and checksum.
     * Only supported packets are allowed.
     * @param identifier the definition name of the packet
     * @param version the version number of the packet
     * @param data the data as defined in the definition
     * @returns `true`, if it is sent successfully. Otherwise `false`.
     */
    send(identifier: string | number, version: number | '*', data: object) {
        return this.sendRaw(this.mod.dispatch.toRaw(identifier, version, data));
    }

    /**
     * Sends the raw packet with the correct count and checksum.
     * Only supported packets are allowed.
     * @param data the data as a {@link Buffer} in the correct format
     * @returns `true`, if it is sent successfully. Otherwise `false`.
     */
    sendRaw(data: Buffer) {
        const opcode = data.readUInt16LE(2);
        const name = this.mod.dispatch.protocolMap.code.get(opcode);
        if (name == undefined)
            throw new Error(`Missing opcode mapping for '${opcode}'`);
        const index = this.context.supportedDefinitions.indexOf(name);
        if (index < 0)
            throw new Error(`Unsupported packet: '${name}'`);

        try {
            let correctedData = this.packetCorrector.correctChecksumPacketFromRaw(data);
            let result = false;
            switch (name[name.indexOf('TTB_') === 0 ? 4 : 0]) {
                case 'S':
                case 'I':
                    result = this.mod.toClient(correctedData);
                    break;
                case 'C':
                    result = this.mod.toServer(correctedData);
                    break;
                default:
                    throw new Error(`Unknown packet direction: ${name}`);
            }
            if (!result)
                this.packetCorrector.undo(name);
            return result;
        } catch (error) {
            this.packetCorrector.undo(name);
            this.mod.error(`Could not send '${name}' because of: ${error}`);
            return false;
        }
    }

    /**
     * Sends the `C_STORE_COMMIT` packet with the correct count and checksum.
     * Closes the deal with the vendor. The items in the buy-basket will
     * bought and the items in the sell-basket will be sold.
     * @param version the version of the packet definition
     * @returns `true`, if it is sent successfully. Otherwise `false`.
     */
    sendStoreCommit(version: number | '*' = '*') {
        return this.send('C_STORE_COMMIT', version, {
            gameId: this.mod.game.me.gameId,
            contract: this.mod.game.contract.id
        } as C_STORE_COMMIT_2);
    }

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
    sendStoreSellAddBasket(itemId: number, amount: number, pocket: number, slot: number, version: number | '*' = '*') {
        return this.send('C_STORE_SELL_ADD_BASKET', version, {
            gameId: this.mod.game.me.gameId,
            contract: this.mod.game.contract.id,
            itemId,
            amount,
            pocket,
            slot
        } as C_STORE_SELL_ADD_BASKET_2);
    }

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
    sendStoreSellDelBasket(itemId: number, amount: number, pocket: number, slot: number, version: number | '*' = '*') {
        return this.send('C_STORE_SELL_DEL_BASKET', version, {
            gameId: this.mod.game.me.gameId,
            contract: this.mod.game.contract.id,
            itemId,
            amount,
            pocket,
            slot
        } as C_STORE_SELL_DEL_BASKET_2);
    }
}

type C_STORE_SELL_ADD_BASKET_2 = {
    count: number;
    checksum: number;
    gameId: bigint;
    contract: number;
    itemId: number;
    amount: number;
    pocket: number;
    slot: number;
};
type C_STORE_SELL_DEL_BASKET_2 = {
    count: number;
    checksum: number;
    gameId: bigint;
    contract: number;
    itemId: number;
    amount: number;
    pocket: number;
    slot: number;
};
type C_STORE_COMMIT_2 = {
    count: number;
    checksum: number;
    gameId: bigint;
    contract: number;
}

class PacketCorrector {
    private dispatch;
    /**
     * Creates a packet corrector. The context class needs to implement
     * the IPacketContext interface:
     * ```
     *  interface IPacketContext {
     *      // The protocol map resolving opcodes to definition names and
     *      // vice versa. Structure of ProtocolMap:
     *      // {
     *      //     // definition name -> opcode
     *      //     name: Map<string, number>,
     *      //     // opcode -> definition name
     *      //     code: Map<number, string>,
     *      //     // opcode -> padding true/false (default: false)
     *      //     padding: boolean[]
     *      // }
     *      get protocolMap(): ProtocolMap
     * 
     *      // The initial hash value used for the checksum calculation.      
     *      get initialHashValue(): number;
     *  
     *      // The id of the current game character.
     *      get gameId(): bigint;
     *  
     *      // The id of the current contract. A contract often is a trade, 
     *      // but can also be a teleportation request, fish delivery, 
     *      // storage or post access.
     *      get contractId(): number;
     *  
     *      // Returns the client's packet count of the specified packet.
     *      // @param identifier either the opcode number or the packet name
     *      // @returns the packet count of the specified packet
     *      count(identifier: string | number): number;
     * 
     *      // Increases the client's packet count of the specified packet by 1.
     *      // @param identifier either the opcode number or the packet name
     *      incrementCount(identifier: string | number): void;
     *  }
     * ```
     * @param context the context adapter delegating to packet context data
     */
    constructor(private context: IPacketContext) {
        this.dispatch = context.dispatch;
    }

    /**
     * Corrects a checksum packet with correct generated count and checksum.
     * The raw packet must be in following format:
     * ```
     * // header
     * uint16 length
     * uint16 opcode
     * // checksum header
     * uint32 count
     * uint32 checksum
     * // data
     * // ...
     * ```
     * @param packet the corrected packet as a {@link Buffer}
     * @throws {@link Error} if 
     */
    correctChecksumPacketFromRaw(packet: Buffer) {
        const opcode = packet.readUInt16LE(2);
        const countBefore = this.context.count(opcode);
        const count = this.context.incrementCount(opcode);
        if (count - countBefore >>> 0 !== 1) {
            throw new Error(`Could not increment count properly. Would change ${countBefore} to ${count}, but should be ${countBefore + 1}`);
        }
        packet.writeUInt32LE(count, 4);
        packet.writeUInt32LE(generateChecksum(packet, this.context.initialHashValue), 8);
        return packet;
    }

    /**
     * Corrects a checksum packet with correct generated count and checksum.
     * 
     * @param name the opcode or definition name of the packet
     * @param version the version of the definition to be used
     * @param packet the packet's data
     * @returns the corrected packet as a {@link Buffer}
     */
    correctChecksumPacket(name: string | number, version: number | '*', packet: object) {
        let buffer = this.dispatch.toRaw(name, version, packet);
        return this.correctChecksumPacketFromRaw(buffer);
    }

    undo(identifier: string | number) {
        this.context.decrementCount(identifier);
    }
}

class PacketFactory {

    private protocolMap;
    /**
     * Creates a packet factory. The context class needs to implement
     * the PacketContextInterface interface:
     * ```
     *  interface PacketContextInterface {
     *      // The protocol map resolving opcodes to definition names and
     *      // vice versa. Structure of ProtocolMap:
     *      // {
     *      //     // definition name -> opcode
     *      //     name: Map<string, number>,
     *      //     // opcode -> definition name
     *      //     code: Map<number, string>,
     *      //     // opcode -> padding true/false (default: false)
     *      //     padding: boolean[]
     *      // }
     *      get protocolMap(): ProtocolMap
     * 
     *      // The initial hash value used for the checksum calculation.      
     *      get initialHashValue(): number;
     *  
     *      // The id of the current game character.
     *      get gameId(): bigint;
     *  
     *      // The id of the current contract. A contract often is a trade, 
     *      // but can also be a teleportation request, fish delivery, 
     *      // storage or post access.
     *      get contractId(): number;
     *  
     *      // Returns the client's packet count of the specified packet.
     *      // @param identifier either the opcode number or the packet name
     *      // @returns the packet count of the specified packet
     *      count(identifier: string | number): number;
     * 
     *      // Increases the client's packet count of the specified packet by 1.
     *      // @param identifier either the opcode number or the packet name
     *      incrementCount(identifier: string | number): void;
     *  }
     * ```
     * @param context the context adapter delegating to packet context data
     */
    constructor(private context: IPacketContext) {
        this.protocolMap = context.dispatch.protocolMap;
    }

    /**
     * ***Not yet implemented!***
     * @param identifier the opcode or packet name
     * @param data the date to be built from
     * @param version the version of the packet definition
     */
    buildPacket(identifier: number | string, data: Buffer, version: number | '*' = '*') {
        throw Error('buildPacket is not yet implemented');
    }

    /**
     * Creates a `C_STORE_COMMIT` packet as a {@link Buffer}.
     * @returns the packet as a {@link Buffer}
     */
    buildStoreCommitPacket() {
        const packetName = 'C_STORE_COMMIT';
        const opcode = this.protocolMap.name.get(packetName);
        if (opcode == undefined) {
            throw new Error(`Could not create commit packet because of missing opcode mapping.`);
        }
        const count = this.context.incrementCount(packetName);
        let packet = Buffer.allocUnsafe(24);
        packet.writeUInt16LE(24);
        packet.writeUInt16LE(opcode, 2);
        packet.writeUInt32LE(count, 4);
        packet.writeUInt32LE(0, 8);
        packet.writeBigUInt64LE(this.context.gameId, 12);
        packet.writeUInt32LE(this.context.contractId, 20);
        let checksum = generateChecksum(packet, this.context.initialHashValue);
        packet.writeUInt32LE(checksum, 8);
        return packet;
    }

    /**
     * Creates a `C_STORE_SELL_ADD_BASKET` packet as a {@link Buffer}.
     * @returns the packet as a {@link Buffer}
     */
    buildStoreSellAddBasketPacket(itemId: number, amount: number, pocket: number, slot: number) {
        const packetName = 'C_STORE_SELL_ADD_BASKET';
        const opcode = this.protocolMap.name.get(packetName);
        if (opcode == undefined) {
            throw new Error(`Could not create commit packet because of missing opcode mapping.`);
        }
        const count = this.context.incrementCount(packetName);
        let packet = Buffer.allocUnsafe(40);
        packet.writeUInt16LE(40);
        packet.writeUInt16LE(opcode, 2);
        packet.writeUInt32LE(count, 4);
        packet.writeUInt32LE(0, 8);
        packet.writeBigUInt64LE(this.context.gameId, 12);
        packet.writeInt32LE(this.context.contractId, 20);
        packet.writeInt32LE(itemId, 24);
        packet.writeInt32LE(amount, 28);
        packet.writeInt32LE(pocket, 32);
        packet.writeInt32LE(slot, 36);
        let checksum = generateChecksum(packet, this.context.initialHashValue);
        packet.writeUInt32LE(checksum, 8);
        return packet;
    }

    /**
     * Creates a checked packet with correct generated count and checksum.
     * Packet must be in following format:
     * ```
     * // header
     * uint16 length
     * uint16 opcode
     * // checksum header
     * uint32 count
     * uint32 checksum
     * // data
     * // ...
     * ```
     * @param packet the buffer containing the relevant data
     */
    buildCheckedPacketFromRaw(packet: Buffer) {
        const opcode = packet.readUInt16LE(2);
        const count = this.context.incrementCount(opcode);
        if (count == undefined) {
            throw new Error(`Could not create commit packet because of no count being tracked.`);
        }
        packet.writeUInt32LE(count, 4);
        let checksum = generateChecksum(packet, this.context.initialHashValue);
        packet.writeUInt32LE(checksum, 8);
        return packet;
    }

    /**
     * Creates a `C_STORE_SELL_DEL_BASKET` packet as a {@link Buffer}.
     * @returns the packet as a {@link Buffer}
     */
    buildStoreSellDelBasketPacket(itemId: number, amount: number, pocket: number, slot: number) {
        const packetName = 'C_STORE_SELL_DEL_BASKET';
        const opcode = this.protocolMap.name.get(packetName);
        if (opcode == undefined) {
            throw new Error(`Could not create commit packet because of missing opcode mapping.`);
        }
        const count = this.context.incrementCount(packetName);
        let packet = Buffer.allocUnsafe(40);
        packet.writeUInt16LE(40);
        packet.writeUInt16LE(opcode, 2);
        packet.writeUInt32LE(count + 1, 4);
        packet.writeUInt32LE(0, 8);
        packet.writeBigUInt64LE(this.context.gameId, 12);
        packet.writeInt32LE(this.context.contractId, 20);
        packet.writeInt32LE(itemId, 24);
        packet.writeInt32LE(amount, 28);
        packet.writeInt32LE(pocket, 32);
        packet.writeInt32LE(slot, 36);
        let checksum = generateChecksum(packet, this.context.initialHashValue);
        packet.writeUInt32LE(checksum, 8);
        return packet;
    }
}

export = ChecksumPacketSender;