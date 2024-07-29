import * as fs from "fs";
import * as path from "path";
import * as fastcsv from "fast-csv";

export const depositsCsvFilePath = path.join(__dirname, "../data/deposits.csv");
export const withdrawalsCsvFilePath = path.join(
  __dirname,
  "../data/withdrawals.csv"
);

type RowMap<V = any> = Record<string, V>;

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

export async function writeCSV<R extends RowMap>(
  path: string,
  data: R[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(path);
    fastcsv
      .write(data, { headers: true, includeEndRowDelimiter: true })
      .pipe(ws)
      .on("finish", resolve)
      .on("error", reject);
  });
}
