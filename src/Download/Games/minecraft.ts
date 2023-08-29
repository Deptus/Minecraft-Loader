import got, { Progress } from 'got';
import fs from 'fs';
import path from 'path';
import DownloadBase from '../base';
import { arch, platform } from 'os';
import { AssetIndex, LibraryIndex, Manifest, MinecraftIndex, VersionManifest } from '../../public';

export default class MinecraftDownload {

    private coreUrl: string;
    private manifestUrl: string;
    private metaUrl: string;
    private assetsUrl: string;
    private librariesUrl: string;
    private opt: boolean;
    private gamePath: string;
    private index?: MinecraftIndex;
    private version: string;
    private versionName: string;

    constructor(opt: boolean, gamePath: string, version: string, versionName: string) {
        this.opt = opt;
        this.gamePath = gamePath;
        this.version = version;
        this.versionName = versionName;
        if(opt) {
            this.coreUrl = 'https://bmclapi2.bangbang93.com/';
            this.manifestUrl = 'https://bmclapi2.bangbang93.com/mc/game/version_manifest_v2.json';
            this.metaUrl = 'https://bmclapi2.bangbang93.com/';
            this.assetsUrl = 'https://bmclapi2.bangbang93.com/assets/';
            this.librariesUrl = 'https://bmclapi2.bangbang93.com/maven/';
        } else {
            this.coreUrl = 'https://piston-data.mojang.com/';
            this.manifestUrl = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';
            this.metaUrl = 'https://piston-meta.mojang.com/';
            this.assetsUrl = 'https://resources.download.minecraft.net/';
            this.librariesUrl = 'https://libraries.minecraft.net/';
        }
    }

    public URLParse(url: string) {
        if(!this.opt)
            return url;

        if(url.includes(`https://piston-data.mojang.com/`))
            return url.replace(`https://piston-data.mojang.com/`, "https://bmclapi2.bangbang93.com/");

        if(url.includes(`https://piston-meta.mojang.com/mc/game/version_manifest_v2.json`))
            return url.replace(`https://piston-meta.mojang.com/mc/game/version_manifest_v2.json`, "https://bmclapi2.bangbang93.com/mc/game/version_manifest_v2.json");
            
        if(url.includes(`https://piston-meta.mojang.com/`)) 
            return url.replace(`https://piston-meta.mojang.com/`, "https://bmclapi2.bangbang93.com/");

        if(url.includes(`https://resources.download.minecraft.net/`))
            return url.replace(`https://resources.download.minecraft.net/`, "https://bmclapi2.bangbang93.com/assets/");

        if(url.includes(`https://libraries.minecraft.net/`))
            return url.replace(`https://libraries.minecraft.net/`, "https://bmclapi2.bangbang93.com/maven/");

        return "";
    }

    private CheckPath() {
        if(!fs.existsSync(path.join(this.gamePath, "versions")))
            fs.mkdirSync(path.join(this.gamePath, "versions"));
        if(!fs.existsSync(path.join(this.gamePath, "versions", this.versionName)))
            fs.mkdirSync(path.join(this.gamePath, "versions", this.versionName));
        if(!fs.existsSync(path.join(this.gamePath, "libraries")))
            fs.mkdirSync(path.join(this.gamePath, "libraries"));
        if(!fs.existsSync(path.join(this.gamePath, "assets")))
            fs.mkdirSync(path.join(this.gamePath, "assets"));
    }
    
    
    private async DownloadIndex() {
        const manifestClient = new DownloadBase([this.manifestUrl]);
        const manifest: Manifest = (await manifestClient.downloadJson<Manifest>())[0];
        let versionMainfest: VersionManifest | undefined;
        manifest.versions.forEach((v) => {
            if(v.id === this.version) {
                versionMainfest = v;
                return;
            }
        })
        if(!versionMainfest)
            throw new Error("Can't match version ID.");
        const client = new DownloadBase([this.URLParse(versionMainfest.url)], [path.join(this.gamePath, "versions", this.versionName)], [this.versionName + ".json"]);
        await client.download();
        this.index = (await client.downloadJson<MinecraftIndex>())[0];
        return;
    }

