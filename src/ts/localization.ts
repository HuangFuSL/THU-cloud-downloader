interface Language {
    prompt: {
        downloadButton: string;
        downloadComplete: string;
        enterURL: string;
        selectDirectory: string;
        loading: string;
        downloadSuccess: string;
        downloadFailed: string;
        progress: (current: number, total: number) => string;
        fileInfo: (filePath: string, size: number) => string;
        linkTotalSize: (size: number) => string;
        linkTotalFiles: (count: number) => string;
        linkTotalFolders: (count: number) => string;
    };
    error: {
        [key: string]: string;
    };
}

function formatBytes(size: number, decimals = 2) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let cur = 0;
    while (size > 1000) {
        size /= 1024;
        cur++;
    }
    return size.toFixed(decimals) + units[cur];
}

const localization: { [key: string]: Language } = {
    zh: {
        prompt: {
            downloadButton: '下载',
            downloadComplete: '下载完成',
            enterURL: '请输入云盘链接',
            selectDirectory: '下载到',
            loading: '正在查询链接信息',
            downloadSuccess: '下载成功',
            downloadFailed: '下载失败',
            progress: (current: number, total: number) => {
                return `已下载 ${current}/${total}`;
            },
            fileInfo: (filePath: string, size: number) => {
                return `${filePath} ${formatBytes(size)}`;
            },
            linkTotalSize: (size: number) => {
                return `文件大小：${formatBytes(size)}`;
            },
            linkTotalFiles: (count: number) => {
                return `文件数：${count}`;
            },
            linkTotalFolders: (count: number) => {
                return `文件夹数：${count}`;
            }
        },
        error: {
            1: '请输入下载链接',
            2: '下载链接无效',
            3: '下载目录无效',
            404: '找不到输入的链接'
        }
    }
};

export default localization;
