import MinecraftDownload from "./Download/Games/minecraft";
import JavaDownload from "./Download/java";
const s = new MinecraftDownload(true, `C:/Users/GBC03/Desktop/Test`, "1.20.1", "test");
await s.Download((finished, transferred) => {
    console.log({finished, transferred});
});

