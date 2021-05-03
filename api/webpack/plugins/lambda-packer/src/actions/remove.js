'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.rimrafAction = void 0;
const rimraf_1 = require('rimraf');
/**
 * Execute remove action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function rimrafAction(command, options) {
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
      rimraf_1.default(command.source, () => {
        verbose && console.log(`  - Lambda Webpack Plugin: Finished removing source: ${command.source} `);
        resolve();
      });
    });
}
exports.rimrafAction = rimrafAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVtb3ZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUE0QjtBQUU1Qjs7Ozs7R0FLRztBQUNILFNBQVMsWUFBWSxDQUFDLE9BQVksRUFBRSxPQUFZO0lBQzlDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDbkIsT0FBTztZQUNMLE9BQU8sQ0FBQyxHQUFHLENBQ1QsMkdBQTJHLENBQzVHLENBQUM7UUFFSixPQUFPLFNBQVMsQ0FBQztLQUNsQjtJQUVELE9BQU8sR0FBRyxFQUFFLENBQ1YsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDOUIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMscURBQXFELE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRS9GLGdCQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7WUFDMUIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0RBQXdELE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ2xHLE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFUSxvQ0FBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByaW1yYWYgZnJvbSAncmltcmFmJztcblxuLyoqXG4gKiBFeGVjdXRlIHJlbW92ZSBhY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29tbWFuZCAtIENvbW1hbmQgZGF0YSBmb3IgZ2l2ZW4gYWN0aW9uXG4gKiBAcmV0dXJuIHtGdW5jdGlvbnxudWxsfSAtIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2Ugb3IgbnVsbFxuICovXG5mdW5jdGlvbiByaW1yYWZBY3Rpb24oY29tbWFuZDogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgY29uc3QgeyB2ZXJib3NlIH0gPSBvcHRpb25zO1xuXG4gIGlmICghY29tbWFuZC5zb3VyY2UpIHtcbiAgICB2ZXJib3NlICYmXG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgJyAgLSBMYW1iZGEgV2VicGFjayBQbHVnaW46IFdhcm5pbmcgLSByZW1vdmUgcGFyYW1ldGVyIGhhcyB0byBiZSBmb3JtYXRlZCBhcyBmb2xsb3dzOiB7IHNvdXJjZTogPHN0cmluZz4gfSdcbiAgICAgICk7XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuICgpID0+XG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdmVyYm9zZSAmJiBjb25zb2xlLmxvZyhgICAtIExhbWJkYSBXZWJwYWNrIFBsdWdpbjogU3RhcnQgcmVtb3Zpbmcgc291cmNlOiAke2NvbW1hbmQuc291cmNlfSBgKTtcblxuICAgICAgcmltcmFmKGNvbW1hbmQuc291cmNlLCAoKSA9PiB7XG4gICAgICAgIHZlcmJvc2UgJiYgY29uc29sZS5sb2coYCAgLSBMYW1iZGEgV2VicGFjayBQbHVnaW46IEZpbmlzaGVkIHJlbW92aW5nIHNvdXJjZTogJHtjb21tYW5kLnNvdXJjZX0gYCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgeyByaW1yYWZBY3Rpb24gfTtcbiJdfQ==
