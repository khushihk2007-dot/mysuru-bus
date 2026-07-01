import { browserLogger } from "./browserLogger";
import { serverLogger } from "./serverLogger";

const isServer = typeof window === "undefined";

export const logger = isServer ? serverLogger : browserLogger;
