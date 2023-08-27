export interface GameArguments {
    rules: {
        action: "allow",
        features: {
            is_demo_user?: boolean;
            has_custom_resolution?: boolean;
            has_quick_plays_support?: boolean;
            is_quick_play_singleplayer?: boolean;
            is_quick_play_multiplayer?: boolean;
            is_quick_play_realms?: boolean;
        }
    }[]
    value: string[];
}

export interface JVMArguments {
    rules: {
        action: "allow",
        os: {
            name?: "windows" | "osx" | "linux",
            arch?: "x86" | "x64" | "aarch64" | "arm64"
        }
    }[];
    value: string[];
}

export interface Index {
    sha1: string,
    size: number,
    url: string
}

export interface LibraryIndex {
    downloads: {
        artifact: {
            path: string,
            sha1: string,
            size: number,
            url: string
        },
        name: string,
        rules?: {
            action: "allow",
            os: {
                name: "windows" | "osx" | "linux"
            }
        }[]
    }
}

export interface MinecraftIndex {
    arguments: {
        game: Array<GameArguments | string>,
        jvm: Array<JVMArguments | string>
    },
    assetIndex: {
        id: string,
        sha1: string,
        size: number,
        totalSize: number,
        url: string
    },
    assets: string,
    complianceLevel: number,
    downloads: {
        client: Index,
        client_mappings: Index,
        server: Index,
        server_mappings: Index
    }
    id: string,
    javaVersion: {
        component: "java-runtime-alpha" | "java-runtime-beta" | "java-runtime-gamma",
        majorVersion: number
    },
    libraries: LibraryIndex[],
    logging: {
        client: {
            argument: string,
            file: {
                id: string,
                sha1: string,
                size: number,
                url: string
            },
            type: string
        }
    },
    mainClass: string,
    minimumLauncherVersion: number,
    releaseTime: string,
    time: string,
    type: string
}