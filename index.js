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

const devDependenciesForJS = {
  "autoprefixer": "^10.4.19",
  "concurrently": "8.2.2",
  "css-loader": "^7.1.1",
  "cssnano": "^7.0.1",
  "postcss": "^8.4.38",
  "postcss-cli": "^11.0.0",
  "postcss-import": "^16.1.0",
  "postcss-loader": "^8.1.1",
  "postcss-nested": "^6.0.1",
  "postcss-preset-env": "^9.5.13",
  "postcss-scss": "^4.0.9",
  "sass": "^1.77.1",
  "sass-loader": "^14.2.1",
  "style-loader": "^4.0.0",
  "tailwindcss": "^3.4.3",
  "webpack": "^5.91.0",
  "webpack-cli": "^5.1.4"
}

const devDependenciesForTS = {
  "@types/alpinejs": "^3.13.10",
  "@types/alpinejs__morph": "^3.13.4",
  "autoprefixer": "^10.4.19",
  "concurrently": "8.2.2",
  "css-loader": "^7.1.1",
  "cssnano": "^7.0.1",
  "postcss": "^8.4.38",
  "postcss-cli": "^11.0.0",
  "postcss-import": "^16.1.0",
  "postcss-loader": "^8.1.1",
  "postcss-nested": "^6.0.1",
  "postcss-preset-env": "^9.5.13",
  "postcss-scss": "^4.0.9",
  "sass": "^1.77.1",
  "sass-loader": "^14.2.1",
  "style-loader": "^4.0.0",
  "tailwindcss": "^3.4.3",
  "ts-loader": "^9.5.1",
  "typescript": "^5.4.5",
  "webpack": "^5.91.0",
  "webpack-cli": "^5.1.4"
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
      type: "confirm",
      name: "useTS",
      message: `Wish to use ${chalk.blue("TS")} instead of ${chalk.yellow("JS")}?`,
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
          spawn.sync('go', ['install', `github.com/cosmtrek/air@latest`], { stdio: 'inherit' });
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

  let devDependencies = {};

  if (anwsers.useTS) {
    devDependencies = devDependenciesForTS;
  } else {
    devDependencies = devDependenciesForJS;
  }

  // Update the project's package.json with the new project name
  projectPackageJson.name = projectName;
  projectPackageJson.devDependencies = devDependencies;

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

  console.log(chalk.bgGreen(chalk.black('Your new project is ready. Run the "npm/pnpm run dev" command to start the program.')));
  console.log(`Created ${chalk.cyanBright(projectName)} at ${chalk.bgWhite(chalk.black(projectDir))}`);

}