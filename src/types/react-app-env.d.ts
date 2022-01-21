/// <reference types="react-scripts" />

interface Result {
    [key: string]: number | Result;
}
interface Window {
    xaDownloadDir: (
        dest: string,
        token: string,
        tree: Result,
        path: string,
        callback: (arg0: number) => void
    ) => Promise<void>;
    xaListDir: (token: string, path: string) => Promise<Result>;
    xBuildDownloadUrl: (token: string, path: string) => string;
    xBuildListUrl: (token: string, path: string) => string;
    xEvaluate: (tree: Result) => {
        size: number;
        files: number;
        folders: number;
    };
    xaSelect: (title: string) => Promise<string | undefined>;
    xaMessage: (
        level: string,
        title: string,
        message: string,
        buttons: Array<string>
    ) => Promise<number>;
    xDecodeError: (error: Error) => { method: string; message: string };
}
