const { readJsonFile, writeJsonFile } = require("../utils/file");

function readSchema(schemaPath) {
  return readJsonFile(schemaPath);
}

function writeSchema(schemaPath, schema) {
  writeJsonFile(schemaPath, schema);
}

module.exports = {
  readSchema,
  writeSchema,
};
