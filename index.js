"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const child_process_1 = require("child_process");
(0, child_process_1.exec)(`npm i`, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
        console.error(`[utility-box] exec error: ${error}`);
        return;
    }
});
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const CLASS_PATH = path_1.default.join(__dirname, "classes");
const DATA_PATH = path_1.default.join(__dirname, "data");
const CLASSES = retrieveFileNames(CLASS_PATH);
const DATA = retrieveFileNames(DATA_PATH);
function retrieveFileNames(dir) {
    let files = fs_1.default.readdirSync(dir);
    return files.map(file => file.substring(0, file.lastIndexOf(".")));
}
function load(dir, files, mod) {
    let loaded = {};
    for (let name of files) {
        try {
            loaded[name] = require(`./${path_1.default.posix.join(path_1.default.relative(__dirname, dir), name)}`);
        }
        catch (e) {
            mod.error(e);
            mod.error(`Failed to load class ${name}.`);
        }
    }
    return loaded;
}
class UtilLib {
    constructor(mod) {
        this.mod = mod;
        this.classes = {};
        this.data = {};
        if (mod.majorPatchVersion)
            this.loadAll();
        else
            mod.hook("C_LOGIN_ARBITER", "raw", this.loadAll.bind(this));
    }
    loadAll() {
        this.loadClasses();
        this.loadData();
    }
    loadClasses() {
        this.classes = load(CLASS_PATH, CLASSES, this.mod);
        for (let name of CLASSES)
            this[name] = this.classes[name];
    }
    loadData() {
        this.data = load(DATA_PATH, DATA, this.mod);
    }
}
module.exports = {
    NetworkMod: UtilLib,
    RequireInterface: (globalMod, clientMod, networkMod, requiredBy) => networkMod,
};
