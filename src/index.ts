import axios from 'axios'
import chalk from 'chalk'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import inquirer from 'inquirer'
import path from 'path'

export {}

void (async () => {
  const flexyConfigPath = path.resolve(process.cwd(), 'flexy.config.json')
  const flexySecretPath = path.resolve(process.cwd(), 'flexy.secret.json')

  if (!existsSync(flexySecretPath)) {
    console.log(
      chalk.yellowBright(
        `You need to login first. Run ${chalk.bgYellowBright(
          ' npx flexy-login '
        )} command.`
      )
    )
    return
  }

  if (!existsSync(flexyConfigPath))
    writeFileSync(flexyConfigPath, JSON.stringify({}))

  const flexyConfig = await import(flexyConfigPath)
  const { personalAccessToken } = await import(flexySecretPath)

  if (typeof flexyConfig['figmaUrls'] === 'undefined')
    flexyConfig['figmaUrls'] = {}

  console.log(
    chalk.blueBright(`     ________    _______  ____  __
    / ____/ /   / ____/ |/ /\\ \/  \/
   / /_  / /   / __/  |   /  \\  /
  / __/ / /___/ /___ /   |   / /
 /_/   /_____/_____//_/|_|  /_/`)
  )

  const moduleJsonPath = path.resolve(__dirname, '../package.json')
  const packageJson = JSON.parse(String(readFileSync(moduleJsonPath)))

  console.log(
    chalk.blueBright(`\nWelcome to Flexy CLI! (${packageJson.version})`)
  )

  const figmaUrlKeys = Object.keys(flexyConfig.figmaUrls)

  const addUrl = async () => {
    if (figmaUrlKeys.length === 0) {
      console.log(
        chalk.blueBright(
          `\nPlease enter the URL of the figma source to convert.`
        )
      )

      const { figmaUrl } = await inquirer.prompt([
        {
          type: 'password',
          name: 'figmaUrl',
          message: 'Please Type Figma Source URL:'
        }
      ])

      const { figmaUrlAlias } = await inquirer.prompt([
        {
          type: 'input',
          name: 'figmaUrlAlias',
          message: 'Please Type Figma URL Alias:'
        }
      ])

      flexyConfig.figmaUrls[figmaUrlAlias] = figmaUrl

      const { addMore } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'addMore',
          message: 'Add more figma url?',
          default: false
        }
      ])

      if (addMore) await addUrl()
    } else {
      console.log(
        chalk.blueBright(
          `\nYou already have an added source.\nDo you want to more add the Figma source?`
        )
      )

      const { addMore } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'addMore',
          message: 'Add more figma url?',
          default: false
        }
      ])

      const { figmaUrl } = await inquirer.prompt([
        {
          type: 'password',
          name: 'figmaUrl',
          message: 'Please Type Figma Source URL:',
          when: addMore
        }
      ])

      const { figmaUrlAlias } = await inquirer.prompt([
        {
          type: 'input',
          name: 'figmaUrlAlias',
          message: 'Please Type Figma URL Alias:',
          when: addMore
        }
      ])

      if (addMore) {
        flexyConfig.figmaUrls[figmaUrlAlias] = figmaUrl
        await addUrl()
      }
    }
  }

  await addUrl()

  const { rawComponentPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'rawComponentPath',
      message: 'Please Type UI(Temporary) Component Path:',
      default: flexyConfig.rawComponentPath ?? './components/flexy'
    }
  ])
  if (rawComponentPath) flexyConfig.rawComponentPath = rawComponentPath

  const { componentsPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'componentsPath',
      message: 'Please Type UX Component Path:',
      default: flexyConfig.componentsPath ?? './components'
    }
  ])
  if (componentsPath) flexyConfig.componentsPath = componentsPath

  const { inlineSvg } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'inlineSvg',
      message: 'Do you want to inline SVG?',
      default: flexyConfig.inlineSvg ?? false
    }
  ])
  if (inlineSvg) flexyConfig.inlineSvg = inlineSvg

  const { publicPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'publicPath',
      message: 'Please Type Public Path:',
      default: flexyConfig.publicPath ?? './public'
    }
  ])
  if (publicPath) flexyConfig.publicPath = publicPath

  console.log(
    chalk.blueBright(`\nDo you want to add components from the figma source?`)
  )

  const { addComponents } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addComponents',
      message: 'Add components?',
      default: false
    }
  ])

  const addComponent = async () => {
    const { figmaUrlAlias } = await inquirer.prompt([
      {
        type: 'list',
        name: 'figmaUrlAlias',
        message: 'Please Select Figma URL Alias:',
        choices: Object.keys(flexyConfig.figmaUrls)
      }
    ])

    const fileId = flexyConfig.figmaUrls[figmaUrlAlias].replace(
      /^https:\/\/www\.figma\.com\/file\/(.*)\/(.*)$/,
      '$1'
    )

    const { data, status } = await axios.post<
      | {
          success: boolean
          pages: {
            name: string
            index: number
            children: {
              name: string
              index: number
            }[]
          }[]
          message?: undefined
        }
      | {
          success: boolean
          message: string
          pages?: undefined
        }
    >('https://api.flexy.design/v1/info', {
      personalAccessToken,
      fileId
    })

    if (status !== 200 && !data.success) {
      console.log(chalk.red(`Failed to get figma info.`))
      return
    }
    if (!data.pages || Object.keys(data.pages).length === 0) {
      console.log(chalk.red(`No pages found.`))
      return
    }

    // * Select page
    const pages = data.pages.map((page) => page.name)
    const { page } = await inquirer.prompt([
      {
        type: 'list',
        name: 'page',
        message: 'Please Select Page:',
        choices: pages
      }
    ])

    // * Select frame
    const frames = data.pages
      .find((p) => p.name === page)
      ?.children.map((child) => child.name)
    const { frame } = await inquirer.prompt([
      {
        type: 'list',
        name: 'frame',
        message: 'Please Select Frame:',
        choices: frames
      }
    ])

    const { componentName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'componentName',
        message: 'Please Type React Component Name: (Ex. SomeDesign)'
      }
    ])

    if (typeof flexyConfig.components === 'undefined')
      flexyConfig.components = {}

    flexyConfig.components[componentName] = [figmaUrlAlias, page, frame]

    const { addMore } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addMore',
        message: 'Add more component?',
        default: false
      }
    ])

    if (addMore) await addComponent()
  }

  if (addComponents) await addComponent()

  writeFileSync(flexyConfigPath, JSON.stringify(flexyConfig, null, 2))

  console.log(
    chalk.blueBright(
      `\nSuccess! You can now use the ${chalk.bgBlueBright(
        ' npx flexy-sync '
      )} command.\n`
    )
  )
})()
