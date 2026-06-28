import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const projectDir = process.cwd();
const isOneDriveWorkspace = process.platform === "win32" && projectDir.toLowerCase().includes("onedrive");
const tempBuildDir = path.join(os.tmpdir(), "ai-gym-assistant-next-build");

function copyWorkspace(sourceDir, destinationDir) {
  if (process.platform === "win32") {
    fs.mkdirSync(destinationDir, { recursive: true });

    const workspaceCopy = spawnSync("robocopy", [
      sourceDir,
      destinationDir,
      "/E",
      "/XD",
      "node_modules",
      ".next",
      "/NFL",
      "/NDL",
      "/NJH",
      "/NJS",
      "/NP",
    ], { stdio: "ignore" });

    if ((workspaceCopy.status ?? 0) >= 8) {
      throw new Error(`robocopy failed copying workspace with code ${workspaceCopy.status ?? 1}`);
    }

    const nodeModulesCopy = spawnSync("robocopy", [
      path.join(sourceDir, "node_modules"),
      path.join(destinationDir, "node_modules"),
      "/E",
      "/NFL",
      "/NDL",
      "/NJH",
      "/NJS",
      "/NP",
    ], { stdio: "ignore" });

    if ((nodeModulesCopy.status ?? 0) >= 8) {
      throw new Error(`robocopy failed copying node_modules with code ${nodeModulesCopy.status ?? 1}`);
    }

    return;
  }

  const excludedRoots = [
    path.join(sourceDir, "node_modules"),
    path.join(sourceDir, ".next"),
  ].map((root) => path.resolve(root));

  fs.cpSync(sourceDir, destinationDir, {
    recursive: true,
    dereference: true,
    preserveTimestamps: true,
    filter: (srcPath) => {
      const resolved = path.resolve(srcPath);
      return !excludedRoots.some((root) => resolved === root || resolved.startsWith(`${root}${path.sep}`));
    },
  });
}

function stageBuildWorkspace() {
  if (!isOneDriveWorkspace) {
    return projectDir;
  }

  try {
    fs.rmSync(tempBuildDir, { recursive: true, force: true });
  } catch {
    // The temp workspace can stay in place if Windows/OneDrive still has it open.
  }
  fs.mkdirSync(tempBuildDir, { recursive: true });
  copyWorkspace(projectDir, tempBuildDir);
  return tempBuildDir;
}

const buildDir = stageBuildWorkspace();
const nextBin = process.platform === "win32"
  ? path.join(projectDir, "node_modules", ".bin", "next.cmd")
  : path.join(projectDir, "node_modules", ".bin", "next");

const result = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: buildDir,
  env: process.env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
