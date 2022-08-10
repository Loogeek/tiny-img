import path from 'node:path'
import { cwd } from 'node:process'
import fs from 'node:fs'
import figlet from 'figlet'
import tinify from 'tinify'
import chalk from 'chalk'
import chokidar from 'chokidar'
import ora from 'ora'

import type { Config, ExportConfig, RecordType } from './types'

const log = console.log

export async function startOptimize(configs: Config[], APIKey: string) {
  tinify.key = APIKey
  await ConsoleFiglet('tiny img is running!')
  for (const config of configs) {
    const { targetDir } = config
    log(chalk.bgBlue.bold(`${targetDir} is watching ~~\n`))

    chokidar.watch(path.resolve(cwd(), targetDir)).on('all', (event, pathDir) => {
      switch (event) {
        case 'add':
          reduceImg(pathDir, pathDir)
          break
        case 'unlink':
          removeImg()
          break
        case 'change':
        default:
          break
      }
    })
  }
}

function reduceImg(fileDir: string, targetDir: string) {
  if (!isImageFile(fileDir))
    return

  const spinner = ora('Loading').start()

  try {
    spinner.color = 'green'
    spinner.text = chalk.bold.greenBright(`compressing ${fileDir}`)
    tinify.fromFile(fileDir).toFile(targetDir).then(() => {
      autoRecord('add', fileDir)
      spinner.succeed()
    })
  }
  catch (error) {
    log(chalk.red(error))
    spinner.fail()
  }
}

function removeImg() {

}

function autoRecord(type: RecordType, fileDir: string) {
  switch (type) {
    case 'add':
      break
  }
}

function getFileExtName(pathDir: string) {
  return path.extname(pathDir).slice(1)
}

function isImageFile(file: string) {
  const fileExtName = getFileExtName(file)
  const supportFiles = ['png', 'jpg', 'jpeg', 'web']
  return supportFiles.includes(fileExtName)
}

export function ConsoleFiglet(str: string) {
  return new Promise((resolve, reject) => {
    figlet(str, (err, data) => {
      if (err) {
        log(chalk.red('Something were wrong!'))
        log(chalk.red(err))
        reject(err)
      }

      log(chalk.green(data))
      resolve(data)
    })
  })
}
