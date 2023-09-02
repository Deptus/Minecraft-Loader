export default class Launch {
    private gamePath: string;
    private versionName: string;
    constructor(gamePath: string, versionName: string) {
        this.gamePath = gamePath;
        this.versionName = versionName;
    }
}