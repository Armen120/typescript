"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dirFiles = exports.csvToJson = exports.splintPathArr = void 0;
const fs_1 = __importDefault(require("fs"));
const process_1 = __importDefault(require("process"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("../node_modules/csv-parser/index"));
function csvToJson(input, arr) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < arr.length; i++) {
            const currentDir = process_1.default.cwd();
            const outputPath = path_1.default.join(currentDir, 'converted', `${arr[i]}.json`);
            const readableStream = fs_1.default.createReadStream(path_1.default.join(currentDir, input, arr[i]));
            const writableStream = fs_1.default.createWriteStream(outputPath);
            readableStream.on('error', (err) => {
                console.log('some issue with the readable stream:', err);
                process_1.default.exit(1);
            });
            writableStream.on('error', (err) => {
                console.log('some issue with the writable stream:', err);
                process_1.default.exit(1);
            });
            readableStream.pipe((0, index_1.default)())
                .on('data', (data) => {
                data = JSON.stringify(data);
                writableStream.write(`${data}\n`);
            })
                .on('end', () => {
                console.log('end');
                writableStream.end();
            });
            writableStream.on('close', () => {
                console.log('conversion close');
                process_1.default.exit(0);
            });
        }
    });
}
exports.csvToJson = csvToJson;
function splintPathArr(pathArr, cpuLength) {
    const arrLength = pathArr.length;
    let count = Math.round(arrLength / cpuLength);
    const splintArr = [];
    let k = 0;
    for (let i = 0; i < count; i++) {
        if (pathArr.length >= count) {
            if (pathArr.slice(k, pathArr.length).length - count < count) {
                splintArr.push(pathArr.slice(k, pathArr.length));
                break;
            }
            splintArr.push(pathArr.slice(k, k + count));
        }
        k += count;
    }
    return splintArr;
}
exports.splintPathArr = splintPathArr;
function dirFiles(path) {
    return new Promise((res, rej) => {
        fs_1.default.readdir(path, (err, files) => {
            if (err) {
                rej(err.message);
            }
            res(files);
        });
    });
}
exports.dirFiles = dirFiles;
