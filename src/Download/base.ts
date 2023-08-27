import got, { Progress } from 'got';
import fs from 'fs';
import path from 'path';

export default class DownloadBase {
    private urls: string[];
    private paths?: string[];
    private filenames?: string[];
    constructor(urls: string[], paths?: string[], filenames?: string[]) {
        this.urls = urls;
        this.paths = paths;
        this.filenames = filenames;
    }
    async download(downloadProgress?: (event: Progress) => void) {
        if(!this.paths || !this.filenames)
            throw new Error("No paths or filenames input.");
        const promises = this.urls.map(async (url, index) => {
            await new Promise <void> ((resolve) => {
                if(this.paths && this.filenames)
                    got.stream(url)
                    .on("downloadProgress", event => {
                        if(downloadProgress)
                            downloadProgress(event);
                    })
                    .pipe(fs.createWriteStream(path.join(this.paths[index], this.filenames[index])))
                    .on("finish", () => {
                        if(this.filenames)
                            console.log(`Downloaded ${this.filenames[index]}`);
                        resolve();
                    });
            });
        });
        await Promise.all(promises);
    }
    async downloadBuffer(downloadProgress?: (event: Progress) => void): Promise<Buffer[]> {
        const buffers: Buffer[] = [];
        const promises = this.urls.map(async (url) => {
            buffers.push(await got.get(url)
            .on("downloadProgress", event => {
                if(downloadProgress)
                    downloadProgress(event);
            }).buffer())
        });
        await Promise.all(promises); 
        return buffers;
    }
}