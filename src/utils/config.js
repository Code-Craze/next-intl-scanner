"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = exports.validateConfig = exports.defaultConfig = void 0;
var sisteransi_d_1 = require("./../../node_modules/sisteransi/src/sisteransi.d");
var fs_1 = require("fs");
var logger_1 = require("./logger");
exports.defaultConfig = {
    locales: ["en"],
    sourceDirectory: "./",
    outputDirectory: "./messages",
    defaultLocale: "en",
    pages: [
        {
            match: "./src/(pages|app)/**/*.{js,jsx,ts,tsx}",
            ignore: ["**/*.test.{js,jsx,ts,tsx}", "**/_*.js"],
        },
    ],
    ignore: ["**/node_modules/**", "**/.next/**", ".git/**"],
};
var validateConfig = function (config) {
    //merge the default config with the user config
    //check if config.locales is array
    if (!config.locales ||
        !Array.isArray(config.locales) ||
        !config.locales.length) {
        logger_1.default.error("Locales are required");
        return false;
    }
    if (!config.sourceDirectory) {
        logger_1.default.error("Source directory is required");
        return false;
    }
    if (!config.outputDirectory) {
        logger_1.default.error("Output directory is required");
        return false;
    }
    if (!config.defaultLocale) {
        logger_1.default.error("Default locale is required");
        return false;
    }
    if (!config.pages || !config.pages.length) {
        logger_1.default.error("Pages are required");
        return false;
    }
    sisteransi_d_1.clear;
    if (!config.pages[0].match) {
        logger_1.default.error("Match is required");
        return false;
    }
    if (!config.pages[0].ignore) {
        logger_1.default.error("Ignore is required");
        return false;
    }
    return true;
};
exports.validateConfig = validateConfig;
var loadConfig = function (configPath_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([configPath_1], args_1, true), void 0, function (configPath, custom) {
        var parsedConfig, config, isJson, isJs;
        if (custom === void 0) { custom = false; }
        return __generator(this, function (_a) {
            parsedConfig = exports.defaultConfig;
            if (configPath) {
                if (custom) {
                    logger_1.default.info("Using custom configuration file: ".concat(configPath));
                    if (!fs_1.default.existsSync(configPath)) {
                        logger_1.default.error("Custom Configuration file does not exist");
                        return [2 /*return*/, null];
                    }
                    config = require(configPath);
                    //first find .json , if not found then find .js
                }
                else {
                    isJson = fs_1.default.existsSync(configPath + ".json");
                    isJs = fs_1.default.existsSync(configPath + ".js");
                    if (!isJson && !isJs) {
                        logger_1.default.error("Default Configuration file does not exist , please create  next-intl-scanner.config.js or next-intl-scanner.config.json in your project root");
                        return [2 /*return*/, null];
                    }
                    config = require(isJson ? configPath + ".json" : configPath + ".js");
                }
                parsedConfig = __assign(__assign({}, exports.defaultConfig), config);
                if (!(0, exports.validateConfig)(parsedConfig)) {
                    return [2 /*return*/, null];
                }
            }
            else {
                logger_1.default.info("Using default configuration");
            }
            return [2 /*return*/, parsedConfig];
        });
    });
};
exports.loadConfig = loadConfig;
