import { Link } from "../models";
import path from "path";
import { readFile, writeFile } from 'fs/promises';

const configDirName = "AgentSmithTray";
const configFileName = "config.json";

type Config = {
    links?: Link[];
}

export const getConfigFilePath = () => {
    const configDir = process.env.APPDATA as string;
    return path.join(configDir, configDirName, configFileName);
}

const loadConfig = async <T>() => {
    try {
        const data = await readFile(getConfigFilePath());
        return JSON.parse(data.toString()) as T;
    } catch {
        return null;
    }
};

const storeConfig = async<T>(config: T) => {
    const data = JSON.stringify(config);
    await writeFile(getConfigFilePath(), data);
};

export const storeLinks = async (links: Link[]) => {
    const config = {
        ...(await loadConfig<Config>() || {}),
        links
    };

    await storeConfig(config);
}

export const loadLinks = async () => {
    const config = await loadConfig<Config>();
    const { links = [] } = config || {};

    return links;
}
