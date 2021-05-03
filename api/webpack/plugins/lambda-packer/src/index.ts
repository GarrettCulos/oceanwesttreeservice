import fs from 'fs';
import path from 'path';
import { createAction, mkdirAction, rimrafAction, copyAction } from './actions';
import { uniqueArray } from './utils';
const pluginName = 'LambdaPackerPlugin';

const alphabetizeObject = (obj: any) => {
  return Object.keys(obj)
    .sort()
    .reduce((sortedObject: any, key: string) => {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        sortedObject[key] = alphabetizeObject(obj[key]);
      } else {
        sortedObject[key] = obj[key];
      }
      return sortedObject;
    }, {});
};

export class LambdaPackerPlugin {
  declarationRegex = /(?<=@WebpackLambda\()(.*)(?=\)WebpackLanbda@)/s;
  deploymentFolder: string;
  options: { [optionName: string]: any } = {};
  packageLock: any;

  /**
   * @param {Object} options
   * @param {String} options.output
   * @param {Boolean} options.verbose
   */
  constructor(d: { output?: string; requireTxt?: boolean; verbose?: boolean }) {
    /**
     * define regex's
     */

    /**
     * deployment folder that holds all deployment functions
     */
    if (d.output && typeof d.output !== 'string') {
      throw `[${pluginName}]: options.output must be of type String`;
    }
    this.deploymentFolder = d.output || './.lambdas';

    /**
     * verbose setting must be a boolean if set
     */
    if (d.verbose && typeof d.verbose !== 'boolean') {
      throw `[${pluginName}]: options.output must be a boolean`;
    }
    this.options.verbose = d.verbose || false;

    /**
     * verbose setting must be a boolean if set
     */
    if (d.requireTxt && typeof d.requireTxt !== 'boolean') {
      throw `[${pluginName}]: options.requireTxt must be a boolean`;
    }
    this.options.requireTxt = d.requireTxt || false;

    /**
     * load package-lock deps list
     */
    this.packageLock = JSON.parse(fs.readFileSync(`./package-lock.json`, 'utf8'));
  }

  /**
   * Compute all external dependencies and sub deps
   * @param {Array} dependencies
   * @returns {String[]}
   */
  logDependencies(dependencies: any[]) {
    const deps: { request: string; [other: string]: any }[] = [];
    const trackedDependencies: string[] = [];
    const dependencyQueue = dependencies;
    while (dependencyQueue && Array.isArray(dependencyQueue) && dependencyQueue.length > 0) {
      const dependency = dependencyQueue[0];
      // console.log("buildInfo", dependency && dependency.module && dependency.module.buildInfo, );
      // console.log("module", dependency && dependency.module && dependency.module );

      if (dependency.request) {
        const notPath = dependency.request === path.basename(dependency.request);
        const externalType = dependency.module && dependency.module.externalType;
        const subDependencies = dependency.module && dependency.module.dependencies;
        if (subDependencies) {
          const newDeps = subDependencies.filter(
            (dep: any) => (dep.request && !trackedDependencies.includes(dep.request)) || !dep.request
          );
          deps.push(...newDeps);
        }
        if (notPath) {
          deps.push({ request: dependency.request, type: externalType });
        }
        trackedDependencies.push(dependency.request);
      }
      dependencies.shift();
    }
    return deps;
  }

  recursiveGetDepsRequires(deps: { [s: string]: any }) {
    return Object.keys(deps).reduce((flatDeps, key) => {
      if (typeof deps[key] === 'string') {
        flatDeps.push(key);
      }
      if (deps[key].requires) {
        flatDeps.push(...this.recursiveGetDepsRequires(deps[key].requires));
      }
      if (deps[key].dependencies) {
        flatDeps.push(...this.recursiveGetDepsRequires(deps[key].dependencies));
      }
      return flatDeps;
    }, []);
  }
  getPackageDependencies(packageName: string, nodeModulesPath: string): string[] {
    try {
      const pkg = this.packageLock && this.packageLock.dependencies && this.packageLock.dependencies[packageName];
      if (pkg && pkg.requires) {
        return this.recursiveGetDepsRequires(pkg.requires);
      }
      return [];
    } catch (err) {
      throw err;
    }
  }

  getAllDependencies(depStrings: string | string[], nodeModulesPath: string): string[] {
    const unloadedDeps: string[] = Array.isArray(depStrings) ? depStrings : [depStrings];
    this.options.verbose && console.log(unloadedDeps);
    const loadedDeps: string[] = [];
    while (unloadedDeps.length > 0) {
      const currentDeps = unloadedDeps.shift();
      try {
        const deps = this.getPackageDependencies(currentDeps, nodeModulesPath);
        const newDeps = deps.filter((dep) => !loadedDeps.includes(dep));
        unloadedDeps.push(...newDeps);
        loadedDeps.push(currentDeps);
      } catch (error) {
        console.warn(`WARN: Lambda Webpack Plugin: ${error}`);
        // console.error(error);
      }
    }
    return loadedDeps;
  }

