'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.copyAction = void 0;
const fs_1 = require('fs');
const path_1 = require('path');
const cpx_1 = require('cpx');
const fs_extra_1 = require('fs-extra');
const make_dir_1 = require('make-dir');
/**
 * Execute copy action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function copyAction(command, options) {
  const { verbose } = options;
  if (!command.source || !command.destination) {
    if (verbose) {
      console.log(
        '  - FileManagerPlugin: Warning - copy parameter has to be formated as follows: { source: <string>, destination: <string> }'
      );
    }
    return;
  }
  return () =>
    new Promise((resolve, reject) => {
      // if source is a file, just copyFile()
      // if source is a NOT a glob pattern, simply append **/*
      const fileRegex = /(\*|\{+|\}+)/g;
      const matches = fileRegex.exec(command.source);
      if (matches === undefined) {
        fs_1.default.lstat(command.source, (sErr, sStats) => {
          if (sErr) return reject(sErr);
          fs_1.default.lstat(command.destination, (dErr, dStats) => {
            if (sStats.isFile()) {
              const destination =
                dStats && dStats.isDirectory()
                  ? command.destination + '/' + path_1.default.basename(command.source)
                  : command.destination;
              if (verbose) {
                console.log(
                  `  - FileManagerPlugin: Start copy source: ${command.source} to destination: ${destination}`
                );
              }
              /*
               * If the supplied destination is a directory copy inside.
               * If the supplied destination is a directory that does not exist yet create it & copy inside
               */
              const pathInfo = path_1.default.parse(destination);
              const execCopy = (src, dest) => {
                fs_extra_1.default.copy(src, dest, (err) => {
                  if (err) reject(err);
                  resolve();
                });
              };
              if (pathInfo.ext === '') {
                make_dir_1.default(destination).then((mPath) => {
                  execCopy(command.source, destination + '/' + path_1.default.basename(command.source));
                });
              } else {
                execCopy(command.source, destination);
              }
            } else {
              const sourceDir = command.source + (command.source.substr(-1) !== '/' ? '/' : '') + '**/*';
              copyDirectory(sourceDir, command.destination, resolve, reject, options);
            }
          });
        });
      } else {
        copyDirectory(command.source, command.destination, resolve, reject, options);
      }
    });
}
exports.copyAction = copyAction;
/**
 * Execute copy directory
 *
 * @param {string} source - source file path
 * @param {string} destination - destination file path
 * @param {Function} resolve - function used to resolve a Promise
 * @param {Function} reject - function used to reject a Promise
 * @return {void}
 */
