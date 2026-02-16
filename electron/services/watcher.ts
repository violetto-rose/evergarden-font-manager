import chokidar from "chokidar";
import { processFontFile, getSystemFontDirectories } from "./font-scanner";

export function startWatcher() {
  const dirs = getSystemFontDirectories();

  // Watch recursively? System font dirs are usually flat, but user dirs might not be.
  const watcher = chokidar.watch(dirs, {
    ignored: /(^|[/\\])\../,
    persistent: true,
    ignoreInitial: true,
    depth: 2,
  });

  watcher
    .on("add", async (filePath) => {
      console.log(`Watcher: File added: ${filePath}`);
      await processFontFile(filePath);
    })
    .on("change", async (filePath) => {
      console.log(`Watcher: File changed: ${filePath}`);
      await processFontFile(filePath);
    })
    .on("unlink", (path) => {
      console.log(`Watcher: File removed: ${path}`);
      // TODO: Remove from DB
    });

  return watcher;
}
