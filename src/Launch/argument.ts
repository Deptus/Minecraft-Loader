import { platform } from "os";
import path from "path";
import fs from "fs";
import { FeatureValue, MinecraftIndex } from "../public";

export interface JVMArgVal {
    launcher_name: string,
    launcher_version: string
}

export class Arguments {
    private game: string = ""; 
    private jvm: string = "";
    private mainClass: string = "net.minecraft.main.Main";

    public join(argument: string, opt: "game" | "jvm") {
        if(opt == "game") {
            this.game += " ";
            this.game += argument;
        } else {
            this.jvm += " ";
            this.jvm += argument;
        }
    }

    public changeMainClass(cp: string) {
        this.mainClass = cp;
    }

    public make(): string {
        return `${this.jvm} ${this.mainClass} ${this.game}`;
    }

    public replace(from: string, to: string, opt: "game" | "jvm"): void {
        if(opt == "game") 
            this.game.replace(from, to);
        else
            this.jvm.replace(from, to);
    }

    public parse(gamePath: string, version: string, features: FeatureValue) {
        const index = JSON.parse(fs.readFileSync(path.join(gamePath, "versions", version, `${version}.json`), "utf-8")) as MinecraftIndex;
        const libraries = index.libraries;
        const jvmArgs = index.arguments.jvm, gameArgs = index.arguments.game;
        let os: "windows" | "linux" | "osx" = "windows";
        if(platform() === "win32")
            os = "windows";
        else if(platform() === "linux")
            os = "linux";
        else if(platform() === "darwin")
            os = "osx";

        if(index.mainClass !== "net.minecraft.main.Main")
            this.changeMainClass(index.mainClass);

        jvmArgs.forEach((v) => {
            if(typeof v === "string")
                this.join(v, "jvm");
            else if(v.rules && v.rules[0].os.name === os) {
                if(typeof v.value === "string")
                    this.join(v.value, "jvm");
                else
                    v.value.forEach((v) => this.join(v, "jvm"));
            }
                
        })

        gameArgs.forEach((v) => {
            if(typeof v === "string")
                this.join(v, "game");
            else if(v.rules) {
                let isAllowed = false;
                v.rules.forEach((v) => {
                    if(v.features) {
                        const feature = v.features;
                        const featureName = Object.keys(feature)[0];
                        const featuresName = Object.keys(features);
                        if(featuresName.includes(featureName)) 
                            isAllowed = true;
                    }
                })
                if(isAllowed) {
                    if(typeof v.value === "string")
                        this.join(v.value, "game");
                    else
                        v.value.forEach((v) => this.join(v, "game"));
                }
            }
        })

        {
            if(features.has_custom_resolution)
                this.replace("${resolution_width}", String(features.has_custom_resolution.height), "game"), 
                this.replace("${resolution_height}", String(features.has_custom_resolution.height), "game");
            if(features.has_quick_plays_support)
                this.replace("${quickPlayPath}", features.has_quick_plays_support, "game");
            if(features.is_quick_play_multiplayer)
                this.replace("${quickPlayMultiplayer}", features.is_quick_play_multiplayer, "game");
            if(features.is_quick_play_realms)
                this.replace("${quickPlayRealms}", features.is_quick_play_realms, "game");
            if(features.is_quick_play_singleplayer)
                this.replace("${quickPlaySingleplayer}", features.is_quick_play_singleplayer, "game");
        }

        let localArch = "x64";
        if(process.arch === "ia32")
            localArch = "x86";
        else if(process.arch === "arm" || process.arch === "arm64") 
            localArch = "arm64";
          
        const paths = [];
        const librariesPath = path.join(gamePath, "libraries");
        libraries.forEach((v) => {
            if(v.rules && v.rules[0].os.name === os) {
                const n = v.name;
                if(n.includes("lwjgl")) {
                    if(n.includes("natives-windows") && os === "windows") {
                        if(n.includes(localArch) || localArch === "x64")
                            paths.push(path.join(librariesPath, v.downloads.artifact.path));
                    } else if(n.includes("natives-linux") && os === "linux") 
                        paths.push(path.join(librariesPath, v.downloads.artifact.path));
                    else if(n.includes("natives-osx") && os === "osx") {
                        if(n.includes(localArch) || localArch === "x64")
                            paths.push(path.join(librariesPath, v.downloads.artifact.path));
                    }
                } else
                    paths.push(v);
            } else if(!v.rules)
                paths.push(v);
        })
    }
}

function makeClassPaths(paths: string[]): string {
    let finalPath = "";
    let split = (platform() === 'win32' ? ";" : ":");
    paths.forEach((v, i) => {
        if(i > 0)
            finalPath += split;
        finalPath += v;
    })
    return finalPath;
}

