import got from 'got';
import fs from 'fs';
import path from 'path';
import DownloadBase from '../base';
import { arch, platform } from 'os';
import { MinecraftIndex } from '../../public';

export default class MinecraftDownload {

    private coreUrl: string;
    private indexUrl: string;
    private metaUrl: string;
    private assetsUrl: string;
    private librariesUrl: string;
    private opt: boolean;
    private gamePath: string;
    private index: MinecraftIndex | undefined = undefined;
    private version: string;

    constructor(opt: boolean, gamePath: string, version: string) {
        this.opt = opt;
        this.gamePath = gamePath;
        this.version = version;
        if(opt) {
            this.coreUrl = 'https://bmclapi2.bangbang93.com/';
            this.indexUrl = 'https://bmclapi2.bangbang93.com/mc/game/version_manifest_v2.json';
            this.metaUrl = 'https://bmclapi2.bangbang93.com/';
            this.assetsUrl = 'https://bmclapi2.bangbang93.com/assets/';
            this.librariesUrl = 'https://bmclapi2.bangbang93.com/maven/';
        } else {
            this.coreUrl = 'https://piston-data.mojang.com/';
            this.indexUrl = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';
            this.metaUrl = 'https://piston-meta.mojang.com/';
            this.assetsUrl = 'https://resources.download.minecraft.net/';
            this.librariesUrl = 'https://libraries.minecraft.net/';
        }
    }

    public URLParse(url: string) {
        if(!this.opt)
            return url;
        if(url.includes(`https://piston-data.mojang.com/`)) {
            url.replace(`https://piston-data.mojang.com/`, this.coreUrl);
            return url;
        }

        if(url.includes(`https://piston-meta.mojang.com/mc/game/version_manifest_v2.json`)) {
            url.replace(`https://piston-meta.mojang.com/mc/game/version_manifest_v2.json`, this.indexUrl);
            return url;
        }
            
        if(url.includes(`https://piston-meta.mojang.com/`)) {
            url.replace(`https://piston-meta.mojang.com/`, this.metaUrl);
            return url;
        }

        if(url.includes(`https://resources.download.minecraft.net/`)) {
            url.replace(`https://resources.download.minecraft.net/`, this.assetsUrl);
            return url;
        }

        if(url.includes(`https://libraries.minecraft.net/`)) {
            url.replace(`https://libraries.minecraft.net/`, this.librariesUrl);
            return url;
        }

        return "";
    }
    
    public async DownloadIndex() {
        
    }

    public SizeCalc() {

    }
}