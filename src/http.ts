
import http, { ServerResponse } from 'http'
import { csvToJson ,dirFiles} from './csv_to_json'
import fs from 'fs';
import process from 'process'

function httpServer(): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> {
    return(
       http.createServer((req, res): void => {
            console.log(req.method, req.url);

            if (req.method === 'POST' && req.url === '/csvs') {
                
                const arrInput = req.url.split('/');
                const input: string = arrInput[arrInput.length - 1];
                let arr: Array<string>;

                process.env.pathArr? arr = process.env.pathArr.split(','):arr = [];

                csvToJson(input, arr);
                sendResponse(res,100,'converted');

            } else if (req.method === 'GET' && req.url === '/converted') {
                const filesArr: Promise<Array<string>> = dirFiles('./csvs');
                filesArr
                    .then((data: string[]): void => {
                        let newData:string = '';
                        data.forEach(element => {
                            newData += `${element}\n`;
                        })
                            sendResponse(res,200,newData);
                    }).catch(err => sendResponse(res,400,err))

            } else if (req.url?.includes('converted/') && req.method === 'GET') {
                const arr = req.url.split('/');
                fs.readFile(`converted/${arr[2]}`, (err,data):void => {
                    if (err) {
                       sendResponse(res,400,'file is not finde');
                    } else {
                        sendResponse(res,200,data);
                    }
                });


            } else if (req.url?.includes('converted/') && req.method === 'DELETE') {
                const arr = req.url.split('/');
                fs.unlink(`converted/${arr[2]}`, (err):void => {
                    if (err) {
                        sendResponse(res,400,err.message);
                    } else {
                        sendResponse(res,200,'file is deleted');
                    }
                })

            }else{
                sendResponse(res,500,'unknown request');
            }
        })
    )
} 

function sendResponse(res:ServerResponse,status:number,data:unknown):void{
  
  if(typeof data === 'string'){
    res.writeHead(status, {'Content-Type': 'text/plain'});
    res.end(data);
  }else if(data){
    res.writeHead(status, {'Content-Type': 'application/json'});
    res.end(data);
  }

}


export default httpServer;