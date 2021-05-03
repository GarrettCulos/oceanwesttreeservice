'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.SamWebpackPlugin = void 0;
const fs_1 = require('fs');
const path_1 = require('path');
const actions_1 = require('./actions');
const utils_1 = require('./utils');
const pluginName = 'SamWebpackPlugin';
const alphabetizeObject = (obj) => {
  return Object.keys(obj)
    .sort()
    .reduce((sortedObject, key) => {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        sortedObject[key] = alphabetizeObject(obj[key]);
      } else {
        sortedObject[key] = obj[key];
      }
      return sortedObject;
    }, {});
};
class SamWebpackPlugin {
  /**
   * @param {Object} options
   * @param {String} options.output
   * @param {Boolean} options.verbose
   */
  constructor(d) {
    /**
     * define regex's
     */
    this.declarationRegex = /(?<=@WebpackLambda\()(.*)(?=\)WebpackLanbda@)/s;
    this.options = {};
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
    this.packageLock = JSON.parse(fs_1.default.readFileSync(`./package-lock.json`, 'utf8'));
  }
  /**
   * Parses the content of the lambda decorator
   * @param {String} content
   * @returns {Object}
   */
  parseLambdaDeclaration(content) {
    // TODO handle error when parsing @WebpackLambda decorator;
    const match = content.match(this.declarationRegex);
    if (!match) return;
    return JSON.parse(match[0]);
  }
  /**
   * Compute all external dependencies and sub deps
   * @param {Array} dependencies
   * @returns {String[]}
   */
  logDependencies(dependencies) {
    const deps = [];
    const trackedDependencies = [];
    const dependencyQueue = dependencies;
    while (dependencyQueue && Array.isArray(dependencyQueue) && dependencyQueue.length > 0) {
      const dependency = dependencyQueue[0];
      if (dependency.request) {
        const notPath = dependency.request === path_1.default.basename(dependency.request);
        const externalType = dependency.module && dependency.module.externalType;
        const subDependencies = dependency.module && dependency.module.dependencies;
        if (subDependencies) {
          const newDeps = subDependencies.filter(
            (dep) => (dep.request && !trackedDependencies.includes(dep.request)) || !dep.request
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
  recursiveGetDepsRequires(deps) {
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
  getPackageDependencies(packageName, nodeModulesPath) {
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
  getAllDependencies(depStrings, nodeModulesPath) {
    const unloadedDeps = Array.isArray(depStrings) ? depStrings : [depStrings];
    this.options.verbose && console.log(unloadedDeps);
    const loadedDeps = [];
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
  apply(compiler) {
    const plugin = {
      name: pluginName,
    };
    /**
     * globally available data
     */
    const globals = {
      entries: {},
      outputPath: compiler.options.output.path,
      deployFolder: path_1.default.join(compiler.options.context, this.deploymentFolder),
      alias: compiler.options.resolve.alias,
    };
    /**
     * All entry files will be checked for lambda declaration. If decorator is present, add config, context, path, and filename to globals.entries
     * @param {*} context
     * @param {*} entries
     */
    const registerEntryLambdaFunctions = (context, entries) => {
      // register entries with lambda function parser
      if (typeof entries === 'string') {
        throw `[${pluginName}]: webpack entries option must be an object not String.`;
      }
      globals.entries = Object.keys(entries).reduce((acc, entry) => {
        try {
          const content = fs_1.default.readFileSync(entries[entry], 'utf8');
          const config = this.parseLambdaDeclaration(content);
          if (config) {
            return {
              ...acc,
              [entry]: {
                key: entry,
                context,
                path: entries[entry],
                files: [],
                filename: path_1.default.basename(entry, path_1.default.extname(entry)),
                config,
                dependencies: [],
              },
            };
          }
          return acc;
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
    const addConfigDependencies = (compilation, callback) => {
      compilation.chunks.forEach((chunk) => {
        if (globals.entries[chunk.name]) {
          globals.entries[chunk.name].files = chunk.files;
          globals.entries[chunk.name].dependencies = this.logDependencies(chunk.entryModule.dependencies).reduce(
            (acc, key) => {
              if (!acc.find((dep) => dep.request === key.request)) {
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
    const createLambdaDeployments = (compilation, callback) => {
      console.log('Creating Lambda Package');
      console.time('Create lambda Package Timer');
      const entries = Object.keys(globals.entries).map((key) => globals.entries[key]);
      const commands = [];
      /**
       * create deployment folder
       */
      commands.push(actions_1.rimrafAction({ source: globals.deployFolder }, this.options));
      commands.push(actions_1.mkdirAction({ source: globals.deployFolder }, this.options));
      entries.forEach((entry) => {
        /**
         * create deployment folder (half hash and name)
         */
        const entryCodeUriPath = entry.filename;
        const entryPath = path_1.default.join(globals.deployFolder, entryCodeUriPath);
        commands.push(actions_1.mkdirAction({ source: entryPath }, this.options));
        /**
         * move lambda function
         */
        entry.files.forEach((file) => {
          // when we can compute the function name, add in standard index.js handler
          // path.join(entryPath, 'index.js')
          commands.push(
            actions_1.copyAction(
              { source: path_1.default.join(globals.outputPath, file), destination: entryPath },
              this.options
            )
          );
        });
        /**
         * copy alias references that are external into node_modules folder
         */
        commands.push(actions_1.mkdirAction({ source: path_1.default.join(entryPath, 'node_modules') }, this.options));
        /**
         * copy first layer of dependencies into requirements.txt
         */
        if (this.options.requireTxt) {
          const dependenciesFile = entry.dependencies.map((deps) => deps.request).join(' \n');
          commands.push(
            actions_1.createAction(
              {
                source: path_1.default.join(entryPath, 'requirements.txt'),
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
          const allDependencies = [];
          const unCheckedModules = [...entry.dependencies];
          const checkedModules = [];
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
                const deps = this.getAllDependencies(
                  dependency.request,
                  path_1.default.join(entry.context, 'node_modules')
                );
                this.options.verbose && console.log(dependency.request, deps);
                allDependencies.push(...deps);
                !checkedModules.includes(dependency.request) && checkedModules.push(dependency.request);
              } else {
                const newModules = [
                  ...dependency.module.dependencies.filter(
                    (deps) => deps.module && !checkedModules.includes(deps.request)
                  ),
                ];
                !checkedModules.includes(dependency.request) && checkedModules.push(dependency.request);
                unCheckedModules.push(...newModules);
              }
            }
            unCheckedModules.shift();
          }
          utils_1.uniqueArray(allDependencies).forEach((dependency) => {
            const source = path_1.default.join(entry.context, 'node_modules', dependency, '**/*');
            commands.push(
              actions_1.copyAction(
                { source, destination: path_1.default.join(entryPath, 'node_modules', dependency) },
                this.options
              )
            );
          });
        }
      });
      if (commands.length) {
        const chain = commands.reduce((previous, fn) => {
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
exports.SamWebpackPlugin = SamWebpackPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFBb0I7QUFDcEIsK0JBQXdCO0FBQ3hCLHVDQUFnRjtBQUNoRixtQ0FBc0M7QUFDdEMsTUFBTSxVQUFVLEdBQUcsa0JBQWtCLENBQUM7QUFFdEMsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLEdBQVEsRUFBRSxFQUFFO0lBQ3JDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7U0FDcEIsSUFBSSxFQUFFO1NBQ04sTUFBTSxDQUFDLENBQUMsWUFBaUIsRUFBRSxHQUFXLEVBQUUsRUFBRTtRQUN6QyxJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDNUQsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2pEO2FBQU07WUFDTCxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzlCO1FBQ0QsT0FBTyxZQUFZLENBQUM7SUFDdEIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ1gsQ0FBQyxDQUFDO0FBRUYsTUFBYSxnQkFBZ0I7SUFNM0I7Ozs7T0FJRztJQUNILFlBQVksQ0FJWDtRQUNDOztXQUVHO1FBakJMLHFCQUFnQixHQUFHLGdEQUFnRCxDQUFDO1FBRXBFLFlBQU8sR0FBa0MsRUFBRSxDQUFDO1FBaUIxQzs7V0FFRztRQUNILElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFO1lBQzVDLE1BQU0sSUFBSSxVQUFVLDBDQUEwQyxDQUFDO1NBQ2hFO1FBQ0QsSUFBSSxDQUFDLGdCQUFnQixHQUFH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LEdBQUcsRUFBRTtvQkFDVCxPQUFPLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUM7b0JBQy9DLFFBQVEsRUFBRSxDQUFDO2dCQUNiLENBQUMsQ0FBQztxQkFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ1gsT0FBTyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO29CQUMvQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNuQixRQUFRLEVBQUUsQ0FBQztnQkFDYixDQUFDLENBQUMsQ0FBQzthQUNOO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQztnQkFDL0MsUUFBUSxFQUFFLENBQUM7YUFDWjtRQUNILENBQUMsQ0FBQztRQUVGLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztRQUNyRSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDNUQsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7Q0FDRjtBQWpXRCw0Q0FpV0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgY3JlYXRlQWN0aW9uLCBta2RpckFjdGlvbiwgcmltcmFmQWN0aW9uLCBjb3B5QWN0aW9uIH0gZnJvbSAnLi9hY3Rpb25zJztcclxuaW1wb3J0IHsgdW5pcXVlQXJyYXkgfSBmcm9tICcuL3V0aWxzJztcclxuY29uc3QgcGx1Z2luTmFtZSA9ICdTYW1XZWJwYWNrUGx1Z2luJztcclxuXHJcbmNvbnN0IGFscGhhYmV0aXplT2JqZWN0ID0gKG9iajogYW55KSA9PiB7XHJcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG9iailcclxuICAgIC5zb3J0KClcclxuICAgIC5yZWR1Y2UoKHNvcnRlZE9iamVjdDogYW55LCBrZXk6IHN0cmluZykgPT4ge1xyXG4gICAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShvYmpba2V5XSkpIHtcclxuICAgICAgICBzb3J0ZWRPYmplY3Rba2V5XSA9IGFscGhhYmV0aXplT2JqZWN0KG9ialtrZXldKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzb3J0ZWRPYmplY3Rba2V5XSA9IG9ialtrZXldO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzb3J0ZWRPYmplY3Q7XHJcbiAgICB9LCB7fSk7XHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgU2FtV2VicGFja1BsdWdpbiB7XHJcbiAgZGVjbGFyYXRpb25SZWdleCA9IC8oPzw9QFdlYnBhY2tMYW1iZGFcXCgpKC4qKSg/PVxcKVdlYnBhY2tMYW5iZGFAKS9zO1xyXG4gIGRlcGxveW1lbnRGb2xkZXI6IHN0cmluZztcclxuICBvcHRpb25zOiB7IFtvcHRpb25OYW1lOiBzdHJpbmddOiBhbnkgfSA9IHt9O1xyXG4gIHBhY2thZ2VMb2NrOiBhbnk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMub3V0cHV0XHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLnZlcmJvc2VcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcihkOiB7XHJcbiAgICBvdXRwdXQ/OiBzdHJpbmc7XHJcbiAgICByZXF1aXJlVHh0PzogYm9vbGVhbjtcclxuICAgIHZlcmJvc2U/OiBib29sZWFuO1xyXG4gIH0pIHtcclxuICAgIC8qKlxyXG4gICAgICogZGVmaW5lIHJlZ2V4J3NcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGVwbG95bWVudCBmb2xkZXIgdGhhdCBob2xkcyBhbGwgZGVwbG95bWVudCBmdW5jdGlvbnNcclxuICAgICAqL1xyXG4gICAgaWYgKGQub3V0cHV0ICYmIHR5cGVvZiBkLm91dHB1dCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgdGhyb3cgYFske3BsdWdpbk5hbWV9XTogb3B0aW9ucy5vdXRwdXQgbXVzdCBiZSBvZiB0eXBlIFN0cmluZ2A7XHJcbiAgICB9XHJcbiAgICB0aGlzLmRlcGxveW1lbnRGb2xkZXIgPSBkLm91dHB1dCB8fCAnLi8ubGFtYmRhcyc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB2ZXJib3NlIHNldHRpbmcgbXVzdCBiZSBhIGJvb2xlYW4gaWYgc2V0XHJcbiAgICAgKi9cclxuICAgIGlmIChkLnZlcmJvc2UgJiYgdHlwZW9mIGQudmVyYm9zZSAhPT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgIHRocm93IGBbJHtwbHVnaW5OYW1lfV06IG9wdGlvbnMub3V0cHV0IG11c3QgYmUgYSBib29sZWFuYDtcclxuICAgIH1cclxuICAgIHRoaXMub3B0aW9ucy52ZXJib3NlID0gZC52ZXJib3NlIHx8IGZhbHNlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogdmVyYm9zZSBzZXR0aW5nIG11c3QgYmUgYSBib29sZWFuIGlmIHNldFxyXG4gICAgICovXHJcbiAgICBpZiAoZC5yZXF1aXJlVHh0ICYmIHR5cGVvZiBkLnJlcXVpcmVUeHQgIT09ICdib29sZWFuJykge1xyXG4gICAgICB0aHJvdyBgWyR7cGx1Z2luTmFtZX1dOiBvcHRpb25zLnJlcXVpcmVUeHQgbXVzdCBiZSBhIGJvb2xlYW5gO1xyXG4gICAgfVxyXG4gICAgdGhpcy5vcHRpb25zLnJlcXVpcmVUeHQgPSBkLnJlcXVpcmVUeHQgfHwgZmFsc2U7XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbG9hZCBwYWNrYWdlLWxvY2sgZGVwcyBsaXN0XHJcbiAgICAgKi9cclxuICAgIHRoaXMucGFja2FnZUxvY2sgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhgLi9wYWNrYWdlLWxvY2suanNvbmAsICd1dGY4JykpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGFyc2VzIHRoZSBjb250ZW50IG9mIHRoZSBsYW1iZGEgZGVjb3JhdG9yXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlbnRcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqL1xyXG4gIHBhcnNlTGFtYmRhRGVjbGFyYXRpb24oY29udGVudDogc3RyaW5nKTogb2JqZWN0IHtcclxuICAgIC8vIFRPRE8gaGFuZGxlIGVycm9yIHdoZW4gcGFyc2luZyBAV2VicGFja0xhbWJkYSBkZWNvcmF0b3I7XHJcbiAgICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2godGhpcy5kZWNsYXJhdGlvblJlZ2V4KTtcclxuICAgIGlmICghbWF0Y2gpIHJldHVybjtcclxuICAgIHJldHVybiBKU09OLnBhcnNlKG1hdGNoWzBdKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXB1dGUgYWxsIGV4dGVybmFsIGRlcGVuZGVuY2llcyBhbmQgc3ViIGRlcHNcclxuICAgKiBAcGFyYW0ge0FycmF5fSBkZXBlbmRlbmNpZXNcclxuICAgKiBAcmV0dXJucyB7U3RyaW5nW119XHJcbiAgICovXHJcbiAgbG9nRGVwZW5kZW5jaWVzKGRlcGVuZGVuY2llczogYW55W10pIHtcclxuICAgIGNvbnN0IGRlcHM6IHsgcmVxdWVzdDogc3RyaW5nOyBbb3RoZXI6IHN0cmluZ106IGFueSB9W10gPSBbXTtcclxuICAgIGNvbnN0IHRyYWNrZWREZXBlbmRlbmNpZXM6IHN0cmluZ1tdID0gW107XHJcbiAgICBjb25zdCBkZXBlbmRlbmN5UXVldWUgPSBkZXBlbmRlbmNpZXM7XHJcbiAgICB3aGlsZSAoZGVwZW5kZW5jeVF1ZXVlICYmIEFycmF5LmlzQXJyYXkoZGVwZW5kZW5jeVF1ZXVlKSAmJiBkZXBlbmRlbmN5UXVldWUubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBkZXBlbmRlbmN5ID0gZGVwZW5kZW5jeVF1ZXVlWzBdO1xyXG4gICAgICBpZiAoZGVwZW5kZW5jeS5yZXF1ZXN0KSB7XHJcbiAgICAgICAgY29uc3Qgbm90UGF0aCA9IGRlcGVuZGVuY3kucmVxdWVzdCA9PT0gcGF0aC5iYXNlbmFtZShkZXBlbmRlbmN5LnJlcXVlc3QpO1xyXG4gICAgICAgIGNvbnN0IGV4dGVybmFsVHlwZSA9IGRlcGVuZGVuY3kubW9kdWxlICYmIGRlcGVuZGVuY3kubW9kdWxlLmV4dGVybmFsVHlwZTtcclxuICAgICAgICBjb25zdCBzdWJEZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmN5Lm1vZHVsZSAmJiBkZXBlbmRlbmN5Lm1vZHVsZS5kZXBlbmRlbmNpZXM7XHJcbiAgICAgICAgaWYgKHN1YkRlcGVuZGVuY2llcykge1xyXG4gICAgICAgICAgY29uc3QgbmV3RGVwcyA9IHN1YkRlcGVuZGVuY2llcy5maWx0ZXIoXHJcbiAgICAgICAgICAgIChkZXA6IGFueSkgPT4gKGRlcC5yZXF1ZXN0ICYmICF0cmFja2VkRGVwZW5kZW5jaWVzLmluY2x1ZGVzKGRlcC5yZXF1ZXN0KSkgfHwgIWRlcC5yZXF1ZXN0XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgZGVwcy5wdXNoKC4uLm5ld0RlcHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm90UGF0aCkge1xyXG4gICAgICAgICAgZGVwcy5wdXNoKHsgcmVxdWVzdDogZGVwZW5kZW5jeS5yZXF1ZXN0LCB0eXBlOiBleHRlcm5hbFR5cGUgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyYWNrZWREZXBlbmRlbmNpZXMucHVzaChkZXBlbmRlbmN5LnJlcXVlc3QpO1xyXG4gICAgICB9XHJcbiAgICAgIGRlcGVuZGVuY2llcy5zaGlmdCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRlcHM7XHJcbiAgfVxyXG5cclxuICByZWN1cnNpdmVHZXREZXBzUmVxdWlyZXMoZGVwczogeyBbczogc3RyaW5nXTogYW55IH0pIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyhkZXBzKS5yZWR1Y2UoKGZsYXREZXBzLCBrZXkpID0+IHtcclxuICAgICAgaWYgKHR5cGVvZiBkZXBzW2tleV0gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgZmxhdERlcHMucHVzaChrZXkpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChkZXBzW2tleV0ucmVxdWlyZXMpIHtcclxuICAgICAgICBmbGF0RGVwcy5wdXNoKC4uLnRoaXMucmVjdXJzaXZlR2V0RGVwc1JlcXVpcmVzKGRlcHNba2V5XS5yZXF1aXJlcykpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChkZXBzW2tleV0uZGVwZW5kZW5jaWVzKSB7XHJcbiAgICAgICAgZmxhdERlcHMucHVzaCguLi50aGlzLnJlY3Vyc2l2ZUdldERlcHNSZXF1aXJlcyhkZXBzW2tleV0uZGVwZW5kZW5jaWVzKSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZsYXREZXBzO1xyXG4gICAgfSwgW10pO1xyXG4gIH1cclxuICBnZXRQYWNrYWdlRGVwZW5kZW5jaWVzKHBhY2thZ2VOYW1lOiBzdHJpbmcsIG5vZGVNb2R1bGVzUGF0aDogc3RyaW5nKTogc3RyaW5nW10ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcGtnID0gdGhpcy5wYWNrYWdlTG9jayAmJiB0aGlzLnBhY2thZ2VMb2NrLmRlcGVuZGVuY2llcyAmJiB0aGlzLnBhY2thZ2VMb2NrLmRlcGVuZGVuY2llc1twYWNrYWdlTmFtZV07XHJcbiAgICAgIGlmIChwa2cgJiYgcGtnLnJlcXVpcmVzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVjdXJzaXZlR2V0RGVwc1JlcXVpcmVzKHBrZy5yZXF1aXJlcyk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIHRocm93IGVycjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldEFsbERlcGVuZGVuY2llcyhkZXBTdHJpbmdzOiBzdHJpbmcgfCBzdHJpbmdbXSwgbm9kZU1vZHVsZXNQYXRoOiBzdHJpbmcpOiBzdHJpbmdbXSB7XHJcbiAgICBjb25zdCB1bmxvYWRlZERlcHM6IHN0cmluZ1tdID0gQXJyYXkuaXNBcnJheShkZXBTdHJpbmdzKSA/IGRlcFN0cmluZ3MgOiBbZGVwU3RyaW5nc107XHJcbiAgICB0aGlzLm9wdGlvbnMudmVyYm9zZSAmJiBjb25zb2xlLmxvZyh1bmxvYWRlZERlcHMpO1xyXG4gICAgY29uc3QgbG9hZGVkRGVwczogc3RyaW5nW10gPSBbXTtcclxuICAgIHdoaWxlICh1bmxvYWRlZERlcHMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBjdXJyZW50RGVwcyA9IHVubG9hZGVkRGVwcy5zaGlmdCgpO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGRlcHMgPSB0aGlzLmdldFBhY2thZ2VEZXBlbmRlbmNpZXMoY3VycmVudERlcHMsIG5vZGVNb2R1bGVzUGF0aCk7XHJcbiAgICAgICAgY29uc3QgbmV3RGVwcyA9IGRlcHMuZmlsdGVyKGRlcCA9PiAhbG9hZGVkRGVwcy5pbmNsdWRlcyhkZXApKTtcclxuICAgICAgICB1bmxvYWRlZERlcHMucHVzaCguLi5uZXdEZXBzKTtcclxuICAgICAgICBsb2FkZWREZXBzLnB1c2goY3VycmVudERlcHMpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgV0FSTjogTGFtYmRhIFdlYnBhY2sgUGx1Z2luOiAke2Vycm9yfWApO1xyXG4gICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbG9hZGVkRGVwcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHdlYnBhY2sgcGx1Z2luIGFwcGx5IGZ1bmN0aW9uXHJcbiAgICogQHBhcmFtIGNvbXBpbGVyXHJcbiAgICovXHJcbiAgYXBwbHkoY29tcGlsZXI6IGFueSkge1xyXG4gICAgY29uc3QgcGx1Z2luID0ge1xyXG4gICAgICBuYW1lOiBwbHVnaW5OYW1lXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2xvYmFsbHkgYXZhaWxhYmxlIGRhdGFcclxuICAgICAqL1xyXG4gICAgY29uc3QgZ2xvYmFsczogYW55ID0ge1xyXG4gICAgICBlbnRyaWVzOiB7fSxcclxuICAgICAgb3V0cHV0UGF0aDogY29tcGlsZXIub3B0aW9ucy5vdXRwdXQucGF0aCxcclxuICAgICAgZGVwbG95Rm9sZGVyOiBwYXRoLmpvaW4oY29tcGlsZXIub3B0aW9ucy5jb250ZXh0LCB0aGlzLmRlcGxveW1lbnRGb2xkZXIpLFxyXG4gICAgICBhbGlhczogY29tcGlsZXIub3B0aW9ucy5yZXNvbHZlLmFsaWFzXHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBbGwgZW50cnkgZmlsZXMgd2lsbCBiZSBjaGVja2VkIGZvciBsYW1iZGEgZGVjbGFyYXRpb24uIElmIGRlY29yYXRvciBpcyBwcmVzZW50LCBhZGQgY29uZmlnLCBjb250ZXh0LCBwYXRoLCBhbmQgZmlsZW5hbWUgdG8gZ2xvYmFscy5lbnRyaWVzXHJcbiAgICAgKiBAcGFyYW0geyp9IGNvbnRleHRcclxuICAgICAqIEBwYXJhbSB7Kn0gZW50cmllc1xyXG4gICAgICovXHJcbiAgICBjb25zdCByZWdpc3RlckVudHJ5TGFtYmRhRnVuY3Rpb25zID0gKGNvbnRleHQ6IGFueSwgZW50cmllczogYW55IHwgc3RyaW5nKSA9PiB7XHJcbiAgICAgIC8vIHJlZ2lzdGVyIGVudHJpZXMgd2l0aCBsYW1iZGEgZnVuY3Rpb24gcGFyc2VyXHJcbiAgICAgIGlmICh0eXBlb2YgZW50cmllcyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICB0aHJvdyBgWyR7cGx1Z2luTmFtZX1dOiB3ZWJwYWNrIGVudHJpZXMgb3B0aW9uIG11c3QgYmUgYW4gb2JqZWN0IG5vdCBTdHJpbmcuYDtcclxuICAgICAgfVxyXG4gICAgICBnbG9iYWxzLmVudHJpZXMgPSBPYmplY3Qua2V5cyhlbnRyaWVzKS5yZWR1Y2UoKGFjYywgZW50cnkpID0+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhlbnRyaWVzW2VudHJ5XSwgJ3V0ZjgnKTtcclxuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucGFyc2VMYW1iZGFEZWNsYXJhdGlvbihjb250ZW50KTtcclxuICAgICAgICAgIGlmIChjb25maWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAuLi5hY2MsXHJcbiAgICAgICAgICAgICAgW2VudHJ5XToge1xyXG4gICAgICAgICAgICAgICAga2V5OiBlbnRyeSxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBlbnRyaWVzW2VudHJ5XSxcclxuICAgICAgICAgICAgICAgIGZpbGVzOiBbXSxcclxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKGVudHJ5LCBwYXRoLmV4dG5hbWUoZW50cnkpKSxcclxuICAgICAgICAgICAgICAgIGNvbmZpZyxcclxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY2llczogW11cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gYWNjO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgLy8gTmVlZCB0byBwdXNoIGJ1aWxkIGVycm9yIHRvIHdlYnBhY2suXHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdlcnJvciBwYXJzaW5nIGVudHJ5IGNvbnRlbnQnKTtcclxuICAgICAgICAgIHJldHVybiBhY2M7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCB7fSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRm9yIGVhY2ggY2h1bmssIGlmIGl0cyBiZWVuIGZsYWdnZWQgYXMgaGF2aW5nIGEgbGFtYmRhIGRlY29yYXRvciAoaXMgd2l0aGluIGdsb2JhbHMuZW50cmllcyksIGFkZCBmaWxlcywgYW5kIGRlcGVuZGVuY2llcyB0byB0aGUgZW50cnlcclxuICAgICAqIEBwYXJhbSB7Kn0gY29tcGlsYXRpb25cclxuICAgICAqIEBwYXJhbSB7Kn0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgY29uc3QgYWRkQ29uZmlnRGVwZW5kZW5jaWVzID0gKGNvbXBpbGF0aW9uOiBhbnksIGNhbGxiYWNrOiBhbnkpID0+IHtcclxuICAgICAgY29tcGlsYXRpb24uY2h1bmtzLmZvckVhY2goKGNodW5rOiBhbnkpID0+IHtcclxuICAgICAgICBpZiAoZ2xvYmFscy5lbnRyaWVzW2NodW5rLm5hbWVdKSB7XHJcbiAgICAgICAgICBnbG9iYWxzLmVudHJpZXNbY2h1bmsubmFtZV0uZmlsZXMgPSBjaHVuay5maWxlcztcclxuICAgICAgICAgIGdsb2JhbHMuZW50cmllc1tjaHVuay5uYW1lXS5kZXBlbmRlbmNpZXMgPSB0aGlzLmxvZ0RlcGVuZGVuY2llcyhjaHVuay5lbnRyeU1vZHVsZS5kZXBlbmRlbmNpZXMpLnJlZHVjZShcclxuICAgICAgICAgICAgKGFjYywga2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYgKCFhY2MuZmluZCgoZGVwOiBhbnkpID0+IGRlcC5yZXF1ZXN0ID09PSBrZXkucmVxdWVzdCkpIHtcclxuICAgICAgICAgICAgICAgIGFjYy5wdXNoKGtleSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJldHVybiBhY2M7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtdXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE9uY2Ugd2VicGFjayBpcyBkb25lIChzbyBmaWxlcyBoYXZlIGJlZW4gd3JpdHRlbikgY3JlYXRlIHNhbSBhcHBsaWNhdGlvbiBzdHJ1Y3R1cmVcclxuICAgICAqICAtIGNyZWF0ZSBmb2xkZXJzIGZvciBlYWNoIGxhbWJkYSBmdW5jdGlvbiAoZGVwbG95bWVudCBmb2xkZXIpXHJcbiAgICAgKiAgLSBjcmVhdGUgc2FtIHRlbXBsYXRlIGZyb20gYmFzZVRlbXBsYXRlIGFuZCBwYXJzZWQgY29uZmlnc1xyXG4gICAgICogQHBhcmFtIHsqfSBjb21waWxhdGlvblxyXG4gICAgICogQHBhcmFtIHsqfSBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICBjb25zdCBjcmVhdGVMYW1iZGFEZXBsb3ltZW50cyA9IChjb21waWxhdGlvbjogYW55LCBjYWxsYmFjazogYW55KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyBMYW1iZGEgUGFja2FnZScpO1xyXG4gICAgICBjb25zb2xlLnRpbWUoJ0NyZWF0ZSBsYW1iZGEgUGFja2FnZSBUaW1lcicpO1xyXG4gICAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmtleXMoZ2xvYmFscy5lbnRyaWVzKS5tYXAoa2V5ID0+IGdsb2JhbHMuZW50cmllc1trZXldKTtcclxuICAgICAgY29uc3QgY29tbWFuZHMgPSBbXTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBjcmVhdGUgZGVwbG95bWVudCBmb2xkZXJcclxuICAgICAgICovXHJcbiAgICAgIGNvbW1hbmRzLnB1c2gocmltcmFmQWN0aW9uKHsgc291cmNlOiBnbG9iYWxzLmRlcGxveUZvbGRlciB9LCB0aGlzLm9wdGlvbnMpKTtcclxuICAgICAgY29tbWFuZHMucHVzaChta2RpckFjdGlvbih7IHNvdXJjZTogZ2xvYmFscy5kZXBsb3lGb2xkZXIgfSwgdGhpcy5vcHRpb25zKSk7XHJcblxyXG4gICAgICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGNyZWF0ZSBkZXBsb3ltZW50IGZvbGRlciAoaGFsZiBoYXNoIGFuZCBuYW1lKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IGVudHJ5Q29kZVVyaVBhdGggPSBlbnRyeS5maWxlbmFtZTtcclxuICAgICAgICBjb25zdCBlbnRyeVBhdGggPSBwYXRoLmpvaW4oZ2xvYmFscy5kZXBsb3lGb2xkZXIsIGVudHJ5Q29kZVVyaVBhdGgpO1xyXG4gICAgICAgIGNvbW1hbmRzLnB1c2gobWtkaXJBY3Rpb24oeyBzb3VyY2U6IGVudHJ5UGF0aCB9LCB0aGlzLm9wdGlvbnMpKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogbW92ZSBsYW1iZGEgZnVuY3Rpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICBlbnRyeS5maWxlcy5mb3JFYWNoKChmaWxlOiBhbnkpID0+IHtcclxuICAgICAgICAgIC8vIHdoZW4gd2UgY2FuIGNvbXB1dGUgdGhlIGZ1bmN0aW9uIG5hbWUsIGFkZCBpbiBzdGFuZGFyZCBpbmRleC5qcyBoYW5kbGVyXHJcbiAgICAgICAgICAvLyBwYXRoLmpvaW4oZW50cnlQYXRoLCAnaW5kZXguanMnKVxyXG4gICAgICAgICAgY29tbWFuZHMucHVzaChcclxuICAgICAgICAgICAgY29weUFjdGlvbih7IHNvdXJjZTogcGF0aC5qb2luKGdsb2JhbHMub3V0cHV0UGF0aCwgZmlsZSksIGRlc3RpbmF0aW9uOiBlbnRyeVBhdGggfSwgdGhpcy5vcHRpb25zKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY29weSBhbGlhcyByZWZlcmVuY2VzIHRoYXQgYXJlIGV4dGVybmFsIGludG8gbm9kZV9tb2R1bGVzIGZvbGRlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbW1hbmRzLnB1c2gobWtkaXJBY3Rpb24oeyBzb3VyY2U6IHBhdGguam9pbihlbnRyeVBhdGgsICdub2RlX21vZHVsZXMnKSB9LCB0aGlzLm9wdGlvbnMpKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY29weSBmaXJzdCBsYXllciBvZiBkZXBlbmRlbmNpZXMgaW50byByZXF1aXJlbWVudHMudHh0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXF1aXJlVHh0KSB7XHJcbiAgICAgICAgICBjb25zdCBkZXBlbmRlbmNpZXNGaWxlID0gZW50cnkuZGVwZW5kZW5jaWVzLm1hcCgoZGVwczogYW55KSA9PiBkZXBzLnJlcXVlc3QpLmpvaW4oJyBcXG4nKTtcclxuICAgICAgICAgIGNvbW1hbmRzLnB1c2goXHJcbiAgICAgICAgICAgIGNyZWF0ZUFjdGlvbihcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHBhdGguam9pbihlbnRyeVBhdGgsICdyZXF1aXJlbWVudHMudHh0JyksXHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiBkZXBlbmRlbmNpZXNGaWxlXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGNvcHkgYWxsIGRlcGVuZGVuY2llcyBpbnRvIGRlcGxveW1lbnQgZm9sZGVyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucmVxdWlyZVR4dCkge1xyXG4gICAgICAgICAgLy8gdW5sb2FkZWREZXBzLFxyXG4gICAgICAgICAgLy8gbG9hZGVkZGVwc1xyXG4gICAgICAgICAgY29uc3QgYWxsRGVwZW5kZW5jaWVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgY29uc3QgdW5DaGVja2VkTW9kdWxlcyA9IFsuLi5lbnRyeS5kZXBlbmRlbmNpZXNdO1xyXG4gICAgICAgICAgY29uc3QgY2hlY2tlZE1vZHVsZXM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgICB3aGlsZSAodW5DaGVja2VkTW9kdWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHVuQ2hlY2tlZE1vZHVsZXMpO1xyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRlbmN5ID0gdW5DaGVja2VkTW9kdWxlc1swXTtcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgIGRlcGVuZGVuY3kudHlwZSAhPT0gdW5kZWZpbmVkICYmXHJcbiAgICAgICAgICAgICAgZGVwZW5kZW5jeS50eXBlICE9PSBudWxsICYmXHJcbiAgICAgICAgICAgICAgZGVwZW5kZW5jeS50eXBlICE9PSAnbnVsbCcgJiZcclxuICAgICAgICAgICAgICBkZXBlbmRlbmN5LnR5cGUgIT09ICd1bmRlZmluZWQnXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgIC8vIE5PVEU6IElkZWFsbHkgZGVwZW5kZW5jeS5tb2R1bGUgaW5zdGFuY2VvZiBOb3JtYWxNb2R1bGUgd291bGQgYmUgdXNlZCwgYnV0IGltIG5vdCBzdXJlIHdoZXJlIHRvIGltcG9ydCB0aGF0IGNsYXNzXHJcbiAgICAgICAgICAgICAgY29uc3QgaXNOb3JtYWxNb2R1bGUgPVxyXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeS5tb2R1bGUgJiZcclxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY3kubW9kdWxlLmJ1aWxkSW5mbyAmJlxyXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeS5tb2R1bGUuYnVpbGRJbmZvLmhhc093blByb3BlcnR5KCdmaWxlRGVwZW5kZW5jaWVzJyk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICghaXNOb3JtYWxNb2R1bGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRlcHMgPSB0aGlzLmdldEFsbERlcGVuZGVuY2llcyhkZXBlbmRlbmN5LnJlcXVlc3QsIHBhdGguam9pbihlbnRyeS5jb250ZXh0LCAnbm9kZV9tb2R1bGVzJykpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnZlcmJvc2UgJiYgY29uc29sZS5sb2coZGVwZW5kZW5jeS5yZXF1ZXN0LCBkZXBzKTtcclxuICAgICAgICAgICAgICAgIGFsbERlcGVuZGVuY2llcy5wdXNoKC4uLmRlcHMpO1xyXG4gICAgICAgICAgICAgICAgIWNoZWNrZWRNb2R1bGVzLmluY2x1ZGVzKGRlcGVuZGVuY3kucmVxdWVzdCkgJiYgY2hlY2tlZE1vZHVsZXMucHVzaChkZXBlbmRlbmN5LnJlcXVlc3QpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdNb2R1bGVzID0gW1xyXG4gICAgICAgICAgICAgICAgICAuLi5kZXBlbmRlbmN5Lm1vZHVsZS5kZXBlbmRlbmNpZXMuZmlsdGVyKFxyXG4gICAgICAgICAgICAgICAgICAgIChkZXBzOiBhbnkpID0+IGRlcHMubW9kdWxlICYmICFjaGVja2VkTW9kdWxlcy5pbmNsdWRlcyhkZXBzLnJlcXVlc3QpXHJcbiAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAhY2hlY2tlZE1vZHVsZXMuaW5jbHVkZXMoZGVwZW5kZW5jeS5yZXF1ZXN0KSAmJiBjaGVja2VkTW9kdWxlcy5wdXNoKGRlcGVuZGVuY3kucmVxdWVzdCk7XHJcbiAgICAgICAgICAgICAgICB1bkNoZWNrZWRNb2R1bGVzLnB1c2goLi4ubmV3TW9kdWxlcyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHVuQ2hlY2tlZE1vZHVsZXMuc2hpZnQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHVuaXF1ZUFycmF5KGFsbERlcGVuZGVuY2llcykuZm9yRWFjaCgoZGVwZW5kZW5jeTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IHBhdGguam9pbihlbnRyeS5jb250ZXh0LCAnbm9kZV9tb2R1bGVzJywgZGVwZW5kZW5jeSwgJyoqLyonKTtcclxuICAgICAgICAgICAgY29tbWFuZHMucHVzaChcclxuICAgICAgICAgICAgICBjb3B5QWN0aW9uKHsgc291cmNlLCBkZXN0aW5hdGlvbjogcGF0aC5qb2luKGVudHJ5UGF0aCwgJ25vZGVfbW9kdWxlcycsIGRlcGVuZGVuY3kpIH0sIHRoaXMub3B0aW9ucylcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgXHJcbiAgICAgIGlmIChjb21tYW5kcy5sZW5ndGgpIHtcclxuICAgICAgICBjb25zdCBjaGFpbiA9IGNvbW1hbmRzLnJlZHVjZSgocHJldmlvdXM6IFByb21pc2U8YW55PiwgZm46IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gcHJldmlvdXMudGhlbihyZXRWYWwgPT4gZm4ocmV0VmFsKSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xyXG4gICAgICAgIH0sIFByb21pc2UucmVzb2x2ZSgpKTtcclxuICAgICAgICBjaGFpblxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ0NyZWF0ZSBsYW1iZGEgUGFja2FnZSBUaW1lcicpO1xyXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ0NyZWF0ZSBsYW1iZGEgUGFja2FnZSBUaW1lcicpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ0NyZWF0ZSBsYW1iZGEgUGFja2FnZSBUaW1lcicpO1xyXG4gICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgY29tcGlsZXIuaG9va3MuZW50cnlPcHRpb24udGFwKHBsdWdpbiwgcmVnaXN0ZXJFbnRyeUxhbWJkYUZ1bmN0aW9ucyk7XHJcbiAgICBjb21waWxlci5ob29rcy5lbWl0LnRhcEFzeW5jKHBsdWdpbiwgYWRkQ29uZmlnRGVwZW5kZW5jaWVzKTtcclxuICAgIGNvbXBpbGVyLmhvb2tzLmRvbmUudGFwQXN5bmMocGx1Z2luLCBjcmVhdGVMYW1iZGFEZXBsb3ltZW50cyk7XHJcbiAgfVxyXG59XHJcbiJdfQ==
