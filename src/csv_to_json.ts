import fs from 'fs';
import process from 'process';
import path from 'path';
import csvParser from '../node_modules/csv-parser/index';

async function csvToJson(input:string, arr:string[]):Promise<void> {

  for (let i = 0; i < arr.length; i++) {
    const currentDir = process.cwd();

    const outputPath = path.join(currentDir, 'converted', `${arr[i]}.json`);

    const readableStream = fs.createReadStream(path.join(currentDir, input, arr[i]));
    const writableStream = fs.createWriteStream(outputPath);

    readableStream.on('error', (err):void => {
      console.log('some issue with the readable stream:', err);
      process.exit(1);
    });

    writableStream.on('error', (err):void=> {
      console.log('some issue with the writable stream:', err);
      process.exit(1);
    });
    readableStream.pipe(csvParser())
      .on('data', (data:string):void => {
        data = JSON.stringify(data);
        writableStream.write(`${data}\n`);
      })
      .on('end', ():void => {
        console.log('end');
        writableStream.end();
      });

    writableStream.on('close', ():void => {  
      console.log('conversion close');
      process.exit(0);
    
    });
  }
  
}

function splintPathArr(pathArr:string[], cpuLength:number):Array<Array<string>> {
  const arrLength = pathArr.length;
  let count = Math.round(arrLength / cpuLength)
  const splintArr:Array<Array<string>> = [];
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

function dirFiles(path:string):Promise<string[]>{
   return new Promise((res, rej):void => {
  fs.readdir(path, (err, files:string[]):void => {
    if (err) {
      rej(err.message);
    }
    res(files);
  })
})
}

export { splintPathArr, csvToJson ,dirFiles};
