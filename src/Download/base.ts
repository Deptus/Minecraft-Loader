import got from 'got';
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
    async download() {
        const promises = this.urls.map((url, index) => {
            return got.stream(url).pipe(fs.createWriteStream(path.join(this.paths[index], this.filenames[index])));
        })
        await Promise.all(promises);
    }
}