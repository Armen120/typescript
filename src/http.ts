
import http, { ServerResponse } from 'http'
import { csvToJson ,dirFiles} from './func.js'
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
                if (process.env.env) {
                    arr = process.env.env.split(',');
                } else {
                    arr = [];
                }
                csvToJson(input, arr);
                header(res,100,'converted');

            } else if (req.method === 'GET' && req.url === '/converted') {
                const filesArr: Promise<Array<string>> = dirFiles('./csvs');
                filesArr
                    .then((data: string[]): void => {
                        let newData:string = '';
                        data.forEach(element => {
                            newData += `${element}\n`;
                        })
                            header(res,200,newData);
                    }).catch(err => header(res,400,err) )

            } else if (req.url?.includes('converted/') && req.method === 'GET') {
                const arr = req.url.split('/');
                fs.readFile(`converted/${arr[2]}`, (err,data):void => {
                    if (err) {
                       header(res,400,'file is not finde');
                    } else {
                        header(res,200,data);
                    }
                });


            } else if (req.url?.includes('converted/') && req.method === 'DELETE') {
                const arr = req.url.split('/');
                fs.unlink(`converted/${arr[2]}`, (err):void => {
                    if (err) {
                        header(res,400,err.message);
                    } else {
                        header(res,200,'file is deleted');
                    }
                })

            }else{
                header(res,500,'unknown request');
            }
        })
    )
} 

function header(res:ServerResponse,status:number,data:unknown):void{
  
  if(typeof data === 'string'){
    res.writeHead(status, {'Content-Type': 'text/plain'});
    res.end(data);
  }else{
    res.writeHead(status, {'Content-Type': 'application/json'});
    res.end(data);
  }

}

export default httpServer;