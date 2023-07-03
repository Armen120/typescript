"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const csv_to_json_1 = require("./csv_to_json");
const http_1 = __importDefault(require("./http"));
if (cluster_1.default.isPrimary) {
    let count = os_1.default.cpus().length;
    const filesArr = new Promise((res, rej) => {
        fs_1.default.readdir("./csvs", (err, files) => {
            if (err) {
                rej(err.message);
            }
            res(files);
        });
    });
    filesArr
        .then((data) => {
        const pathArr = (0, csv_to_json_1.splintPathArr)(data, count);
        for (let i = 0; i < pathArr.length; i++) {
            const worker = cluster_1.default.fork({ pathArr: pathArr[i] });
            console.log("worker:", worker.id);
        }
    })
        .catch((er) => console.log(er));
}
else {
    const server = (0, http_1.default)();
    server
        .listen(4000, "localhost", () => {
        console.log("listening port:4000");
    })
        .on("error", (err) => console.log(err.message));
}
