import got from 'got';
import fs from 'fs';
import path from 'path';
import DownloadBase from '../base';

export default class MinecraftDownload {

    private coreUrl: string;
    private indexUrl: string;
    private metaUrl: string;
    private assetsUrl: string;
    private librariesUrl: string;
    private opt: boolean;

    constructor(opt: boolean) {
        this.opt = opt;
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
            url.replace(`https://piston-meta.mojang.com/`, this.indexUrl);
            return url;
        }
    }
    
    public DownloadIndex() {
        
    }
}