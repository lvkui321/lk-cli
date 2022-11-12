'use strict';

const commander = require("commander");
const chalk = require('chalk');
const ora = require('ora')
const download = require('download-git-repo')
const inquirer = require('inquirer')
const fs = require('fs');
const path = require('path')

const packageJson = require('./package.json');
const templateUrls = {
  'umi':'github:lvkui321/umi-antd-template',
  'react':'github:facebook/create-react-app'
}

async function init () {
  let projectName;
  const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<project-name>')
  .usage(`<project-name>`)
  .action((name,options) => {
    projectName = name;
  })
  .parse(process.argv);
  console.info(`\nCreating a new React app in ${chalk.green(`${__dirname}/${projectName}`)}\n`)
  const { template:templateName } = await inquirer.prompt([{
    name: "template",
    type: 'list',
    choices: Object.keys(templateUrls),
    message: "Please select a template",
  }])
  const url = templateUrls[templateName]

  const spinner = ora("Template downloading...");
  spinner.start();
  download (
    url,
    projectName,
    err => {
      if (err) {
        spinner.fail();
        console.log(chalk.red(`Download failed. ${err}`))
        return
      }
      spinner.succeed();
      let question = [
        {
          name: "name",
          type: 'input',
          default: projectName,
          message: "name",
        },
        {
          name: "version",
          type: 'input',
          default:'1.0.0',
          message: "version"
        },
        {
          name: "description",
          type: 'input',
          message: "description"
        },
        {
          name: "author",
          type: 'input',
          message: "author"
        }
      ]
      console.info(`\nThis utility will walk you through creating a package.json file.`)
      console.info('It only covers the most common items, and tries to guess sensible defaults.')
      console.info(`\nPress ^C at any time to quit.`)
      inquirer.prompt(question).then(ans => {
        const filePath = path.resolve(__dirname, `./${projectName}/package.json`);
        const oldFile = fs.readFileSync(filePath,'utf8')
        const newFile = Object.assign(JSON.parse(oldFile),ans)
        fs.writeFileSync(filePath,JSON.stringify(newFile, null, 2))
        console.info(chalk.green(`\n Wow, you did it. You were amazing🎉🎉🎉 \n`))
        console.info(`Now you can start your project in the following ways\n`)
        console.info(`
            cd ${projectName}
            npm start
        `)
      })
    }
  )
}

module.exports = {
    init
};