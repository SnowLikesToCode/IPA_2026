const fs = require("fs");
const path = require("path");

function resolvePath(filePath) {
  if (!filePath) {
    return null;
  }
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function writeJsonFile(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

module.exports = {
  resolvePath,
  readJsonFile,
  writeJsonFile,
};
