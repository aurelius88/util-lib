/// <reference types="tera-toolbox-types" />
import { ClientModInterface, GlobalModInterface, NetworkModInterface } from "tera-toolbox/bin/mod.js";
declare class UtilLib {
    private mod;
    [name: string]: any;
    data: {};
    private classes;
    constructor(mod: NetworkModInterface);
    loadAll(): void;
    loadClasses(): void;
    loadData(): void;
}
declare const _default: {
    NetworkMod: typeof UtilLib;
    RequireInterface: (globalMod: GlobalModInterface, clientMod: ClientModInterface, networkMod: NetworkModInterface<null, null, UtilLib>, requiredBy: any) => NetworkModInterface<null, null, UtilLib>;
};
export = _default;
