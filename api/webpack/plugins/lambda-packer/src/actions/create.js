'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createAction = void 0;
const fs_1 = require('fs');
/**
 * Execute create action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function createAction(command, options) {
  const { verbose } = options;
  if (!command.source || !command.content) {
    verbose &&
      console.log(
        '  - Lambda Webpack Plugin: Warning - creat parameter has to be formated as follows: { source: <string>, content: <string> }'
      );
    return;
  }
  return () =>
    new Promise((resolve, reject) => {
      verbose && console.log(`  - Lambda Webpack Plugin: Start creating source: ${command.source}`);
      fs_1.default.writeFile(command.source, command.content, (err) => {
        if (err) {
          verbose && console.log(`  - Lambda Webpack Plugin: Failed to create source: ${command.source}`);
          return reject();
        }
        verbose && console.log(`  - Lambda Webpack Plugin: Finished to create source: ${command.source}`);
        return resolve();
      });
    });
}
exports.createAction = createAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUFvQjtBQUVwQjs7Ozs7R0FLRztBQUNILFNBQVMsWUFBWSxDQUFDLE9BQVksRUFBRSxPQUFZO0lBQzlDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1FBQ3ZDLE9BQU87WUFDTCxPQUFPLENBQUMsR0FBRyxDQUNULDZIQUE2SCxDQUM5SCxDQUFDO1FBQ0osT0FBTztLQUNSO0lBRUQsT0FBTyxHQUFHLEVBQUUsQ0FDVixJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUM5QixPQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxxREFBcUQsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDOUYsWUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDbEQsSUFBSSxHQUFHLEVBQUU7Z0JBQ1AsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsdURBQXVELE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRyxPQUFPLE1BQU0sRUFBRSxDQUFDO2FBQ2pCO1lBQ0QsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMseURBQXlELE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ2xHLE9BQU8sT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFUSxvQ0FBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5cbi8qKlxuICogRXhlY3V0ZSBjcmVhdGUgYWN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbW1hbmQgLSBDb21tYW5kIGRhdGEgZm9yIGdpdmVuIGFjdGlvblxuICogQHJldHVybiB7RnVuY3Rpb258bnVsbH0gLSBGdW5jdGlvbiB0aGF0IHJldHVybnMgYSBwcm9taXNlIG9yIG51bGxcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQWN0aW9uKGNvbW1hbmQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gIGNvbnN0IHsgdmVyYm9zZSB9ID0gb3B0aW9ucztcblxuICBpZiAoIWNvbW1hbmQuc291cmNlIHx8ICFjb21tYW5kLmNvbnRlbnQpIHtcbiAgICB2ZXJib3NlICYmXG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgJyAgLSBMYW1iZGEgV2VicGFjayBQbHVnaW46IFdhcm5pbmcgLSBjcmVhdCBwYXJhbWV0ZXIgaGFzIHRvIGJlIGZvcm1hdGVkIGFzIGZvbGxvd3M6IHsgc291cmNlOiA8c3RyaW5nPiwgY29udGVudDogPHN0cmluZz4gfSdcbiAgICAgICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuICgpID0+XG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdmVyYm9zZSAmJiBjb25zb2xlLmxvZyhgICAtIExhbWJkYSBXZWJwYWNrIFBsdWdpbjogU3RhcnQgY3JlYXRpbmcgc291cmNlOiAke2NvbW1hbmQuc291cmNlfWApO1xuICAgICAgZnMud3JpdGVGaWxlKGNvbW1hbmQuc291cmNlLCBjb21tYW5kLmNvbnRlbnQsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICB2ZXJib3NlICYmIGNvbnNvbGUubG9nKGAgIC0gTGFtYmRhIFdlYnBhY2sgUGx1Z2luOiBGYWlsZWQgdG8gY3JlYXRlIHNvdXJjZTogJHtjb21tYW5kLnNvdXJjZX1gKTtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgdmVyYm9zZSAmJiBjb25zb2xlLmxvZyhgICAtIExhbWJkYSBXZWJwYWNrIFBsdWdpbjogRmluaXNoZWQgdG8gY3JlYXRlIHNvdXJjZTogJHtjb21tYW5kLnNvdXJjZX1gKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgeyBjcmVhdGVBY3Rpb24gfTtcbiJdfQ==