    private async DownloadAssets(downloadProgress: (event: Progress, lastByte: number) => void) {
        if(!this.index)
            throw new Error("Version index not loaded.");
        const assetPath = path.join(this.gamePath, "assets");
        if(!fs.existsSync(path.join(assetPath, "indexes")))
            fs.mkdirSync(path.join(assetPath, "indexes"));
        const client = new DownloadBase([this.URLParse(this.index.assetIndex.url)]);
        const assetIndex = (await client.downloadJson<AssetIndex>(downloadProgress))[0];
        fs.writeFileSync((`${assetPath}/indexes/${this.index.assetIndex.id}.json`), String(assetIndex));
        const urls: string[][] = [], paths: string[][] = [], lpath: string[][] = [], filenames: string[][] = [];
        let i = 0;
        let url: string[] = [], pathn: string[] = [], pathl: string[] = [], filename: string[] = [];
        const obj = assetIndex.objects;
        if(!fs.existsSync(path.join(assetPath, "objects")))
            fs.mkdirSync(path.join(assetPath, "objects"));
        if(!fs.existsSync(path.join(assetPath, "virtual")))
            fs.mkdirSync(path.join(assetPath, "virtual"));
        if(!fs.existsSync(path.join(assetPath, "virtual", "legacy")))
            fs.mkdirSync(path.join(assetPath, "virtual", "legacy"));
        let len = 0;
        for(let key in obj)
            len++;
        for(let key in obj) {
            if((i + 1) % 1 === 0 || i === len - 1) {
                urls.push(url);
                paths.push(pathn);
                filenames.push(filename);
                lpath.push(pathl)
                url = [];
                pathn = [];
                filename = [];
                pathl = [];
            }
            url.push(this.URLParse(`https://resources.download.minecraft.net/${obj[key].hash.substring(0, 2)}/${obj[key].hash}`));
            const hashPath = path.join(assetPath, "objects", obj[key].hash.substring(0, 2));
            const legacyPath = path.join(assetPath, "virtual", "legacy", obj[key].hash.substring(0, 2));
            if(!fs.existsSync(hashPath))
                fs.mkdirSync(hashPath);
            if(!fs.existsSync(legacyPath))
                fs.mkdirSync(legacyPath);
            pathn.push(hashPath);
            pathl.push(legacyPath);
            filename.push(obj[key].hash);
            i++;
        }
        urls.forEach(async (v, i) => {
            console.log(v);
            const client = new DownloadBase(v);
            const buffers = await client.downloadBuffer(downloadProgress);
            buffers.forEach((value, index) => {
                fs.writeFileSync(paths[i][index] + "/" + filenames[i][index], value);
                fs.writeFileSync(lpath[i][index] + "/" + filenames[i][index], value);
            })
        });
        console.log("End Assets");
        return;
    }

    private resolveLibrariesPaths(basePath: string, rPath: string) {
        const paths: string[] = [];
        let lastChar: number = 0;
        for(let c = 0; c < rPath.length; c++) {
            if(c === rPath.length - 1)
                paths.push(rPath.substring(lastChar, c + 1));
            if(rPath[c] === '/')
                paths.push(rPath.substring(lastChar, c)), lastChar = c + 1;
        }
        let dpath: string = basePath;
        paths.forEach((v, i) => {
            if(i >= paths.length - 1)
                return v;
            dpath = path.join(dpath, v);
            if(!fs.existsSync(dpath))
                fs.mkdirSync(dpath);
        })
        return "";
    }

    private async DownloadLibraries(downloadProgress: (event: Progress, lastByte: number) => void) {
        if(!this.index)
            throw new Error("Version index not loaded.");
        let os: "windows" | "linux" | "osx" = "windows";
        if(platform() === "linux")
            os = "linux";
        else if(platform() === "darwin")
            os = "osx";
        const urls: string[][] = [], paths: string[][] = [], filenames: string[][] = [];
        let url: string[] = [], pathn: string[] = [], filename: string[] = [];
        const librariesPath = path.join(this.gamePath, "libraries");
        this.index.libraries.forEach((v, i) => {
            if((i + 1) % 1 === 0 || (this.index && i === this.index.libraries.length - 1)) {
                urls.push(url);
                paths.push(pathn);
                filenames.push(filename);
                url = [];
                pathn = [];
                filename = [];
            }
            if((v.rules && v.rules[0].os.name === os) || (!v.rules)) {
                url.push(this.URLParse(v.downloads.artifact.url));
                pathn.push(path.join(librariesPath, v.downloads.artifact.path));
                filename.push(this.resolveLibrariesPaths(librariesPath, v.downloads.artifact.path));
                i++;
            }
        });
        urls.forEach((v, i) => {
            const client = new DownloadBase(v, paths[i], filenames[i]);
            client.download(downloadProgress);
            console.log(v);
        });
        console.log("End Libs");
        return;
    }

    public SizeCalc(): number {
        let total: number = 0;
        const index = this.index!;
        total += index.assetIndex.totalSize;
        total += index.downloads.client.size;
        index.libraries.forEach((v) => {
            total += v.downloads.artifact.size;
        })
        return total;
    }

    public async Download(progress?: (finished: number, transferred: number) => void) {
        this.CheckPath();
        await this.DownloadIndex();
        if(!this.index)
            throw new Error("Version index not loaded.");
        let all: number = this.SizeCalc(), downloaded: number = 0;
        const downloadProgress = (event: Progress, lastByte: number) => {
            const download = event.transferred - lastByte;
            downloaded += download;
            if(progress)
                progress(1.0 * downloaded / all * 100, downloaded);
        }
        console.log("Assets:");
        await this.DownloadAssets(downloadProgress);
        console.log("Libs:");
        await this.DownloadLibraries(downloadProgress);
        console.log("Core:");
        const client = new DownloadBase([this.URLParse(this.index.downloads.client.url)], [path.join(this.gamePath, "versions", this.versionName)], [this.versionName + ".jar"]);
        await client.downloadAsync(downloadProgress);
        console.log("Finished download version.");
        return;
    }
}