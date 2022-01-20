import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('debug', (name: string, value: number) => {
    ipcRenderer.send('debug', name, value);
});