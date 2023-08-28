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
    public async download(downloadProgress?: (event: Progress, lastByte: number) => void) {
        if(!this.paths || !this.filenames)
            throw new Error("No paths or filenames input.");
        const promises = this.urls.map(async (url, index) => {
            await new Promise <void> ((resolve) => {
                let last: number = 0;
                if(this.paths && this.filenames)
                    got.stream(url)
                    .on("downloadProgress", (event: Progress) => {
                        if(downloadProgress)
                            downloadProgress(event, last);
                        last = event.transferred;
                    })
                    .pipe(fs.createWriteStream(path.join(this.paths[index], this.filenames[index])))
                    .on("finish", () => {
                        resolve();
                    });
            });
        });
        await Promise.all(promises);
    }
    
    public async downloadBuffer(downloadProgress?: (event: Progress, lastByte: number) => void): Promise<Buffer[]> {
        const buffers: Buffer[] = [];
        const promises = this.urls.map(async (url) => {
            let last: number = 0;
            buffers.push(await got.get(url)
            .on("downloadProgress", event => {
                if(downloadProgress)
                    downloadProgress(event, last);
                last = event.transferred;
            }).buffer())
        });
        await Promise.all(promises); 
        return buffers;
    }

    public async downloadJson<T = unknown>(downloadProgress?: (event: Progress, lastByte: number) => void) {
        const jsons: T[] = [];
        const promises = this.urls.map(async (url) => {
            let last: number = 0;
            jsons.push(await got.get(url)
            .on("downloadProgress", event => {
                if(downloadProgress)
                    downloadProgress(event, last);
                last = event.transferred;
            }).json<T>())
        });
        await Promise.all(promises); 
        return jsons;
    }

    public async downloadAsync(downloadProgress?: (event: Progress, lastByte: number) => void) {
        const buffers: Buffer[] = [];
        const workers = [];
        const content = (await got.head(this.urls[0])).headers['content-length'];
        const length = Number(content ? content : 0);
        if(!length)
            throw new Error("Failed to fetch length.");
        const concurrency = 15;
        const std = Math.floor(length / concurrency);
        let start = 0, end = std;
        for(let i = 0; i < concurrency; i++) {
            if(i === concurrency - 1)
                end = length;
            let last = 0;
            workers.push(got.get(this.urls[0], {
                headers: {
                    Range: `bytes=${start}-${end - 1}`
                }
            })
            .on("downloadProgress", event => {
                if(downloadProgress)
                    downloadProgress(event, last);
                last = event.transferred;
            }).buffer())
            start = end;
            end += std;
        }
        const promises = workers.map(async (v, i) => {
            buffers[i] = await v;
        })
        await Promise.all(promises);
        if(!this.filenames || !this.paths)
            throw new Error("No filenames or paths input.");
        
        const stream = fs.createWriteStream(this.paths[0] + this.filenames[0]);
        const promise = buffers.map((v) => {
            stream.write(v);
        })
        await Promise.all(promise);
        stream.close();
    }
    /**
     * Default is the first file.
     */
}