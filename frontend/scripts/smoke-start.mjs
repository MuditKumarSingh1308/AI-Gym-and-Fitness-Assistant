import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";

const projectDir = process.cwd();
const viteEntry = path.join(projectDir, "node_modules", "vite", "bin", "vite.js");
const nextEntry = path.join(projectDir, "node_modules", "next", "dist", "bin", "next");
const maxDurationMs = 20_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isPortAvailable(port) {
  return await new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
  });
}

async function findPort(startPort) {
  for (let port = startPort; port < startPort + 10; port += 1) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No free port found near ${startPort}`);
}

async function waitForHttp(url, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        return;
      }
      lastError = new Error(`Unexpected status ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await sleep(1000);
  }

  throw lastError ?? new Error(`Timed out waiting for ${url}`);
}

async function main() {
  const requestedPort = Number(process.env.PORT ?? 3002);
  const port = Number.isFinite(requestedPort) ? await findPort(requestedPort) : await findPort(3002);
  const startUrl = `http://127.0.0.1:${port}`;

  const appEntry = fs.existsSync(viteEntry)
    ? viteEntry
    : nextEntry;
  const childArgs = appEntry === viteEntry
    ? [appEntry, "--host", "127.0.0.1", "--port", String(port), "--strictPort"]
    : [appEntry, "dev", "--hostname", "127.0.0.1", "-p", String(port)];

  const child = spawn(process.execPath, childArgs, {
    cwd: projectDir,
    env: {
      ...process.env,
      PORT: String(port),
    },
    stdio: "inherit",
  });

  const shutdown = async () => {
    if (!child.pid || child.exitCode !== null || child.signalCode !== null) {
      return;
    }

    if (process.platform === "win32") {
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      child.kill("SIGTERM");
    }

    await Promise.race([
      once(child, "exit"),
      sleep(5000),
    ]);
  };

  let timeoutId;
  try {
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Smoke test timed out after ${maxDurationMs / 1000} seconds`));
      }, maxDurationMs);
      timeoutId.unref?.();
    });
    const childExit = once(child, "exit").then(([code, signal]) => {
      throw new Error(`Smoke app exited early with code ${code ?? "null"}${signal ? ` signal ${signal}` : ""}`);
    });

    await Promise.race([
      waitForHttp(startUrl, maxDurationMs - 3000),
      timeout,
      childExit,
    ]);
    clearTimeout(timeoutId);
    console.log(`PASS: ${startUrl} responded`);
  } finally {
    clearTimeout(timeoutId);
    await shutdown();
  }

  console.log(`PASS: smoke:start completed on ${startUrl}`);
}

main().catch(async (error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
