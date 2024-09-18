import * as fs from "fs";
import * as fastcsv from "fast-csv";

export async function appendCSV<R>(path: string, row: R) {
  return new Promise((resolve, reject) => {
    const fileExists = fs.existsSync(path);
    const csvStream = fastcsv.format({
      headers: !fileExists,
      includeEndRowDelimiter: true,
    });
    const ws = fs.createWriteStream(path, { flags: "a" });
    csvStream.pipe(ws).on("finish", resolve).on("error", reject);
    csvStream.write(row);
    csvStream.end();
  });
}

export async function readCSV<R>(path: string): Promise<R[]> {
  return new Promise((resolve, reject) => {
    const rows: R[] = [];
    fs.createReadStream(path)
      .pipe(fastcsv.parse({ headers: true }))
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", (error) => reject(error));
  });
}

export async function writeCSV<R extends Record<string, any>>(
  path: string,
  data: R[],
  headers: string[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(path);
    fastcsv
      .write(data, {
        headers,
        includeEndRowDelimiter: true,
        alwaysWriteHeaders: true,
      })
      .pipe(ws)
      .on("finish", resolve)
      .on("error", reject);
  });
}
