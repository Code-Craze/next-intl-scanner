import fs from "fs";
import path from "path";
import { glob } from "glob";
import Logger from "./logger";
import { loadConfig } from "./config";
import type { Config, DefaultOptions } from "./types";

const extractTranslations = async (options: DefaultOptions = {}) => {
  let configPath = path.resolve(process.cwd(), "next-intl-scanner.config");

  if (options.config) {
    configPath = path.resolve(process.cwd(), options.config);
  }

  const config: Config | null = await loadConfig(
    configPath,
    options.config ? true : false
  );

  if (!config) {
    Logger.error("Could not load configuration file");
    return;
  }

  Logger.info("Extracting translations...");

  const allFiles: any = [];

  const basepath = path.resolve(process.cwd(), config.sourceDirectory);
  //check if the source directory exists
  if (!fs.existsSync(basepath)) {
    Logger.error(`Source directory ${basepath} does not exist`);
    return;
  }

  //extract translations
  //first we need to get all the files that match the pattern
  for (const page of config.pages) {
    const files = await glob(page.match, {
      ignore: page.ignore.concat(config.ignore),
    });

    allFiles.push(...files);
  }

  //identify the custom patterns
  const validCustomPatterns = config.customJSXPattern?.filter(
    (customPattern) =>
      customPattern.element &&
      customPattern.attributes &&
      customPattern.attributes.namespace &&
      customPattern.attributes.string
  );

  const invalidCustomPatterns = config.customJSXPattern?.filter(
    (customPattern) =>
      !customPattern.element ||
      !customPattern.attributes ||
      !customPattern.attributes.namespace ||
      !customPattern.attributes.string
  );

  if (validCustomPatterns.length > 0) {
    Logger.info(
      `Using custom JSX patterns: ${JSON.stringify(validCustomPatterns)}`
    );

    for (const customPattern of validCustomPatterns) {
      Logger.info(
        `expecting element: <${customPattern.element} ${customPattern.attributes.namespace}="exampleNamespace" ${customPattern.attributes.string}="exampleString">`
      );
    }
  }

  if (invalidCustomPatterns.length > 0) {
    Logger.warn(
      `Skipping invalid custom JSX patterns found: ${JSON.stringify(
        invalidCustomPatterns
      )}`
    );
  }

  const allTranslations: {
    nameSpace: string;
    string: string;
  }[] = [];

  //then we need to extract the translations from each file

  for (const file of allFiles) {
    const source = fs.readFileSync(file, "utf-8");
    if (!source || source === null || !source.length) {
      Logger.error(`Could not read file: ${file}`);
      return;
    }

    const nameSpaceMatch = source.match(/\buseTranslations\(['"](.+?)['"]\)/g);
    const nameSpace: string =
      nameSpaceMatch && nameSpaceMatch.length
        ? nameSpaceMatch[0].replace(/\buseTranslations\(['"](.+?)['"]\)/, "$1")
        : "";

    const regex = /\bt\s*\(\s*(['"`])([^'"`]+?)\1/g;

    let match;
    const translations: { [key: string]: string } = {};

    while ((match = regex.exec(source)) !== null) {
      translations[match[2]] = match[2];
    }

    if (translations && Object.keys(translations).length) {
      Object.keys(translations).forEach((t: string) => {
        const string = t.replace(/\bt\(['"](.+?)['"]\)/, "$1");
        if (nameSpace) {
          //escape the string

          allTranslations.push({
            nameSpace,
            string,
          });
        } else {
          allTranslations.push({
            nameSpace: "",
            string,
          });
        }
      });
    }

    for (const pattern of validCustomPatterns) {
      // Match the whole tag with its attributes
      const tagRegex = new RegExp(`<${pattern.element}[^>]*?>`, "g");
      let match;

      // Loop through all matches in the input
      while ((match = tagRegex.exec(source)) !== null) {
        const tag = match[0]; // Full tag with attributes

        // Match individual attributes inside the tag
        const attributeRegex = /(\w+)=\{(['"`])(.*?)\2\}/g;
        let attributeMatch;

        // Store attributes in an object to handle multiple attributes
        const attributes: {
          [key: string]: string;
        } = {};

        // Loop through all matches for attributes in the tag
        while ((attributeMatch = attributeRegex.exec(tag)) !== null) {
          const attributeName = attributeMatch[1]; // e.g., 'string', 'namespace'
          const attributeValue = attributeMatch[3]; // e.g., 'Kanban Board'

          // Store the attribute value in the attributes object
          attributes[attributeName] = attributeValue;
        }

        if (
          attributes[pattern.attributes.string] &&
          attributes[pattern.attributes.namespace]
        ) {
          const string = attributes[pattern.attributes.string];
          const namespace = attributes[pattern.attributes.namespace];

          allTranslations.push({
            nameSpace: namespace,
            string: string,
          });
        }
      }
    }
  }

  //now lets map it to an object
  const translationsObject: any = {};

  for (const translation of allTranslations) {
    const { nameSpace, string } = translation;

    if (nameSpace.length > 0) {
      if (!translationsObject[nameSpace]) {
        translationsObject[nameSpace] = {};
      }

      translationsObject[nameSpace][string] = string;
    } else {
      translationsObject[string] = string;
    }
  }

  // now lets write the translations to the output directory
  // if the output directory does not exist we need to create it
  if (!fs.existsSync(config.outputDirectory)) {
    fs.mkdirSync(config.outputDirectory, { recursive: true });
  }

  if (config.locales && config.locales.length) {
    for (const locale of config.locales) {
      const localeFile = path.resolve(config.outputDirectory, `${locale}.json`);
      const localeTranslations = fs.existsSync(localeFile)
        ? JSON.parse(fs.readFileSync(localeFile, "utf-8"))
        : {};

      for (const translation of allTranslations) {
        const { nameSpace, string } = translation;

        if (nameSpace.length > 0) {
          if (!localeTranslations[nameSpace]) {
            localeTranslations[nameSpace] = {};
          }

          localeTranslations[nameSpace][string] = string;
        } else {
          localeTranslations[string] = string;
        }
      }

      //write the translations to the file
      fs.writeFileSync(localeFile, JSON.stringify(localeTranslations, null, 2));
      Logger.info(`Translations for locale ${locale} written to ${localeFile}`);
    }
  }

  Logger.success("Translations extracted successfully");
};

export default extractTranslations;
