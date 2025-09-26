import { Link } from "../models";

export { };

declare global {
    interface Window {
        electronAPI: {
            onUpdateLinks: (callback: (links: string) => void) => void;
            clearUpdateLinks: () => void;
            loadLinks: () => Promise<Link[]>;
        };
    }
}
