const fs = require("fs");

const inputFile = "generator - Copie.html";
const outputFile = "generator-fixed.html";

const content = fs.readFileSync(inputFile, "utf8");
const fixed = Buffer.from(content, "latin1").toString("utf8");

fs.writeFileSync(outputFile, fixed, "utf8");

console.log("✅ Fichier réparé :", outputFile);