function copyDirectory(source, destination, resolve, reject, options) {
  const { verbose } = options;
  /* cpx options */
  const cpxOptions = {
    clean: false,
    includeEmptyDirs: true,
    update: false,
  };
  if (verbose) {
    console.log(`  - Lambda Webpack Plugin: Start copy source file: ${source} to destination file: ${destination}`);
  }
  cpx_1.default.copy(source, destination, cpxOptions, (err) => {
    if (err && options.verbose) {
      console.log('  - Lambda Webpack Plugin: Error - copy failed', err);
      reject(err);
    }
    if (verbose) {
      console.log(`  - Lambda Webpack Plugin: Finished copy source: ${source} to destination: ${destination}`);
    }
    resolve();
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvcHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQW9CO0FBQ3BCLCtCQUF3QjtBQUN4Qiw2QkFBc0I7QUFDdEIsdUNBQStCO0FBQy9CLHVDQUErQjtBQUUvQjs7Ozs7R0FLRztBQUNILFNBQVMsVUFBVSxDQUFDLE9BQVksRUFBRSxPQUFZO0lBQzVDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO1FBQzNDLElBQUksT0FBTyxFQUFFO1lBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FDVCw0SEFBNEgsQ0FDN0gsQ0FBQztTQUNIO1FBQ0QsT0FBTztLQUNSO0lBRUQsT0FBTyxHQUFHLEVBQUUsQ0FDVixJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUM5Qix1Q0FBdUM7UUFDdkMsd0RBQXdEO1FBQ3hELE1BQU0sU0FBUyxHQUFHLGVBQWUsQ0FBQztRQUNsQyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUvQyxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDekIsWUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUN4QyxJQUFJLElBQUk7b0JBQUUsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTlCLFlBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDN0MsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUU7d0JBQ25CLE1BQU0sV0FBVyxHQUNmLE1BQU0sSUFBSSxNQUFNLENB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QUM7U0FDYjtRQUVELElBQUksT0FBTyxFQUFFO1lBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvREFBb0QsTUFBTSxvQkFBb0IsV0FBVyxFQUFFLENBQUMsQ0FBQztTQUMxRztRQUVELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGNweCBmcm9tICdjcHgnO1xuaW1wb3J0IGZzRXh0cmEgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IG1ha2VEaXIgZnJvbSAnbWFrZS1kaXInO1xuXG4vKipcbiAqIEV4ZWN1dGUgY29weSBhY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29tbWFuZCAtIENvbW1hbmQgZGF0YSBmb3IgZ2l2ZW4gYWN0aW9uXG4gKiBAcmV0dXJuIHtGdW5jdGlvbnxudWxsfSAtIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2Ugb3IgbnVsbFxuICovXG5mdW5jdGlvbiBjb3B5QWN0aW9uKGNvbW1hbmQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gIGNvbnN0IHsgdmVyYm9zZSB9ID0gb3B0aW9ucztcblxuICBpZiAoIWNvbW1hbmQuc291cmNlIHx8ICFjb21tYW5kLmRlc3RpbmF0aW9uKSB7XG4gICAgaWYgKHZlcmJvc2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAnICAtIEZpbGVNYW5hZ2VyUGx1Z2luOiBXYXJuaW5nIC0gY29weSBwYXJhbWV0ZXIgaGFzIHRvIGJlIGZvcm1hdGVkIGFzIGZvbGxvd3M6IHsgc291cmNlOiA8c3RyaW5nPiwgZGVzdGluYXRpb246IDxzdHJpbmc+IH0nXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gKCkgPT5cbiAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBpZiBzb3VyY2UgaXMgYSBmaWxlLCBqdXN0IGNvcHlGaWxlKClcbiAgICAgIC8vIGlmIHNvdXJjZSBpcyBhIE5PVCBhIGdsb2IgcGF0dGVybiwgc2ltcGx5IGFwcGVuZCAqKi8qXG4gICAgICBjb25zdCBmaWxlUmVnZXggPSAvKFxcKnxcXHsrfFxcfSspL2c7XG4gICAgICBjb25zdCBtYXRjaGVzID0gZmlsZVJlZ2V4LmV4ZWMoY29tbWFuZC5zb3VyY2UpO1xuXG4gICAgICBpZiAobWF0Y2hlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZzLmxzdGF0KGNvbW1hbmQuc291cmNlLCAoc0Vyciwgc1N0YXRzKSA9PiB7XG4gICAgICAgICAgaWYgKHNFcnIpIHJldHVybiByZWplY3Qoc0Vycik7XG5cbiAgICAgICAgICBmcy5sc3RhdChjb21tYW5kLmRlc3RpbmF0aW9uLCAoZEVyciwgZFN0YXRzKSA9PiB7XG4gICAgICAgICAgICBpZiAoc1N0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGRlc3RpbmF0aW9uID1cbiAgICAgICAgICAgICAgICBkU3RhdHMgJiYgZFN0YXRzLmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICAgID8gY29tbWFuZC5kZXN0aW5hdGlvbiArICcvJyArIHBhdGguYmFzZW5hbWUoY29tbWFuZC5zb3VyY2UpXG4gICAgICAgICAgICAgICAgICA6IGNvbW1hbmQuZGVzdGluYXRpb247XG5cbiAgICAgICAgICAgICAgaWYgKHZlcmJvc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgIGAgIC0gRmlsZU1hbmFnZXJQbHVnaW46IFN0YXJ0IGNvcHkgc291cmNlOiAke2NvbW1hbmQuc291cmNlfSB0byBkZXN0aW5hdGlvbjogJHtkZXN0aW5hdGlvbn1gXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAqIElmIHRoZSBzdXBwbGllZCBkZXN0aW5hdGlvbiBpcyBhIGRpcmVjdG9yeSBjb3B5IGluc2lkZS5cbiAgICAgICAgICAgICAgICogSWYgdGhlIHN1cHBsaWVkIGRlc3RpbmF0aW9uIGlzIGEgZGlyZWN0b3J5IHRoYXQgZG9lcyBub3QgZXhpc3QgeWV0IGNyZWF0ZSBpdCAmIGNvcHkgaW5zaWRlXG4gICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgIGNvbnN0IHBhdGhJbmZvID0gcGF0aC5wYXJzZShkZXN0aW5hdGlvbik7XG5cbiAgICAgICAgICAgICAgY29uc3QgZXhlY0NvcHkgPSAoc3JjOiBzdHJpbmcsIGRlc3Q6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGZzRXh0cmEuY29weShzcmMsIGRlc3QsIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICBpZiAocGF0aEluZm8uZXh0ID09PSAnJykge1xuICAgICAgICAgICAgICAgIG1ha2VEaXIoZGVzdGluYXRpb24pLnRoZW4obVBhdGggPT4ge1xuICAgICAgICAgICAgICAgICAgZXhlY0NvcHkoY29tbWFuZC5zb3VyY2UsIGRlc3RpbmF0aW9uICsgJy8nICsgcGF0aC5iYXNlbmFtZShjb21tYW5kLnNvdXJjZSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGV4ZWNDb3B5KGNvbW1hbmQuc291cmNlLCBkZXN0aW5hdGlvbik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IHNvdXJjZURpciA9IGNvbW1hbmQuc291cmNlICsgKGNvbW1hbmQuc291cmNlLnN1YnN0cigtMSkgIT09ICcvJyA/ICcvJyA6ICcnKSArICcqKi8qJztcbiAgICAgICAgICAgICAgY29weURpcmVjdG9yeShzb3VyY2VEaXIsIGNvbW1hbmQuZGVzdGluYXRpb24sIHJlc29sdmUsIHJlamVjdCwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29weURpcmVjdG9yeShjb21tYW5kLnNvdXJjZSwgY29tbWFuZC5kZXN0aW5hdGlvbiwgcmVzb2x2ZSwgcmVqZWN0LCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBFeGVjdXRlIGNvcHkgZGlyZWN0b3J5XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZSAtIHNvdXJjZSBmaWxlIHBhdGhcbiAqIEBwYXJhbSB7c3RyaW5nfSBkZXN0aW5hdGlvbiAtIGRlc3RpbmF0aW9uIGZpbGUgcGF0aFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSAtIGZ1bmN0aW9uIHVzZWQgdG8gcmVzb2x2ZSBhIFByb21pc2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCAtIGZ1bmN0aW9uIHVzZWQgdG8gcmVqZWN0IGEgUHJvbWlzZVxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gY29weURpcmVjdG9yeShzb3VyY2U6IHN0cmluZywgZGVzdGluYXRpb246IHN0cmluZywgcmVzb2x2ZTogRnVuY3Rpb24sIHJlamVjdDogRnVuY3Rpb24sIG9wdGlvbnM6IGFueSkge1xuICBjb25zdCB7IHZlcmJvc2UgfSA9IG9wdGlvbnM7XG5cbiAgLyogY3B4IG9wdGlvbnMgKi9cbiAgY29uc3QgY3B4T3B0aW9ucyA9IHtcbiAgICBjbGVhbjogZmFsc2UsXG4gICAgaW5jbHVkZUVtcHR5RGlyczogdHJ1ZSxcbiAgICB1cGRhdGU6IGZhbHNlXG4gIH07XG5cbiAgaWYgKHZlcmJvc2UpIHtcbiAgICBjb25zb2xlLmxvZyhgICAtIExhbWJkYSBXZWJwYWNrIFBsdWdpbjogU3RhcnQgY29weSBzb3VyY2UgZmlsZTogJHtzb3VyY2V9IHRvIGRlc3RpbmF0aW9uIGZpbGU6ICR7ZGVzdGluYXRpb259YCk7XG4gIH1cblxuICBjcHguY29weShzb3VyY2UsIGRlc3RpbmF0aW9uLCBjcHhPcHRpb25zLCBlcnIgPT4ge1xuICAgIGlmIChlcnIgJiYgb3B0aW9ucy52ZXJib3NlKSB7XG4gICAgICBjb25zb2xlLmxvZygnICAtIExhbWJkYSBXZWJwYWNrIFBsdWdpbjogRXJyb3IgLSBjb3B5IGZhaWxlZCcsIGVycik7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9XG5cbiAgICBpZiAodmVyYm9zZSkge1xuICAgICAgY29uc29sZS5sb2coYCAgLSBMYW1iZGEgV2VicGFjayBQbHVnaW46IEZpbmlzaGVkIGNvcHkgc291cmNlOiAke3NvdXJjZX0gdG8gZGVzdGluYXRpb246ICR7ZGVzdGluYXRpb259YCk7XG4gICAgfVxuXG4gICAgcmVzb2x2ZSgpO1xuICB9KTtcbn1cblxuZXhwb3J0IHsgY29weUFjdGlvbiB9O1xuIl19
