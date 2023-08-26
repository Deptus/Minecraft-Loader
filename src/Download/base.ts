import got, { Progress } from 'got';
import fs from 'fs';
import path from 'path';

export default class DownloadBase {
    private urls: string[];
    private paths: string[];
    private filenames: string[];
    constructor(urls: string[], paths: string[], filenames: string[]) {
        this.urls = urls;
        this.paths = paths;
        this.filenames = filenames;
    }
    async download(downloadProgress?: (event: Progress) => void) {
        const promises = this.urls.map(async (url, index) => {
            await new Promise <void> ((resolve) => {
                got.stream(url)
                .on("downloadProgress", event => {
                    if(downloadProgress)
                        downloadProgress(event);
                })
                .pipe(fs.createWriteStream(path.join(this.paths[index], this.filenames[index])))
                .on("finish", () => {
                    console.log(`Downloaded ${this.filenames[index]}`);
                    resolve();
                });
            });
        });
        await Promise.all(promises);
    }
}