  /**
   * webpack plugin apply function
   * @param compiler
   */
  apply(compiler: any) {
    const plugin = {
      name: pluginName,
    };

    /**
     * globally available data
     */
    const globals: any = {
      entries: {},
      outputPath: compiler.options.output.path,
      deployFolder: path.join(compiler.options.context, this.deploymentFolder),
      alias: compiler.options.resolve.alias,
    };
    /**
     * All entry files will be checked for lambda declaration. If decorator is present, add config, context, path, and filename to globals.entries
     * @param {*} context
     * @param {*} entries
     */
    const registerEntryLambdaFunctions = (context: any, entries: any | string) => {
      // register entries with lambda function parser
      if (typeof entries === 'string') {
        throw `[${pluginName}]: webpack entries option must be an object not String.`;
      }
      globals.entries = Object.keys(entries).reduce((acc, entry) => {
        try {
          return {
            ...acc,
            [entry]: {
              key: entry,
              context,
              path: entries[entry],
              files: [],
              filename: path.basename(entry, path.extname(entry)),
              dependencies: [],
            },
          };
        } catch (err) {
          // Need to push build error to webpack.
          console.error('error parsing entry content');
          return acc;
        }
      }, {});
    };

    /**
     * For each chunk, if its been flagged as having a lambda decorator (is within globals.entries), add files, and dependencies to the entry
     * @param {*} compilation
     * @param {*} callback
     */
    const addConfigDependencies = (compilation: any, callback: any) => {
      compilation.chunks.forEach((chunk: any) => {
        if (globals.entries[chunk.name]) {
          globals.entries[chunk.name].files = chunk.files;
          globals.entries[chunk.name].dependencies = this.logDependencies(chunk.entryModule.dependencies).reduce(
            (acc, key) => {
              if (!acc.find((dep: any) => dep.request === key.request)) {
                acc.push(key);
              }
              return acc;
            },
            []
          );
        }
      });

      callback();
    };

    /**
     * Once webpack is done (so files have been written) create sam application structure
     *  - create folders for each lambda function (deployment folder)
     *  - create sam template from baseTemplate and parsed configs
     * @param {*} compilation
     * @param {*} callback
     */
    const createLambdaDeployments = (compilation: any, callback: any) => {
      console.log('Creating Lambda Package');
      console.time('Create lambda Package Timer');
      const entries = Object.keys(globals.entries).map((key) => globals.entries[key]);
      const commands = [];

      /**
       * create deployment folder
       */
      commands.push(rimrafAction({ source: globals.deployFolder }, this.options));
      commands.push(mkdirAction({ source: globals.deployFolder }, this.options));

      entries.forEach((entry) => {
        /**
         * create deployment folder (half hash and name)
         */
        const entryCodeUriPath = entry.filename;
        const entryPath = path.join(globals.deployFolder, entryCodeUriPath);
        commands.push(mkdirAction({ source: entryPath }, this.options));

        /**
         * move lambda function
         */
        entry.files.forEach((file: any) => {
          // when we can compute the function name, add in standard index.js handler
          // path.join(entryPath, 'index.js')
          commands.push(
            copyAction({ source: path.join(globals.outputPath, file), destination: entryPath }, this.options)
          );
        });

        /**
         * copy alias references that are external into node_modules folder
         */
        commands.push(mkdirAction({ source: path.join(entryPath, 'node_modules') }, this.options));

        /**
         * copy first layer of dependencies into requirements.txt
         */
        if (this.options.requireTxt) {
          const dependenciesFile = entry.dependencies.map((deps: any) => deps.request).join(' \n');
          commands.push(
            createAction(
              {
                source: path.join(entryPath, 'requirements.txt'),
                content: dependenciesFile,
              },
              this.options
            )
          );
        }

        /**
         * copy all dependencies into deployment folder
         */
        if (!this.options.requireTxt) {
          // unloadedDeps,
          // loadeddeps
          const allDependencies: string[] = [];
          const unCheckedModules = [...entry.dependencies];
          const checkedModules: string[] = [];
          while (unCheckedModules.length > 0) {
            // console.log(unCheckedModules);
            const dependency = unCheckedModules[0];
            if (
              dependency.type !== undefined &&
              dependency.type !== null &&
              dependency.type !== 'null' &&
              dependency.type !== 'undefined'
            ) {
              // NOTE: Ideally dependency.module instanceof NormalModule would be used, but im not sure where to import that class
              const isNormalModule =
                dependency.module &&
                dependency.module.buildInfo &&
                dependency.module.buildInfo.hasOwnProperty('fileDependencies');

              if (!isNormalModule) {
                const deps = this.getAllDependencies(dependency.request, path.join(entry.context, 'node_modules'));
                this.options.verbose && console.log(dependency.request, deps);
                allDependencies.push(...deps);
                !checkedModules.includes(dependency.request) && checkedModules.push(dependency.request);
              } else {
                const newModules = [
                  ...dependency.module.dependencies.filter(
                    (deps: any) => deps.module && !checkedModules.includes(deps.request)
                  ),
                ];
                !checkedModules.includes(dependency.request) && checkedModules.push(dependency.request);
                unCheckedModules.push(...newModules);
              }
            }
            unCheckedModules.shift();
          }
          uniqueArray(allDependencies).forEach((dependency: string) => {
            const source = path.join(entry.context, 'node_modules', dependency, '**/*');
            commands.push(
              copyAction({ source, destination: path.join(entryPath, 'node_modules', dependency) }, this.options)
            );
          });
        }
      });

      if (commands.length) {
        const chain = commands.reduce((previous: Promise<any>, fn: Function) => {
          return previous.then((retVal) => fn(retVal)).catch((err) => console.log(err));
        }, Promise.resolve());
        chain
          .then(() => {
            console.timeEnd('Create lambda Package Timer');
            callback();
          })
          .catch((err) => {
            console.timeEnd('Create lambda Package Timer');
            console.error(err);
            callback();
          });
      } else {
        console.timeEnd('Create lambda Package Timer');
        callback();
      }
    };

    compiler.hooks.entryOption.tap(plugin, registerEntryLambdaFunctions);
    compiler.hooks.emit.tapAsync(plugin, addConfigDependencies);
    compiler.hooks.done.tapAsync(plugin, createLambdaDeployments);
  }
}
