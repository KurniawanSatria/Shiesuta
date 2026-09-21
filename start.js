import { spawn } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const workspace = process.cwd();
const logDir = join(workspace, "logs");
const logFile = join(logDir, "shiesuta.log");

mkdirSync(logDir, { recursive: true });

const writeLog = (source, data) => {
  const text = data.toString();
  appendFileSync(logFile, `[${new Date().toISOString()}] [${source}] ${text}`);
  process.stdout.write(`[${source}] ${text}`);
};

const server = spawn("bun", ["run", "start"], {
  cwd: workspace,
  stdio: ["ignore", "pipe", "pipe"]
});

server.stdout.on("data", data => writeLog("SHIESUTA", data));
server.stderr.on("data", data => writeLog("SHIESUTA", data));

const terminal = spawn(process.platform === "win32" ? "cmd.exe" : "bash", [], {
  cwd: workspace,
  stdio: ["pipe", "pipe", "pipe"]
});

terminal.stdout.on("data", data => writeLog("CMD", data));
terminal.stderr.on("data", data => writeLog("CMD", data));

const shutdown = () => {
  terminal.kill();
  server.kill();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);