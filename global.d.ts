export { };

declare global {
    interface Window {
        electronAPI: {
            onUpdateLinks: (callback: (links: string) => void) => void;
        };
    }
}
