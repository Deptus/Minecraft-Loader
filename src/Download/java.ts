import { arch, platform } from "os";
import DownloadBase from "./base";
import path from "path";
import fs from "fs"
import { Progress } from "got";
import compress from "compressing";

class SystemError extends Error {
    constructor() {
        super("Your system does not support this version of Java.")
    }
}
export default class JavaDownload {
    private oracleJava: boolean = true;
    private msJava: boolean = false;

    public JavaOption(opt: "mojang" | "oracle" | "ms"): void {
        switch(opt) {
            case "oracle":
                this.oracleJava = true;
                this.msJava = false;
                return;
            case "ms":
                this.msJava = true;
                this.oracleJava = false;
        }
        return;
    }

    private CheckPath(gamePath: string) {
        if(!fs.existsSync(path.join(gamePath, "runtime")))
            fs.mkdirSync(path.join(gamePath, "runtime"));
        return;
    }

    private JavaUrlFetch(opt: "alpha" | "beta" | "gamma", arch: 1 | 2 | 3, os: "win" | "osx" | "linux"): string {
        //arch: 1 -> x86   2 -> x64   3 -> arm
        if(this.oracleJava) {
            switch(arch) {
                case 1: 
                    switch(os) {
                        case "win": 
                            switch(opt) {
                                case "alpha":
                                    return "https://download.oracle.com/otn/java/jdk/8u381-b09/8c876547113c4e4aab3c868e9e0ec572/jre-8u381-windows-i586.tar.gz";
                                case "beta":
                                case "gamma":
                                    throw new SystemError();
                            }
                        case "osx":
                            throw new SystemError();
                        case "linux": 
                            switch(opt) {
                                case "alpha":
                                    return "https://download.oracle.com/otn/java/jdk/8u381-b09/8c876547113c4e4aab3c868e9e0ec572/jre-8u381-linux-i586.tar.gz";
                                case "beta":
                                case "gamma":
                                    throw new SystemError();
                            }
                    }
                case 2:
                    switch(os) {
                        case "win":
                            switch(opt) {
                                case "alpha":
                                    return "https://download.oracle.com/otn/java/jdk/8u381-b09/8c876547113c4e4aab3c868e9e0ec572/jre-8u381-windows-x64.tar.gz";
                                case "beta":
                                    return "https://download.oracle.com/otn/java/jdk/16.0.2%2B7/d4a915d82b4c4fbb9bde534da945d746/jdk-16.0.2_windows-x64_bin.zip";
                                case "gamma":
                                    return "https://download.oracle.com/java/17/latest/jdk-17_windows-x64_bin.zip";
                            }
                        case "osx":
                            switch(opt) {
                                case "alpha":
                                    return "https://download.oracle.com/otn/java/jdk/8u381-b09/8c876547113c4e4aab3c868e9e0ec572/jre-8u381-macosx-x64.tar.gz";
                                case "beta":
                                    return "https://download.oracle.com/otn/java/jdk/16.0.2%2B7/d4a915d82b4c4fbb9bde534da945d746/jdk-16.0.2_osx-x64_bin.tar.gz";
                                case "gamma":
                                    return "https://download.oracle.com/java/17/latest/jdk-17_macos-x64_bin.tar.gz";
                            }
                        case "linux":
                            switch(opt) {
                                case "alpha":
                                    return "https://download.oracle.com/otn/java/jdk/8u381-b09/8c876547113c4e4aab3c868e9e0ec572/jre-8u381-linux-x64.tar.gz";
                                case "beta":
                                    return "https://download.oracle.com/otn/java/jdk/16.0.2%2B7/d4a915d82b4c4fbb9bde534da945d746/jdk-16.0.2_linux-x64_bin.tar.gz";
                                case "gamma":
                                    return "https://download.oracle.com/java/17/latest/jdk-17_linux-x64_bin.tar.gz";
                            }
                    }
                case 3:
                    switch(os) {
                        case "win":
                            throw new SystemError();
                        case "osx":
                            switch(opt) {
                                case "alpha":
                                case "beta":
                                    throw new SystemError();
                                case "gamma":
                                    return "https://download.oracle.com/java/17/archive/jdk-17.0.8_macos-aarch64_bin.tar.gz";
                            }
                        case "linux":
                            switch(opt) {
                                case "alpha":
                                    throw new SystemError();
                                case "beta":
                                    return "https://download.oracle.com/otn/java/jdk/16.0.2%2B7/d4a915d82b4c4fbb9bde534da945d746/jdk-16.0.2_linux-aarch64_bin.tar.gz";
                                case "gamma":
                                    return "https://download.oracle.com/java/17/archive/jdk-17.0.8_linux-aarch64_bin.tar.gz";
                            }
                    }
            }
        } else if(this.msJava) {
            switch(opt) {
                case "alpha":
                    throw new SystemError();
                case "beta":
                    switch(arch) {
                        case 1:
                            throw new SystemError();
                        case 2:
                            switch(os) {
                                case "win": 
                                    return "https://aka.ms/download-jdk/microsoft-jdk-16.0.2.7.1-windows-x64.zip";
                                case "osx":
                                    return "https://aka.ms/download-jdk/microsoft-jdk-16.0.2.7.1-macOS-x64.tar.gz";
                                case "linux":
                                    return "https://aka.ms/download-jdk/microsoft-jdk-16.0.2.7.1-linux-x64.tar.gz";
                            }
                        case 3:
                            switch(os) {
                                case "win": 
                                    return "https://aka.ms/download-jdk/microsoft-jdk-16.0.2.7.1-windows-aarch64.zip";
                                case "osx":
                                    return "https://aka.ms/download-jdk/microsoft-jdk-16.0.2.7.1-macOS-aarch64.tar.gz";
                                case "linux":
                                    return "https://aka.ms/download-jdk/microsoft-jdk-16.0.2.7.1-linux-aarch64.tar.gz";
                            }
                    }
                case "gamma":
                    switch(arch) {
                        case 1:
                            throw new SystemError();
                        case 2:
                            switch(os) {
                                case "win": 
                                    return "https://aka.ms/download-jdk/microsoft-jdk-17.0.7-windows-x64.zip";
                                case "osx":
                                    return "https://aka.ms/download-jdk/microsoft-jdk-17.0.7-macOS-x64.tar.gz";
                                case "linux":
                                    return "https://aka.ms/download-jdk/microsoft-jdk-17.0.7-linux-x64.tar.gz";
                            }
                        case 3:
                            switch(os) {
                                case "win": 
                                    return "https://aka.ms/download-jdk/microsoft-jdk-17.0.7-windows-aarch64.zip";
                                case "osx":
                                    return "https://aka.ms/download-jdk/microsoft-jdk-17.0.7-macOS-aarch64.tar.gz";
                                case "linux":
                                    return "https://aka.ms/download-jdk/microsoft-jdk-17.0.7-linux-aarch64.tar.gz";
                            }
                    }
            }
        }
        return "";
    }

