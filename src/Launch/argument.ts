import { platform } from "os";

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

class Features {
    public is_demo_user: boolean = false;
    public has_custom_resolution: boolean = false;
    public has_quick_plays_support: boolean = false;
    public is_quick_play_singleplayer: boolean = false;
    public is_quick_play_multiplayer: boolean = false;
    public is_quick_play_realms: boolean = false;
}