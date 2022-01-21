import { IncomingMessage } from 'http';
import assert = require('assert');
import fs = require('fs');
import https = require('https');

type T_ResolveCallback<t = null> = (arg0: t) => void;
type T_RejectCallback<t = NodeJS.ErrnoException> = (arg0: t) => void;

interface Result {
    [key: string]: number | Result;
}

async function fetchUrl(url: string) {
    return new Promise((resolve: (arg0: string) => void, reject) => {
        https.get(url, (msg) => {
            if (msg.statusCode >= 400) reject(new Error(`${msg.statusCode}`));
            let data = '';
            msg.on('data', (chunk: Buffer) => {
                data += chunk.toString();
                if (msg.complete) resolve(data);
            });
        });
    });
}

async function writeUrlFile(url: string, path: string) {
    return new Promise(
        (
            resolve: T_ResolveCallback<IncomingMessage>,
            reject: T_RejectCallback
        ) => {
            https.get(url, (msg) => {
                if (msg.statusCode >= 400)
                    reject(new Error(`${msg.statusCode}`));
                resolve(msg);
            });
        }
    )
        .then((res) => {
            assert(res.headers.location !== undefined);
            const archiveUrl = res.headers.location;
            return new Promise(
                (resolve: T_ResolveCallback<IncomingMessage>) => {
                    https.get(archiveUrl, (res) => {
                        resolve(res);
                    });
                }
            );
        })
        .then((res) => {
            return new Promise((resolve: T_ResolveCallback<null>) => {
                const file = fs.createWriteStream(path);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(null);
                });
            });
        });
}

async function mkdir(path: string) {
    return new Promise((resolve: T_ResolveCallback) => {
        fs.mkdir(path, { recursive: true }, (err) => {
            if (err !== null) throw new Error(err.code);
            resolve(null);
        });
    });
}

export { fetchUrl, writeUrlFile, mkdir };
export type { Result };
