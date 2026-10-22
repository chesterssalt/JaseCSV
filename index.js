const csv = require("./jase-csv.js");
const fs = require("fs");

const data = csv.parseFile("data.csv");
fs.writeFileSync("test.json", JSON.stringify(data))