    public async JavaDownload(opt: "alpha" | "beta" | "gamma", gamePath: string, downloadProgress?: (event: Progress) => void) {
        this.CheckPath(gamePath);
        let os: "win" | "osx" | "linux" = "win";
        let narch: 1 | 2 | 3 = 1;
        switch(platform()) {
            case "win32":
                os = "win";
                if(arch() === "aarch64" || arch() === "aarch" || arch() === "arm" || arch() === "arm64")
                    narch = 3;
                if(arch() === "x64" || arch() === "x86_64" || arch() === "amd64")
                    narch = 2;
                if(arch() === "x86")
                    narch = 1;
                break;
            case "linux":
                os = "linux";
                if(arch() === "aarch64" || arch() === "aarch" || arch() === "arm" || arch() === "arm64")
                    narch = 3;
                if(arch() === "x64" || arch() === "x86_64" || arch() === "amd64")
                    narch = 2;
                if(arch() === "x86")
                    narch = 1;
                break;
            case "darwin":
                os = "osx";
                if(arch() === "aarch64" || arch() === "aarch" || arch() === "arm" || arch() === "arm64")
                    narch = 3;
                if(arch() === "x64" || arch() === "x86_64" || arch() === "amd64")
                    narch = 2;
                if(arch() === "x86")
                    narch = 1;
                break;
        }
        let downloadUrl: string, format: string;
        downloadUrl = this.JavaUrlFetch(opt, narch, os);
        if(downloadUrl.endsWith(".zip"))
            format = ".zip";
        else
            format = ".tar.gz";
        const urls = [];
        urls.push(downloadUrl);
        if(!fs.existsSync(path.join(gamePath, "runtime", (this.oracleJava ? "oracle" : "openjdk"))))
            fs.mkdirSync(path.join(gamePath, "runtime", (this.oracleJava ? "oracle" : "openjdk")));
        const downloadProcess = new DownloadBase(urls);
        const buffer = await downloadProcess.downloadBuffer(downloadProgress);
        if(format === '.zip')
            await compress.zip.uncompress(buffer[0], path.join(gamePath, "runtime", (this.oracleJava ? "oracle" : "openjdk")));
        else if(format === '.tar.gz')
            await compress.tar.uncompress(buffer[0], path.join(gamePath, "runtime", (this.oracleJava ? "oracle" : "openjdk")));
        return;
    }
}