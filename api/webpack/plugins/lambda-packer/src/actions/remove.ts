import rimraf from 'rimraf';

/**
 * Execute remove action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function rimrafAction(command: any, options: any) {
  const { verbose } = options;

  if (!command.source) {
    verbose &&
      console.log(
        '  - Lambda Webpack Plugin: Warning - remove parameter has to be formated as follows: { source: <string> }'
      );

    return undefined;
  }

  return () =>
    new Promise((resolve, reject) => {
      verbose && console.log(`  - Lambda Webpack Plugin: Start removing source: ${command.source} `);

      rimraf(command.source, () => {
        verbose && console.log(`  - Lambda Webpack Plugin: Finished removing source: ${command.source} `);
        resolve();
      });
    });
}

export { rimrafAction };
