import { spawn } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, ".next");

async function killOldNextDevProcesses() {
  return new Promise((resolve, reject) => {
    const ps = spawn("ps", ["-A", "-o", "pid=,command="], { cwd: projectRoot, stdio: ["ignore", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";

    ps.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    ps.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    ps.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || "Gagal membaca daftar proses."));
        return;
      }

      const currentPid = process.pid;
      const parentPid = process.ppid;

      const normalizeCommand = (command) => command.replace(/\s+/g, " ").trim();

      const processes = stdout
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const match = line.match(/^(\d+)\s+(.*)$/);
          if (!match) return null;
          return { pid: Number(match[1]), command: normalizeCommand(match[2]) };
        })
        .filter((entry) => {
          if (!entry) return false;
          if (entry.pid === currentPid || entry.pid === parentPid) return false;
          const command = entry.command;
          return (
            command.includes(projectRoot) ||
            command.includes("node ./scripts/dev-server.mjs") ||
            command.includes("node ./node_modules/next/dist/bin/next dev") ||
            command.includes("node_modules/.bin/next dev") ||
            command.includes("next-server")
          );
        });

      for (const entry of processes) {
        try {
          process.kill(entry.pid, "SIGTERM");
        } catch {
          // Ignore processes that already exited.
        }
      }

      setTimeout(() => {
        for (const entry of processes) {
          try {
            process.kill(entry.pid, 0);
            process.kill(entry.pid, "SIGKILL");
          } catch {
            // Ignore processes that already exited.
          }
        }

        resolve();
      }, 400);
    });
  });
}

async function main() {
  await killOldNextDevProcesses();

  if (existsSync(nextDir)) {
    rmSync(nextDir, { recursive: true, force: true });
  }

  const child = spawn("node", ["./node_modules/next/dist/bin/next", "dev"], {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on("SIGINT", forwardSignal);
  process.on("SIGTERM", forwardSignal);

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error("[bayaro dev] Gagal menyiapkan server dev.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
