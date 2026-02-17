import { app, BrowserWindow, ipcMain, shell } from "electron";
import fs from "fs";
import path from "path";
import {
  initDatabase,
  getAllFonts,
  toggleFavorite,
  getFontVariants,
} from "./services/database";
import { scanFonts } from "./services/font-scanner";
import { startWatcher } from "./services/watcher";
import { migrateFontsWithCategories } from "./services/migration";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
import electronSquirrelStartup from "electron-squirrel-startup";
if (electronSquirrelStartup) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  const devIconPath = path.join(process.cwd(), "assets", "icon-1024.png");
  const windowIcon = fs.existsSync(devIconPath) ? devIconPath : undefined;

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    backgroundColor: "#09090b",
    icon: windowIcon,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // allow loading local font files
    },
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#09090b",
      symbolColor: "#ffffff",
      height: 48,
    },
  });

  const isExternalUrl = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://");

  const isInternalUrl = (url: string) =>
    url.startsWith("file://") || url.startsWith("http://localhost:5173");

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalUrl(url)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isInternalUrl(url) && isExternalUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

app.whenReady().then(async () => {
  // Initialize database
  initDatabase();

  // Run migration to add categories to existing fonts
  try {
    await migrateFontsWithCategories();
  } catch (e) {
    console.error("Migration error:", e);
  }

  createWindow();

  // Start watcher
  startWatcher();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("scan-fonts", async (event) => {
  return await scanFonts((count) => {
    // Send progress update to renderer
    event.sender.send("scan-progress", count);
  });
});

ipcMain.handle("get-fonts", () => {
  return getAllFonts();
});

ipcMain.handle(
  "toggle-favorite",
  (_event, family: string, isFavorite: boolean) => {
    toggleFavorite(family, isFavorite);
  }
);

ipcMain.handle("get-font-variants", (_event, family: string) => {
  return getFontVariants(family);
});

ipcMain.handle("reveal-in-folder", (_event, filePath: string) => {
  shell.showItemInFolder(filePath);
});
