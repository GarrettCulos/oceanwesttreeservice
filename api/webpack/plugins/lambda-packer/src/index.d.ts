export declare class SamWebpackPlugin {
  declarationRegex: RegExp;
  deploymentFolder: string;
  options: {
    [optionName: string]: any;
  };
  packageLock: any;
  /**
   * @param {Object} options
   * @param {String} options.output
   * @param {Boolean} options.verbose
   */
  constructor(d: { output?: string; requireTxt?: boolean; verbose?: boolean });
  /**
   * Parses the content of the lambda decorator
   * @param {String} content
   * @returns {Object}
   */
  parseLambdaDeclaration(content: string): object;
  /**
   * Compute all external dependencies and sub deps
   * @param {Array} dependencies
   * @returns {String[]}
   */
  logDependencies(
    dependencies: any[]
  ): {
    [other: string]: any;
    request: string;
  }[];
  recursiveGetDepsRequires(deps: { [s: string]: any }): never[];
  getPackageDependencies(packageName: string, nodeModulesPath: string): string[];
  getAllDependencies(depStrings: string | string[], nodeModulesPath: string): string[];
  /**
   * webpack plugin apply function
   * @param compiler
   */
  apply(compiler: any): void;
}
