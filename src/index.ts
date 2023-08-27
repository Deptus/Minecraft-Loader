import JavaDownload from "./Download/java";

let s: JavaDownload = new JavaDownload;
s.JavaOption("ms");
s.JavaDownload("gamma", `C:/Users/GBC03/Desktop/Test`, (event) => {
    console.log(event.transferred);
})