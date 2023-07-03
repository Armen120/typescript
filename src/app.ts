import fs from "fs";
import cluster from "cluster";
import os from "os";
import { splintPathArr } from "./csv_to_json";
import httpServer from "./http";

if (cluster.isPrimary) {
  let count: number = os.cpus().length;
  const filesArr: Promise<string[]> = new Promise((res, rej): void => {
    fs.readdir("./csvs", (err, files: string[]): void => {
      if (err) {
        rej(err.message);
      }
      res(files);
    })
  })

  filesArr
    .then((data): void => {
      const pathArr: string[][] = splintPathArr(data, count);
      for (let i = 0; i < pathArr.length; i++) {
        const worker = cluster.fork({ pathArr: pathArr[i] });
        console.log("worker:", worker.id);
      }
    })
    .catch((er): void => console.log(er));
} else {
  const server = httpServer();
  server
    .listen(4000, "localhost", (): void => {
      console.log("listening port:4000");
    })
    .on("error", (err): void => console.log(err.message));
}
