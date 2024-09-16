export interface Address {
    ip: string;
    mac: string;
    type: "static" | "dynamic" | "unknown";
}
