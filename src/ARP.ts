import { exec } from "child_process";
import { isIP } from "net";

import { Address } from "./Address";

export abstract class ARP {
    public static async fromMac(mac: string): Promise<Address | undefined> {
        if (!this.isMAC(mac)) {
            throw Error("Invalid MAC");
        }

        const normalized = this.normalizeMac(mac);
        const lookup = await this.getLookup();
        const match = lookup.find((entry) => entry.mac === normalized);

        return match;
    }

    public static async fromIp(ip: string): Promise<Address | undefined> {
        if (!isIP(ip)) {
            throw Error("Invalid MAC");
        }

        const lookup = await this.getLookup();
        const match = lookup.find((entry) => entry.ip === ip);

        return match;
    }

    private static isMAC(mac: string): boolean {
        return /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i.test(mac);
    }

    private static normalizeMac(mac: string): string {
        return mac.replace(/-/g, ":").toLowerCase();
    }

    private static fixMAC(mac: string): string {
        return this.normalizeMac(mac)
            .split(":")
            .map((part) => (part.length === 1 ? "0" + part : part))
            .join(":");
    }

    private static getLookup(): Promise<Address[]> {
        return new Promise((resolve, reject) => {
            const isWindows = process.platform.substring(0, 3) === "win";
            const command = isWindows ? "arp -a" : "arp -an";

            exec(command, (error, rawArpData) => {
                if (error) {
                    return reject(error);
                }

                const rows = rawArpData.split("\n");

                const table: Address[] = [];

                for (const row of rows) {
                    let ip: string;
                    let mac: string;
                    let type: Address["type"];

                    if (isWindows) {
                        [ip, mac, type] = row.trim().replace(/\s+/g, " ").split(" ") as [
                            string,
                            string,
                            Address["type"],
                        ];
                    } else {
                        const match = /.*\((.*?)\) \w+ (.{0,17}) (?:\[ether]|on)/g.exec(row);

                        if (match && match.length === 3) {
                            ip = match[1];
                            mac = this.fixMAC(match[2]);
                            type = "unknown";
                        } else {
                            continue;
                        }
                    }

                    if (!isIP(ip) || !this.isMAC(mac)) continue;

                    table.push({
                        ip,
                        mac: this.normalizeMac(mac),
                        type,
                    });
                }

                resolve(table);
            });
        });
    }
}
