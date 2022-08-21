import { exec } from "child_process"
exec(`npm i`, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
        console.error(`[utility-box] exec error: ${error}`);
        return;
    }
});
import fs from "fs";
import path from "path";
import { ClientModInterface, GlobalModInterface, NetworkModInterface } from "tera-toolbox/bin/mod.js";
import ChatHelper from "./classes/chat-helper";
import ChecksumPacketSender from "./classes/checksum-packet-sender";
import FileHelper from "./classes/file-helper";
import HookManager from "./classes/hook-manager";
import MessageBuilder from "./classes/message-builder";
import { Channel } from "./data/chat";
import { Types } from "./data/contract";

const CLASS_PATH: string = path.join(__dirname, "classes");
const DATA_PATH: string = path.join(__dirname, "data");
const CLASSES: string[] = retrieveFileNames(CLASS_PATH);
const DATA = retrieveFileNames(DATA_PATH);

function retrieveFileNames(dir: string) {
    let files = fs.readdirSync(dir);
    return files.map(file => file.substring(0, file.lastIndexOf(".")));
}

function load(dir: string, files: string[], mod: NetworkModInterface) {
    let loaded: { [className: string]: UtilLibImport } = {};
    for (let name of files) {
        try {
            loaded[name] = require(`./${path.posix.join(path.relative(__dirname, dir), name)}`) as UtilLibImport;
        } catch (e) {
            mod.error(e);
            mod.error(`Failed to load class ${name}.`);
        }
    }
    return loaded;
}

type UtilLibImport = UtilLibClass | UtilLibData
type UtilLibClass = ChatHelper | ChecksumPacketSender | FileHelper | HookManager | MessageBuilder;
type UtilLibData = Channel | Types

class UtilLib {
    [name: string]: any;
    public data;
    private classes: { [className: string]: UtilLibImport };
    constructor(private mod: NetworkModInterface) {
        this.classes = {};
        this.data = {};
        if (mod.majorPatchVersion) this.loadAll();
        else mod.hook("C_LOGIN_ARBITER", "raw", this.loadAll.bind(this));
    }

    loadAll() {
        this.loadClasses();
        this.loadData();
    }

    loadClasses() {
        this.classes = load(CLASS_PATH, CLASSES, this.mod);
        for (let name of CLASSES) this[name] = this.classes[name];
    }

    loadData() {
        this.data = load(DATA_PATH, DATA, this.mod);
    }
}

export = {
    NetworkMod: UtilLib,
    RequireInterface: (globalMod: GlobalModInterface, clientMod: ClientModInterface, networkMod: NetworkModInterface<null, null, UtilLib>, requiredBy: any) => networkMod,
};
