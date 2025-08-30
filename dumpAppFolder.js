// dumpAppFolder.js
const fs = require("fs");
const path = require("path");

const folder = path.join(__dirname, "app");
const outputFile = path.join(__dirname, "app_dump.txt");

function dumpFiles(dir, out) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      dumpFiles(fullPath, out);
    } else {
      out.write(`\n\n=== FILE: ${fullPath.replace(__dirname, "")} ===\n\n`);
      out.write(fs.readFileSync(fullPath, "utf8"));
    }
  }
}

const out = fs.createWriteStream(outputFile);
dumpFiles(folder, out);
out.end();

console.log(`✅ Dumped all files from /app into ${outputFile}`);
