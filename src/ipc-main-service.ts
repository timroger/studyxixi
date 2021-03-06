import { app, BrowserWindow, ipcMain, Menu, BrowserView } from 'electron';
import { win, splash } from './browser-window';
import * as path from 'path';
import { delay } from './utils';
import { showScoreDetail } from './score';
import { config } from './config';
import { splashComplete, getSplashIsComplete } from './store';

export const log = (event: Event, message?: any, ...optionalParams: any[]) => {
  console.log(message, ...optionalParams);
};

export const setSplashComplete = () => {
  console.log('已完成');
  splashComplete();
}

export const closeWinPlash = async () => {
  const timer = setInterval(() => {
    if (getSplashIsComplete()) {
      splash.destroy();
      clearInterval(timer);
    }
  }, 500);
}

export const refreshMenu = (event: Event, rate: any) => {
  if (rate.score) {
    const { today, total, types } = rate.score;
    const template = [
      { label: `总积分：${total}` },
      { label: `今日积分：${today}` },
      ...types.map((t: string) => ({ label: `${t}` })),
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }
};

export const setAppAudioMuted = (isMuted: boolean) => {
  win.webContents.audioMuted = isMuted;
};

const createBrowserView = (options: any): BrowserWindow => {
  let view = new BrowserWindow({
    parent: win,
    closable: false,
    x: win.getBounds().x + options.x,
    y: win.getBounds().y + 120,
    width: 500,
    height: 600,
    show: false,
    webPreferences: {
      // 渲染线程禁止使用node
      nodeIntegration: false,
      // 禁用同源策略 (通常用来测试网站)
      webSecurity: true,
      preload: options.preload,
      backgroundThrottling: false,
    },
  });
  view.webContents.loadURL(options.url);
  view.webContents.audioMuted = true;

  view.once('ready-to-show', () => {
    if (config.showTaskWindow) {
      view.show();
    }
  });

  view.on('closed', () => {
    view = null;
  });
  return view;
};

export const createArticleView = async (event: Event, options: any) => {
  const view = createBrowserView({
    ...options,
    x: 0,
    url: options.url,
    preload: path.join(__dirname, './articles.js'),
  });
  view.setBackgroundColor('#6f4f4f');
};

export const createVideoView = async (event: Event, options: any) => {
  const view = createBrowserView({
    ...options,
    x: 250,
    url: options.url,
    preload: path.join(__dirname, './videos.js'),
  });
  view.setBackgroundColor('#c8e1ff');
};

export const createFastVideoView = async (event: Event, options: any) => {
  const view = createBrowserView({
    ...options,
    x: 500,
    url: options.url,
    preload: path.join(__dirname, './videos-fast.js'),
  });
  view.setBackgroundColor('#c8e1ff');
};

export const watchVideo = async (event?: Event) => {
  win.webContents.send('watch-video');
};

export const watchArticle = async (event?: Event) => {
  win.webContents.send('watch-article');
};

export const closeTask = () => {
  win.getChildWindows().forEach((view: BrowserWindow) => {
    view.destroy();
  });
};

export const toggleTaskWindow = (isShow: boolean) => {
  win.getChildWindows().forEach((view: BrowserWindow) => {
    if (isShow) {
      view.show();
    } else {
      view.hide();
    }
  });
};