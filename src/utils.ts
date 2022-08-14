import path from 'node:path';
import { cwd } from 'node:process';
import fs from 'node:fs';
import figlet from 'figlet';
import tinify from 'tinify';
import chalk from 'chalk';
import chokidar from 'chokidar';
import fse from 'fs-extra';
import ora from 'ora';

import type { Config, RecordType } from './types';

const log = console.log;
const RECORD_FILE_PATH = path.resolve(cwd(), 'record.json');

export async function startOptimize(configs: Config[], APIKey: string) {
  tinify.key = APIKey;

  await ConsoleFiglet('tiny img is running!');
  for (const config of configs) {
    const { targetDir } = config;
    log(chalk.bgBlue.bold(`${targetDir} is watching~~~\n`));

    chokidar
      .watch(path.resolve(cwd(), targetDir), {
        atomic: true,
        followSymlinks: true,
      })
      .on('all', (event, pathDir) => {
        switch (event) {
          case 'add':
            reduceImg(pathDir, pathDir);
            break;
          case 'unlink':
            autoRecord('unlink', pathDir);
            break;
          case 'change':
          default:
            break;
        }
      });
  }
}

function reduceImg(fileDir: string, targetDir: string) {
  if (!isImageFile(fileDir)) return;

  const spinner = ora('Loading').start();
  try {
    spinner.color = 'blue';
    spinner.text = chalk.bold.greenBright(`compressing ${fileDir}`);
    tinify
      .fromFile(fileDir)
      .toFile(targetDir)
      .then(() => {
        autoRecord('add', fileDir);
        spinner.succeed();
      });
  } catch (err) {
    log(chalk.red(`tinify Error: ${err}`));
    spinner.fail();
  }
}

async function isFileExist(fileDir: string) {
  return new Promise((resolve) => {
    return fs.access(fileDir, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });
}

async function addRecord(pathDir: string) {
  const isExist = await isFileExist(RECORD_FILE_PATH);
  const fileName = await getFileName(pathDir);

  if (isExist) {
    const json: Object = await fse.readJsonSync(RECORD_FILE_PATH);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    json[fileName] = pathDir;

    fse.writeJSONSync(RECORD_FILE_PATH, json);
  } else {
    fse.writeJsonSync(RECORD_FILE_PATH, { [fileName]: pathDir });
  }
}

async function removeRecord(pathDir: string) {
  const isExist = await isFileExist(RECORD_FILE_PATH);
  const fileName = await getFileName(pathDir);
  if (isExist) {
    const json: Object = await fse.readJsonSync(RECORD_FILE_PATH);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete json[fileName];
    fse.writeJSONSync(RECORD_FILE_PATH, json);
  }
}

function autoRecord(action: RecordType, fileDir: string) {
  if (!isImageFile(fileDir)) return;

  switch (action) {
    case 'add':
      addRecord(fileDir);
      break;
    case 'unlink':
      removeRecord(fileDir);
      break;
    case 'change':
    default:
      break;
  }
}

function getFileName(pathDir: string) {
  return path.basename(pathDir);
}

function getFileExtName(pathDir: string) {
  return path.extname(pathDir).slice(1);
}

function isImageFile(file: string) {
  const fileExtName = getFileExtName(file);
  const supportFiles = ['png', 'jpg', 'jpeg', 'webp'];
  return supportFiles.includes(fileExtName);
}

export function ConsoleFiglet(str: string) {
  return new Promise((resolve, reject) => {
    figlet(str, (err, data) => {
      if (err) {
        log(chalk.red('Something were wrong...'));
        log(chalk.red(err));
        reject(err);
      }

      log(data);
      resolve(data);
    });
  });
}
