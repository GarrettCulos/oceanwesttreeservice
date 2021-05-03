'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.moveAction = void 0;
const fs_1 = require('fs');
const mv_1 = require('mv');
/**
 * Execute move action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function moveAction(command, options) {
  const { verbose } = options;
  if (!command.source || !command.destination) {
    if (verbose) {
      console.log(
        '  - Lambda Webpack Plugin: Warning - move parameter has to be formated as follows: { source: <string>, destination: <string> }'
      );
    }
    return;
  }
  if (fs_1.default.existsSync(command.source)) {
    return () =>
      new Promise((resolve, reject) => {
        if (verbose) {
          console.log(
            `  - Lambda Webpack Plugin: Start move source: ${command.source} to destination: ${command.destination}`
          );
        }
        mv_1.default(command.source, command.destination, { mkdirp: false }, (err) => {
          if (err) {
            if (verbose) {
              console.log('  - Lambda Webpack Plugin: Error - move failed', err);
            }
            reject(err);
          }
          if (verbose) {
            console.log(
              `  - Lambda Webpack Plugin: Finished move source: ${command.source} to destination: ${command.destination}`
            );
          }
          resolve();
        });
      });
  } else {
    process.emitWarning(`  - Lambda Webpack Plugin: Could not move ${command.source}: path does not exist`);
    return;
  }
}
exports.moveAction = moveAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1vdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQW9CO0FBQ3BCLDJCQUFvQjtBQUVwQjs7Ozs7R0FLRztBQUNILFNBQVMsVUFBVSxDQUFDLE9BQVksRUFBRSxPQUFZO0lBQzVDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO1FBQzNDLElBQUksT0FBTyxFQUFFO1lBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FDVCxnSUFBZ0ksQ0FDakksQ0FBQztTQUNIO1FBQ0QsT0FBTztLQUNSO0lBRUQsSUFBSSxZQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNqQyxPQUFPLEdBQUcsRUFBRSxDQUNWLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzlCLElBQUksT0FBTyxFQUFFO2dCQUNYLE9BQU8sQ0FBQyxHQUFHLENBQ1QsaURBQWlELE9BQU8sQ0FBQyxNQUFNLG9CQUFvQixPQUFPLENBQUMsV0FBVyxFQUFFLENBQ3pHLENBQUM7YUFDSDtZQUVELFlBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQy9ELElBQUksR0FBRyxFQUFFO29CQUNQLElBQUksT0FBTyxFQUFFO3dCQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0RBQWdELEVBQUUsR0FBRyxDQUFDLENBQUM7cUJBQ3BFO29CQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDYjtnQkFFRCxJQUFJLE9BQU8sRUFBRTtvQkFDWCxPQUFPLENBQUMsR0FBRyxDQUNULG9EQUFvRCxPQUFPLENBQUMsTUFBTSxvQkFDaEUsT0FBTyxDQUFDLFdBQ1YsRUFBRSxDQUNILENBQUM7aUJBQ0g7Z0JBRUQsT0FBTyxFQUFFLENBQUM7WUFDWixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0tBQ047U0FBTTtRQUNMLE9BQU8sQ0FBQyxXQUFXLENBQUMsNkNBQTZDLE9BQU8sQ0FBQyxNQUFNLHVCQUF1QixDQUFDLENBQUM7UUFDeEcsT0FBTztLQUNSO0FBQ0gsQ0FBQztBQUVRLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBtdiBmcm9tICdtdic7XG5cbi8qKlxuICogRXhlY3V0ZSBtb3ZlIGFjdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb21tYW5kIC0gQ29tbWFuZCBkYXRhIGZvciBnaXZlbiBhY3Rpb25cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufG51bGx9IC0gRnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZSBvciBudWxsXG4gKi9cbmZ1bmN0aW9uIG1vdmVBY3Rpb24oY29tbWFuZDogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgY29uc3QgeyB2ZXJib3NlIH0gPSBvcHRpb25zO1xuXG4gIGlmICghY29tbWFuZC5zb3VyY2UgfHwgIWNvbW1hbmQuZGVzdGluYXRpb24pIHtcbiAgICBpZiAodmVyYm9zZSkge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICcgIC0gTGFtYmRhIFdlYnBhY2sgUGx1Z2luOiBXYXJuaW5nIC0gbW92ZSBwYXJhbWV0ZXIgaGFzIHRvIGJlIGZvcm1hdGVkIGFzIGZvbGxvd3M6IHsgc291cmNlOiA8c3RyaW5nPiwgZGVzdGluYXRpb246IDxzdHJpbmc+IH0nXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoZnMuZXhpc3RzU3luYyhjb21tYW5kLnNvdXJjZSkpIHtcbiAgICByZXR1cm4gKCkgPT5cbiAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgaWYgKHZlcmJvc2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIGAgIC0gTGFtYmRhIFdlYnBhY2sgUGx1Z2luOiBTdGFydCBtb3ZlIHNvdXJjZTogJHtjb21tYW5kLnNvdXJjZX0gdG8gZGVzdGluYXRpb246ICR7Y29tbWFuZC5kZXN0aW5hdGlvbn1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG12KGNvbW1hbmQuc291cmNlLCBjb21tYW5kLmRlc3RpbmF0aW9uLCB7IG1rZGlycDogZmFsc2UgfSwgZXJyID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBpZiAodmVyYm9zZSkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnICAtIExhbWJkYSBXZWJwYWNrIFBsdWdpbjogRXJyb3IgLSBtb3ZlIGZhaWxlZCcsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodmVyYm9zZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgIGAgIC0gTGFtYmRhIFdlYnBhY2sgUGx1Z2luOiBGaW5pc2hlZCBtb3ZlIHNvdXJjZTogJHtjb21tYW5kLnNvdXJjZX0gdG8gZGVzdGluYXRpb246ICR7XG4gICAgICAgICAgICAgICAgY29tbWFuZC5kZXN0aW5hdGlvblxuICAgICAgICAgICAgICB9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcHJvY2Vzcy5lbWl0V2FybmluZyhgICAtIExhbWJkYSBXZWJwYWNrIFBsdWdpbjogQ291bGQgbm90IG1vdmUgJHtjb21tYW5kLnNvdXJjZX06IHBhdGggZG9lcyBub3QgZXhpc3RgKTtcbiAgICByZXR1cm47XG4gIH1cbn1cblxuZXhwb3J0IHsgbW92ZUFjdGlvbiB9O1xuIl19
