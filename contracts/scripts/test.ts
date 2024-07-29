import * as fs from "fs";
import * as csv from "fast-csv";
import { finished } from "stream/promises";

async function main() {
  const writeStream: fs.WriteStream = fs.createWriteStream("output.txt");

  const headers = ["header1", "header2"];
  const csvStream = csv.format({ headers, alwaysWriteHeaders: true});

  csvStream.pipe(writeStream);
  // csvStream.write({ header1: "row1-col1", header2: "row1-col2" });
  // csvStream.write({ header1: "row2-col1", header2: "row2-col2" });
  // csvStream.write({ header1: "row3-col1", header2: "row3-col2" });
  // csvStream.write({ header1: "row4-col1", header2: "row4-col2" });
  // csvStream.write({ header1: "row5-col1", header2: "row5-col2" });
  csvStream.end();
  await finished(writeStream);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
