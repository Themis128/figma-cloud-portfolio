const fs = require("node:fs");
const path = require("node:path");

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const newContent = content.replace(/http:\/\/localhost:8081\//g, "/");
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith(".spec.ts")) {
      replaceInFile(fullPath);
    }
  }
}
processDirectory("./playwright-tests");
