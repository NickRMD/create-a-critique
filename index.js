#!/usr/bin/env node

// const spawn = require('cross-spawn');
// const fs = require('fs');
// const path = require('path');
import fs from "fs"
import spawn from "cross-spawn"
import path from "path"
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Module from "node:module";
import chalk from "chalk";
import sudo from "sudo-prompt"

const require = Module.createRequire(import.meta.url);

const projectName = process.argv[2];

let defaultName = "my-app";

if (projectName) {
  defaultName = projectName;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

inquirer
  .prompt([
    {
      type: "input",
      name: "projectName",
      message: `Project name:`,
      default: defaultName
    },
    {
      type: "confirm",
      name: "echo",
      message: `Use ${chalk.blue("Echo")} for backend?`,
    },
    {
      type: "confirm",
      name: "useTS",
      message: `Wish to use ${chalk.blue("TS")} instead of ${chalk.yellow("JS")}?`,
    },
    {
      type: "list",
      name: "packageManager",
      message: "Which package manager you wish to use?",
      choices: ["NPM", "Yarn", "PNPM"],
      default: "PNPM"
    }
  ])
  .then((anwsers) => main(anwsers))
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
      console.error(error)
    } else {
      // Something else went wrong
      console.error(error)
    }
  })

async function main(anwsers) {

  // console.log(anwsers)

  const projectName = anwsers.projectName;

  // Create a project directory with the project name.
  const currentDir = process.cwd();
  const projectDir = path.resolve(currentDir, projectName);
  fs.mkdirSync(projectDir, { recursive: true });

  // A common approach to building a starter template is to
  // create a `template` folder which will house the template
  // and the files we want to create.
  const templateDir = path.resolve(__dirname, 'template');
  fs.cpSync(templateDir, projectDir, { recursive: true });

  if (anwsers.useTS) {
    fs.rmSync(`${projectDir}/srcJS`, { recursive: true });
    fs.rmSync(`${projectDir}/webpack.js.config.cjs`)
    fs.renameSync(`${projectDir}/srcTS`, `${projectDir}/src`);
    fs.renameSync(`${projectDir}/webpack.ts.config.cjs`, `${projectDir}/webpack.config.cjs`)

    let indexTSFile = fs.readFileSync(`${projectDir}/src/index.ts`).toString();

    let times = 3;

    while (times > 0) {
      indexTSFile = indexTSFile.replace("// Ignored because the template can't have dependencies installed\n", "");
      indexTSFile = indexTSFile.replace("// @ts-ignore\n", "");
      times--;
    }

    fs.writeFileSync(path.join(`${projectDir}/src`, "index.ts"), indexTSFile)

  } else {
    fs.rmSync(`${projectDir}/srcTS`, { recursive: true });
    fs.rmSync(`${projectDir}/webpack.ts.config.cjs`)
    fs.rmSync(`${projectDir}/tsconfig.json`)
    fs.renameSync(`${projectDir}/srcJS`, `${projectDir}/src`);
    fs.renameSync(`${projectDir}/webpack.js.config.cjs`, `${projectDir}/webpack.config.cjs`)
  }

  // It is good practice to have dotfiles stored in the
  // template without the dot (so they do not get picked
  // up by the starter template repository). We can rename
  // the dotfiles after we have copied them over to the
  // new project directory.
  fs.renameSync(
    path.join(projectDir, 'gitignore'),
    path.join(projectDir, '.gitignore')
  );

  const projectPackageJson = require(path.join(projectDir, 'package.json'));

  let packageManager = ""

  switch (anwsers.packageManager) {
    case "NPM":
      packageManager = spawn.sync("npm", ["-v"]);
      if (packageManager.stdout !== null) {
        const version = packageManager.stdout.toString().replace(/(\r\n|\n|\r)/gm, "");
        projectPackageJson.packageManager = `npm@${version}`
      } else {
        throw new Error("Package manager not found!");
      }
      break;
    case "Yarn":
      packageManager = spawn.sync("yarn", ["-v"]);
      if (packageManager.stdout !== null) {
        const version = packageManager.stdout.toString().replace(/(\r\n|\n|\r)/gm, "");
        projectPackageJson.packageManager = `yarn@${version}`
      } else {
        throw new Error("Package manager not found!");
      }
      break;
    case "PNPM":
      packageManager = spawn.sync("pnpm", ["-v"]);
      if (packageManager.stdout !== null) {
        const version = packageManager.stdout.toString().replace(/(\r\n|\n|\r)/gm, "");
        projectPackageJson.packageManager = `pnpm@${version}`
      } else {
        throw new Error("Package manager not found!");
      }
      break;
  }

  // Update the project's package.json with the new project name
  projectPackageJson.name = projectName;

  console.log(projectPackageJson)

  fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(projectPackageJson, null, 2)
  );

  await inquirer
    .prompt([
      {
        type: "confirm",
        name: "installNow",
        message: "Install JS dependencies now?",
      }
    ])
    .then((anwser) => {

      if (anwser.installNow) {
        // Run `npm install` in the project directory to install
        // the dependencies. We are using a third-party library
        // called `cross-spawn` for cross-platform support.
        // (Node has issues spawning child processes in Windows).
        switch (anwsers.packageManager) {
          case "NPM":
            spawn.sync('npm', ['install', `--prefix`, `./${anwsers.projectName}`], { stdio: 'inherit' });
            break;
          case "Yarn":
            spawn.sync('yarn', [`--cwd`, `./${anwsers.projectName}`], { stdio: 'inherit' });
            break;
          case "PNPM":
            spawn.sync('pnpm', ['install', `--dir`, `./${anwsers.projectName}`], { stdio: 'inherit' });
            break;
        }
      }

    })

  console.log(chalk.bgGreen(chalk.black('Success! Your new project is ready.')));
  console.log(`Created ${chalk.cyanBright(projectName)} at ${chalk.bgWhite(chalk.black(projectDir))}`);

}