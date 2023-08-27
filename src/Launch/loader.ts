export default class Loader {
    private gamePath: string;
    private versionName: string;
    constructor(gamePath: string, versionName: string) {
        this.gamePath = gamePath;
        this.versionName = versionName;
    }
}