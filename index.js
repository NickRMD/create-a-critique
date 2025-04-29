#!/usr/bin/env node

import fs from "fs"
import spawn from "cross-spawn"
import path from "path"
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Module from "node:module";
import chalk from "chalk";

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
      message: `Use ${chalk.blue("Echo")} for backend? (Still not working, will use Echo for either)`,
    },
    {
      type: "list",
      name: "packageManager",
      message: "Which package manager you wish to use?",
      choices: ["NPM", "Yarn (Unavailable for now)", "PNPM"],
      default: "PNPM"
    },
    {
      type: "confirm",
      name: "goInstalled",
      message: "Do you wish to be prompted to install the necessary tools? (Only works if golang is installed)",
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

  if (anwsers.goInstalled) {
    await inquirer
      .prompt([
        {
          type: "confirm",
          name: "installAir",
          message: "Do you wanna install Air now?"
        },
        {
          type: "confirm",
          name: "installTempl",
          message: "Do you wish to install Templ now?"
        }
      ])
      .then((anwsers) => {
        if (anwsers.installAir) {
          spawn.sync('go', ['install', `github.com/air-verse/air@latest`], { stdio: 'inherit' });
        }
        if (anwsers.installTempl) {
          spawn.sync('go', ['install', `github.com/a-h/templ/cmd/templ@latest`], { stdio: 'inherit' });
        }
      })
  }

  // console.log(anwsers)

  if (anwsers.packageManager === "Yarn (Unavailable for now)") {
    console.log("Yarn is unavailable for now, please choose another.")
    process.exit(1)
  }

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

    let indexTSFile = fs.readFileSync(`${projectDir}/src/index.ts`).toString();

    let times = 3;

    while (times > 0) {
      indexTSFile = indexTSFile.replace("// Ignored because the template can't have dependencies installed\n", "");
      indexTSFile = indexTSFile.replace("// @ts-ignore\n", "");
      times--;
    }

    fs.writeFileSync(path.join(`${projectDir}/src`, "index.ts"), indexTSFile)

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
            spawn.sync('pnpm', ['approve-builds', '--dir', `./${anwsers.projectName}`], { stdio: 'inherit' })
            break;
        }
      }

    })

  console.log(chalk.bgGreen(chalk.black('Your new project is ready. Run the "npm/pnpm run dev" command to start the program.')));
  console.log(`Created ${chalk.cyanBright(projectName)} at ${chalk.bgWhite(chalk.black(projectDir))}`);

}
