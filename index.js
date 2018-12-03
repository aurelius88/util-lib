const fs = require("fs");
const path = require("path");

const CLASSES = retrieveClassNames();

function retrieveClassNames() {
    let files = fs.readdirSync(path.join(__dirname, "classes"));
    return files.map(file => file.substring(0, file.lastIndexOf(".")));
}

class UtilLib {
    constructor(mod, version) {
        this.classes = {};
        this.command = mod.command;
        this.cmd = this.command;

        function loadAllClasses() {
            for (let name of CLASSES) {
                try {
                    let tmp = require(`./classes/${name}`);
                    this.classes[name] = new tmp(mod, this.classes);
                    this[name] = this.classes[name];
                } catch (e) {
                    console.log(e);
                    console.log(
                        `[${new Date().toLocaleTimeString()}][UtilLib] Failed to load class ${name}.`
                    );
                }
            }
        }

        if (version || mod.base.majorPatchVersion)
            loadAllClasses.call(this);
        else mod.hook("C_LOGIN_ARBITER", "raw", loadAllClasses.bind(this));
    }
}

let map = new WeakMap();

module.exports = function Require(dispatch, ...args) {
    if (map.has(dispatch.base)) return map.get(dispatch.base);

    let lib = new UtilLib(dispatch, ...args);
    map.set(dispatch.base, lib);
    return lib;
};
