import path from "path";
import { readFile, readdir } from "fs/promises";

const rewstRemoteAgentDirName = "RewstRemoteAgent";
const configFileName = "config.json";
const defaultHttpdPort = 50001;

type OrgConfigFile = {
    httpd_port?: number;
    httpd_token?: string;
};

export type ResolvedOrgConfig = {
    orgId: string;
    httpdPort: number;
    httpdToken: string;
};

const getRewstRemoteAgentDir = () => {
    const programData = process.env.PROGRAMDATA as string;
    return path.join(programData, rewstRemoteAgentDirName);
};

/**
 * Each machine hosts a single org's Agent Smith service, so the org id is
 * discovered by finding the (one) subdirectory under RewstRemoteAgent that
 * has a config.json with an httpd_token.
 */
export const findOrgConfig = async (): Promise<ResolvedOrgConfig | null> => {
    const baseDir = getRewstRemoteAgentDir();

    let orgIds: string[];
    try {
        const entries = await readdir(baseDir, { withFileTypes: true });
        orgIds = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    } catch (err) {
        console.error(`Failed to read RewstRemoteAgent directory at ${baseDir}:`, err);
        return null;
    }

    for (const orgId of orgIds) {
        const configPath = path.join(baseDir, orgId, configFileName);

        try {
            const data = await readFile(configPath);
            const config = JSON.parse(data.toString()) as OrgConfigFile;

            if (!config.httpd_token) {
                continue;
            }

            return {
                orgId,
                httpdPort: config.httpd_port ?? defaultHttpdPort,
                httpdToken: config.httpd_token,
            };
        } catch {
            continue;
        }
    }

    console.error(`No RewstRemoteAgent org config with httpd_token found under ${baseDir}`);
    return null;
};
