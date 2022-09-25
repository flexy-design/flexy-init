"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = require("fs");
const inquirer_1 = __importDefault(require("inquirer"));
const path_1 = __importDefault(require("path"));
void (() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const flexyConfigPath = path_1.default.resolve(process.cwd(), 'flexy.config.json');
    const flexySecretPath = path_1.default.resolve(process.cwd(), 'flexy.secret.json');
    if (!(0, fs_1.existsSync)(flexySecretPath)) {
        console.log(chalk_1.default.yellowBright(`You need to login first. Run ${chalk_1.default.bgYellowBright(' npx flexy-login ')} command.`));
        return;
    }
    if (!(0, fs_1.existsSync)(flexyConfigPath))
        (0, fs_1.writeFileSync)(flexyConfigPath, JSON.stringify({}));
    const flexyConfig = yield Promise.resolve().then(() => __importStar(require(flexyConfigPath)));
    const { personalAccessToken } = yield Promise.resolve().then(() => __importStar(require(flexySecretPath)));
    if (typeof flexyConfig['figmaUrls'] === 'undefined')
        flexyConfig['figmaUrls'] = {};
    console.log(chalk_1.default.blueBright(`     ________    _______  ____  __
    / ____/ /   / ____/ |/ /\\ \/  \/
   / /_  / /   / __/  |   /  \\  /
  / __/ / /___/ /___ /   |   / /
 /_/   /_____/_____//_/|_|  /_/`));
    const moduleJsonPath = path_1.default.resolve(__dirname, '../package.json');
    const packageJson = JSON.parse(String((0, fs_1.readFileSync)(moduleJsonPath)));
    console.log(chalk_1.default.blueBright(`\nWelcome to Flexy CLI! (${packageJson.version})`));
    const figmaUrlKeys = Object.keys(flexyConfig.figmaUrls);
    const addUrl = () => __awaiter(void 0, void 0, void 0, function* () {
        if (figmaUrlKeys.length === 0) {
            console.log(chalk_1.default.blueBright(`\nPlease enter the URL of the figma source to convert.`));
            const { figmaUrl } = yield inquirer_1.default.prompt([
                {
                    type: 'password',
                    name: 'figmaUrl',
                    message: 'Please Type Figma Source URL:'
                }
            ]);
            const { figmaUrlAlias } = yield inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'figmaUrlAlias',
                    message: 'Please Type Figma URL Alias:'
                }
            ]);
            flexyConfig.figmaUrls[figmaUrlAlias] = figmaUrl;
            const { addMore } = yield inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'addMore',
                    message: 'Add more figma url?',
                    default: false
                }
            ]);
            if (addMore)
                yield addUrl();
        }
        else {
            console.log(chalk_1.default.blueBright(`\nYou already have an added source.\nDo you want to more add the Figma source?`));
            const { addMore } = yield inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'addMore',
                    message: 'Add more figma url?',
                    default: false
                }
            ]);
            const { figmaUrl } = yield inquirer_1.default.prompt([
                {
                    type: 'password',
                    name: 'figmaUrl',
                    message: 'Please Type Figma Source URL:',
                    when: addMore
                }
            ]);
            const { figmaUrlAlias } = yield inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'figmaUrlAlias',
                    message: 'Please Type Figma URL Alias:',
                    when: addMore
                }
            ]);
            if (addMore) {
                flexyConfig.figmaUrls[figmaUrlAlias] = figmaUrl;
                yield addUrl();
            }
        }
    });
    yield addUrl();
    const { rawComponentPath } = yield inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'rawComponentPath',
            message: 'Please Type UI(Temporary) Component Path:',
            default: (_a = flexyConfig.rawComponentPath) !== null && _a !== void 0 ? _a : './components/flexy'
        }
    ]);
    if (rawComponentPath)
        flexyConfig.rawComponentPath = rawComponentPath;
    const { componentsPath } = yield inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'componentsPath',
            message: 'Please Type UX Component Path:',
            default: (_b = flexyConfig.componentsPath) !== null && _b !== void 0 ? _b : './components'
        }
    ]);
    if (componentsPath)
        flexyConfig.componentsPath = componentsPath;
    const { inlineSvg } = yield inquirer_1.default.prompt([
        {
            type: 'confirm',
            name: 'inlineSvg',
            message: 'Do you want to inline SVG?',
            default: (_c = flexyConfig.inlineSvg) !== null && _c !== void 0 ? _c : false
        }
    ]);
    if (inlineSvg)
        flexyConfig.inlineSvg = inlineSvg;
    const { publicPath } = yield inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'publicPath',
            message: 'Please Type Public Path:',
            default: (_d = flexyConfig.publicPath) !== null && _d !== void 0 ? _d : './public'
        }
    ]);
    if (publicPath)
        flexyConfig.publicPath = publicPath;
    console.log(chalk_1.default.blueBright(`\nDo you want to add components from the figma source?`));
    const { addComponents } = yield inquirer_1.default.prompt([
        {
            type: 'confirm',
            name: 'addComponents',
            message: 'Add components?',
            default: false
        }
    ]);
    const addComponent = () => __awaiter(void 0, void 0, void 0, function* () {
        var _e;
        const { figmaUrlAlias } = yield inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'figmaUrlAlias',
                message: 'Please Select Figma URL Alias:',
                choices: Object.keys(flexyConfig.figmaUrls)
            }
        ]);
        const fileId = flexyConfig.figmaUrls[figmaUrlAlias].replace(/^https:\/\/www\.figma\.com\/file\/(.*)\/(.*)$/, '$1');
        const { data, status } = yield axios_1.default.post('https://api.flexy.design/v1/info', {
            personalAccessToken,
            fileId
        });
        if (status !== 200 && !data.success) {
            console.log(chalk_1.default.red(`Failed to get figma info.`));
            return;
        }
        if (!data.pages || Object.keys(data.pages).length === 0) {
            console.log(chalk_1.default.red(`No pages found.`));
            return;
        }
        // * Select page
        const pages = data.pages.map((page) => page.name);
        const { page } = yield inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'page',
                message: 'Please Select Page:',
                choices: pages
            }
        ]);
        // * Select frame
        const frames = (_e = data.pages
            .find((p) => p.name === page)) === null || _e === void 0 ? void 0 : _e.children.map((child) => child.name);
        const { frame } = yield inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'frame',
                message: 'Please Select Frame:',
                choices: frames
            }
        ]);
        const { componentName } = yield inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'componentName',
                message: 'Please Type React Component Name: (Ex. SomeDesign)'
            }
        ]);
        if (typeof flexyConfig.components === 'undefined')
            flexyConfig.components = {};
        flexyConfig.components[componentName] = [figmaUrlAlias, page, frame];
        const { addMore } = yield inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'addMore',
                message: 'Add more component?',
                default: false
            }
        ]);
        if (addMore)
            yield addComponent();
    });
    if (addComponents)
        yield addComponent();
    (0, fs_1.writeFileSync)(flexyConfigPath, JSON.stringify(flexyConfig, null, 2));
    console.log(chalk_1.default.blueBright(`\nSuccess! You can now use the ${chalk_1.default.bgBlueBright(' npx flexy-sync ')} command.\n`));
}))();
