import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  scanFonts: () => ipcRenderer.invoke("scan-fonts"),
  getFonts: () => ipcRenderer.invoke("get-fonts"),
  toggleFavorite: (family: string, isFavorite: boolean) =>
    ipcRenderer.invoke("toggle-favorite", family, isFavorite),
  getFontVariants: (family: string) =>
    ipcRenderer.invoke("get-font-variants", family),
  revealInFolder: (filePath: string) =>
    ipcRenderer.invoke("reveal-in-folder", filePath),
  getRecentFonts: () => ipcRenderer.invoke("get-recent-fonts"),
  onScanProgress: (callback: (count: number) => void) => {
    ipcRenderer.on("scan-progress", (_event, count) => callback(count));
  },
  removeScanProgressListener: () => {
    ipcRenderer.removeAllListeners("scan-progress");
  },
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
});
