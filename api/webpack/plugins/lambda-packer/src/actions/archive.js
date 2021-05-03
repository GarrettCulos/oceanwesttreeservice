'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.archiveAction = void 0;
const fs_extra_1 = require('fs-extra');
const path_1 = require('path');
const archiver_1 = require('archiver');
/**
 * Execute mkdir action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function archiveAction(command, options) {
  const { verbose } = options;
  return () =>
    new Promise((resolve, reject) => {
      if (!command.source || !command.destination) {
        if (verbose) {
          console.log(
            '  - Lambda Webpack Plugin: Warning - archive parameter has to be formated as follows: { source: <string>, destination: <string> }'
          );
        }
        reject();
      }
      const fileRegex = /(\*|\{+|\}+)/g;
      const matches = fileRegex.exec(command.source);
      const isGlob = matches !== null;
      fs_extra_1.default.lstat(command.source, (sErr, sStats) => {
        const output = fs_extra_1.default.createWriteStream(command.destination);
        const archive = archiver_1.default(command.format, command.options);
        archive.on('error', (err) => reject(err));
        archive.pipe(output);
        // Exclude destination file from archive
        const destFile = path_1.default.basename(command.destination);
        const globOptions = Object.assign({ ignore: destFile }, command.options.globOptions || {});
        if (isGlob) archive.glob(command.source, globOptions);
        else if (sStats.isFile()) archive.file(command.source, { name: path_1.default.basename(command.source) });
        else if (sStats.isDirectory())
          archive.glob('**/*', {
            cwd: command.source,
            ignore: destFile,
          });
        archive.finalize();
        resolve();
      });
    });
}
exports.archiveAction = archiveAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJjaGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFyY2hpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQTBCO0FBQzFCLCtCQUF3QjtBQUN4Qix1Q0FBZ0M7QUFFaEM7Ozs7O0dBS0c7QUFDSCxTQUFTLGFBQWEsQ0FBQyxPQUFZLEVBQUUsT0FBWTtJQUMvQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTVCLE9BQU8sR0FBRyxFQUFFLENBQ1YsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO1lBQzNDLElBQUksT0FBTyxFQUFFO2dCQUNYLE9BQU8sQ0FBQyxHQUFHLENBQ1QsbUlBQW1JLENBQ3BJLENBQUM7YUFDSDtZQUNELE1BQU0sRUFBRSxDQUFDO1NBQ1Y7UUFFRCxNQUFNLFNBQVMsR0FBRyxlQUFlLENBQUM7UUFDbEMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFL0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxLQUFLLElBQUksQ0FBQztRQUVoQyxrQkFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3hDLE1BQU0sTUFBTSxHQUFHLGtCQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sT0FBTyxHQUFHLGtCQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFMUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4QyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXJCLHdDQUF3QztZQUN4QyxNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNwRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRTNGLElBQUksTUFBTTtnQkFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7aUJBQ2pELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsY0FBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUMzRixJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUU7Z0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNuQixHQUFHLEVBQUUsT0FBTyxDQUFDLE1BQU07b0JBQ25CLE1BQU0sRUFBRSxRQUFRO2lCQUNqQixDQUFDLENBQUM7WUFDTCxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkIsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVRLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGFyY2hpdmVyIGZyb20gJ2FyY2hpdmVyJztcblxuLyoqXG4gKiBFeGVjdXRlIG1rZGlyIGFjdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb21tYW5kIC0gQ29tbWFuZCBkYXRhIGZvciBnaXZlbiBhY3Rpb25cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufG51bGx9IC0gRnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZSBvciBudWxsXG4gKi9cbmZ1bmN0aW9uIGFyY2hpdmVBY3Rpb24oY29tbWFuZDogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgY29uc3QgeyB2ZXJib3NlIH0gPSBvcHRpb25zO1xuXG4gIHJldHVybiAoKSA9PlxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICghY29tbWFuZC5zb3VyY2UgfHwgIWNvbW1hbmQuZGVzdGluYXRpb24pIHtcbiAgICAgICAgaWYgKHZlcmJvc2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICcgIC0gTGFtYmRhIFdlYnBhY2sgUGx1Z2luOiBXYXJuaW5nIC0gYXJjaGl2ZSBwYXJhbWV0ZXIgaGFzIHRvIGJlIGZvcm1hdGVkIGFzIGZvbGxvd3M6IHsgc291cmNlOiA8c3RyaW5nPiwgZGVzdGluYXRpb246IDxzdHJpbmc+IH0nXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZWplY3QoKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsZVJlZ2V4ID0gLyhcXCp8XFx7K3xcXH0rKS9nO1xuICAgICAgY29uc3QgbWF0Y2hlcyA9IGZpbGVSZWdleC5leGVjKGNvbW1hbmQuc291cmNlKTtcblxuICAgICAgY29uc3QgaXNHbG9iID0gbWF0Y2hlcyAhPT0gbnVsbDtcblxuICAgICAgZnMubHN0YXQoY29tbWFuZC5zb3VyY2UsIChzRXJyLCBzU3RhdHMpID0+IHtcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oY29tbWFuZC5kZXN0aW5hdGlvbik7XG4gICAgICAgIGNvbnN0IGFyY2hpdmUgPSBhcmNoaXZlcihjb21tYW5kLmZvcm1hdCwgY29tbWFuZC5vcHRpb25zKTtcblxuICAgICAgICBhcmNoaXZlLm9uKCdlcnJvcicsIGVyciA9PiByZWplY3QoZXJyKSk7XG4gICAgICAgIGFyY2hpdmUucGlwZShvdXRwdXQpO1xuXG4gICAgICAgIC8vIEV4Y2x1ZGUgZGVzdGluYXRpb24gZmlsZSBmcm9tIGFyY2hpdmVcbiAgICAgICAgY29uc3QgZGVzdEZpbGUgPSBwYXRoLmJhc2VuYW1lKGNvbW1hbmQuZGVzdGluYXRpb24pO1xuICAgICAgICBjb25zdCBnbG9iT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oeyBpZ25vcmU6IGRlc3RGaWxlIH0sIGNvbW1hbmQub3B0aW9ucy5nbG9iT3B0aW9ucyB8fCB7fSk7XG5cbiAgICAgICAgaWYgKGlzR2xvYikgYXJjaGl2ZS5nbG9iKGNvbW1hbmQuc291cmNlLCBnbG9iT3B0aW9ucyk7XG4gICAgICAgIGVsc2UgaWYgKHNTdGF0cy5pc0ZpbGUoKSkgYXJjaGl2ZS5maWxlKGNvbW1hbmQuc291cmNlLCB7IG5hbWU6IHBhdGguYmFzZW5hbWUoY29tbWFuZC5zb3VyY2UpIH0pO1xuICAgICAgICBlbHNlIGlmIChzU3RhdHMuaXNEaXJlY3RvcnkoKSlcbiAgICAgICAgICBhcmNoaXZlLmdsb2IoJyoqLyonLCB7XG4gICAgICAgICAgICBjd2Q6IGNvbW1hbmQuc291cmNlLFxuICAgICAgICAgICAgaWdub3JlOiBkZXN0RmlsZVxuICAgICAgICAgIH0pO1xuICAgICAgICBhcmNoaXZlLmZpbmFsaXplKCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgeyBhcmNoaXZlQWN0aW9uIH07XG4iXX0=
