import fs from "fs/promises";
import path from "path";

/**
 * Function to find the path of a module in the directory and parent directories
 * @param {*} dir
 * @param {*} moduleName
 */
export async function findNpmPath(dir: string, moduleName: string) {
  if (dir === "/") return undefined;

  try {
    await fs.access(path.join(dir, "package.json"));

    const modulePath = await checkModuleInPackageJson(dir, moduleName);
    if (modulePath) {
      return modulePath;
    }
  } catch {
    // ignore, no package.json in this directory
  }

  return await findNpmPath(path.resolve(path.join(dir, "..")), moduleName);
}

/**
 * Function to check if a module exists in package.json and return the path
 * @param {*} dir
 * @param {*} moduleName
 * @returns
 */
async function checkModuleInPackageJson(dir: string, moduleName: string) {
  const packageJsonPath = path.join(dir, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  if (dependencies[moduleName] || devDependencies[moduleName]) {
    const modulePath = path.join(dir, "node_modules", moduleName);
    return modulePath;
  }
  return undefined;
}
