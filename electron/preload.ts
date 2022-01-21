import assert = require('assert');
import path_module = require('path');
import url_module = require('url');
import { ipcRenderer, contextBridge } from 'electron';

interface FileEntry {
    is_dir?: boolean;
    size?: number;
    file_path?: string;
}

interface FolderEntry {
    is_dir?: boolean;
    folder_path?: string;
}

interface Result {
    [key: string]: number | Result;
}

class DownloadStatus {
    progress: number;
    total: number;

    init(total: number) {
        this.progress = 0;
        this.total = total;
    }

    tick(ticks = 1) {
        this.progress += ticks;
    }

    async join() {
        return new Promise<void>((resolve) => {
            const timer = setInterval(() => {
                if (this.progress >= this.total) {
                    clearInterval(timer);
                    resolve();
                }
            }, 500);
        });
    }
}

async function download(url: string, path: string): Promise<null> {
    return await ipcRenderer.invoke('download', url, path);
}

async function mkdir(path: string): Promise<null> {
    return await ipcRenderer.invoke('mkdir', path);
}

async function fetch(url: string): Promise<string> {
    return await ipcRenderer.invoke('fetch', url);
}

async function select(title: string): Promise<string | undefined> {
    return await ipcRenderer.invoke('select', title);
}

async function message(
    level: string,
    title: string,
    message: string,
    buttons: Array<string> = []
): Promise<number> {
    return await ipcRenderer.invoke('message', level, title, message, buttons);
}

function evaluate(tree: Result) {
    let size = 0,
        files = 0,
        folders = 0;
    for (const k of Object.keys(tree)) {
        const v = tree[k];
        if (typeof v == 'number') {
            size += v;
            files++;
        } else {
            const { size: a, files: b, folders: c } = evaluate(v);
            size += a;
            files += b;
            folders += c + 1;
        }
    }
    return { size: size, files: files, folders: folders };
}

function buildListUrl(token: string, path: string) {
    return (
        'https://cloud.tsinghua.edu.cn' +
        `/api/v2.1/share-links/${token}/dirents/?format=json&path=${path}`
    );
}

function buildDownloadUrl(token: string, path: string) {
    return `https://cloud.tsinghua.edu.cn/d/${token}/files/?p=${path}&dl=1`;
}

async function listDir(token: string, path = '/') {
    const r = await fetch(buildListUrl(token, path));
    const result: Array<FileEntry | FolderEntry> = JSON.parse(r)['dirent_list'];
    const ret: Result = {};
    for (let i = 0; i < result.length; i++) {
        if (!result[i]['is_dir']) {
            const current: FileEntry = result[i];
            assert(current.file_path !== undefined);
            assert(current.size !== undefined);
            const splitted = current.file_path.split('/');
            ret[splitted[splitted.length - 1]] = current.size;
        } else {
            const current: FolderEntry = result[i];
            assert(current.folder_path !== undefined);
            const splitted = current.folder_path.split('/');
            ret[splitted[splitted.length - 2]] = await listDir(
                token,
                current.folder_path
            );
        }
    }
    return ret;
}

async function _downloadDir(
    dest: string,
    token: string,
    tree: Result,
    path: string,
    callback: (arg0: number) => void
) {
    for (const k of Object.keys(tree)) {
        const v = tree[k];
        const _path = path_module.join(dest, path.slice(1) + k);
        if (typeof v == 'number') {
            const url = new url_module.URL(
                buildDownloadUrl(token, path + k + '/')
            ).toString();
            download(url, _path).finally(() => {
                callback(v);
            });
        } else {
            await mkdir(_path).then(async () => {
                assert(typeof v != 'number');
                _downloadDir(dest, token, v, path + k + '/', callback);
            });
        }
    }
}

async function downloadDir(
    dest: string,
    token: string,
    tree: Result,
    path = '/',
    callback: (arg0: number) => void
) {
    const { size } = evaluate(tree);
    const watcher = new DownloadStatus();
    watcher.init(size);
    await _downloadDir(dest, token, tree, path, (nBytes) => {
        callback(nBytes);
        watcher.tick(nBytes);
    });
    await watcher.join();
}

function decodeError(err: Error) {
    const result = /^Error invoking remote method '(.*?)': Error: (.*?)$/.exec(
        err.message
    );
    return { method: result[1], message: result[2] };
}

contextBridge.exposeInMainWorld('xaDownloadDir', downloadDir);
contextBridge.exposeInMainWorld('xaListDir', listDir);
contextBridge.exposeInMainWorld('xBuildDownloadUrl', buildDownloadUrl);
contextBridge.exposeInMainWorld('xBuildListUrl', buildListUrl);
contextBridge.exposeInMainWorld('xEvaluate', evaluate);
contextBridge.exposeInMainWorld('xaSelect', select);
contextBridge.exposeInMainWorld('xaMessage', message);
contextBridge.exposeInMainWorld('xDecodeError', decodeError);
