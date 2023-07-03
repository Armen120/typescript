"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const csv_to_json_1 = require("./csv_to_json");
const fs_1 = __importDefault(require("fs"));
const process_1 = __importDefault(require("process"));
function httpServer() {
    return (http_1.default.createServer((req, res) => {
        var _a, _b;
        console.log(req.method, req.url);
        if (req.method === 'POST' && req.url === '/csvs') {
            const arrInput = req.url.split('/');
            const input = arrInput[arrInput.length - 1];
            let arr;
            process_1.default.env.pathArr ? arr = process_1.default.env.pathArr.split(',') : arr = [];
            (0, csv_to_json_1.csvToJson)(input, arr);
            sendResponse(res, 100, 'converted');
        }
        else if (req.method === 'GET' && req.url === '/converted') {
            const filesArr = (0, csv_to_json_1.dirFiles)('./csvs');
            filesArr
                .then((data) => {
                let newData = '';
                data.forEach(element => {
                    newData += `${element}\n`;
                });
                sendResponse(res, 200, newData);
            }).catch(err => sendResponse(res, 400, err));
        }
        else if (((_a = req.url) === null || _a === void 0 ? void 0 : _a.includes('converted/')) && req.method === 'GET') {
            const arr = req.url.split('/');
            fs_1.default.readFile(`converted/${arr[2]}`, (err, data) => {
                if (err) {
                    sendResponse(res, 400, 'file is not finde');
                }
                else {
                    sendResponse(res, 200, data);
                }
            });
        }
        else if (((_b = req.url) === null || _b === void 0 ? void 0 : _b.includes('converted/')) && req.method === 'DELETE') {
            const arr = req.url.split('/');
            fs_1.default.unlink(`converted/${arr[2]}`, (err) => {
                if (err) {
                    sendResponse(res, 400, err.message);
                }
                else {
                    sendResponse(res, 200, 'file is deleted');
                }
            });
        }
        else {
            sendResponse(res, 500, 'unknown request');
        }
    }));
}
function sendResponse(res, status, data) {
    if (typeof data === 'string') {
        res.writeHead(status, { 'Content-Type': 'text/plain' });
        res.end(data);
    }
    else if (data) {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(data);
    }
}
exports.default = httpServer;
