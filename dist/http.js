import http from 'http';
import { csvToJson, dirFiles } from './func.js';
import fs from 'fs';
import process from 'process';
function httpServer() {
    return (http.createServer((req, res) => {
        var _a, _b;
        console.log(req.method, req.url);
        if (req.method === 'POST' && req.url === '/csvs') {
            const arrInput = req.url.split('/');
            const input = arrInput[arrInput.length - 1];
            let arr;
            if (process.env.env) {
                arr = process.env.env.split(',');
            }
            else {
                arr = [];
            }
            csvToJson(input, arr);
            header(res, 100, 'converted');
        }
        else if (req.method === 'GET' && req.url === '/converted') {
            const filesArr = dirFiles('./csvs');
            filesArr
                .then((data) => {
                let newData = '';
                data.forEach(element => {
                    newData += `${element}\n`;
                });
                header(res, 200, newData);
            }).catch(err => header(res, 400, err));
        }
        else if (((_a = req.url) === null || _a === void 0 ? void 0 : _a.includes('converted/')) && req.method === 'GET') {
            const arr = req.url.split('/');
            fs.readFile(`converted/${arr[2]}`, (err, data) => {
                if (err) {
                    header(res, 400, 'file is not finde');
                }
                else {
                    header(res, 200, data);
                }
            });
        }
        else if (((_b = req.url) === null || _b === void 0 ? void 0 : _b.includes('converted/')) && req.method === 'DELETE') {
            const arr = req.url.split('/');
            fs.unlink(`converted/${arr[2]}`, (err) => {
                if (err) {
                    header(res, 400, err.message);
                }
                else {
                    header(res, 200, 'file is deleted');
                }
            });
        }
        else {
            header(res, 500, 'unknown request');
        }
    }));
}
function header(res, status, data) {
    if (typeof data === 'string') {
        res.writeHead(status, { 'Content-Type': 'text/plain' });
        res.end(data);
    }
    else {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(data);
    }
}
export default httpServer;
