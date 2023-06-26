var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs';
import process from 'process';
import path from 'path';
import csvParser from '../node_modules/csv-parser/index.js';
function csvToJson(input, arr) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < arr.length; i++) {
            const currentDir = process.cwd();
            const outputPath = path.join(currentDir, 'converted', `${arr[i]}.json`);
            const readableStream = fs.createReadStream(path.join(currentDir, input, arr[i]));
            const writableStream = fs.createWriteStream(outputPath);
            readableStream.on('error', (err) => {
                console.log('some issue with the readable stream:', err);
                process.exit(1);
            });
            writableStream.on('error', (err) => {
                console.log('some issue with the writable stream:', err);
                process.exit(1);
            });
            readableStream.pipe(csvParser())
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
                process.exit(0);
            });
        }
    });
}
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
function dirFiles(path) {
    return new Promise((res, rej) => {
        fs.readdir(path, (err, files) => {
            if (err) {
                rej(err.message);
            }
            res(files);
        });
    });
}
export { splintPathArr, csvToJson, dirFiles };
