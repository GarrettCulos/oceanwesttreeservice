'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.mkdirAction = void 0;
const make_dir_1 = require('make-dir');
/**
 * Execute mkdir action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function mkdirAction(command, options) {
  const { verbose } = options;
  return () => {
    if (verbose) {
      console.log(`  - Lambda Webpack Plugin: Creating path ${command.source}`);
    }
    if (typeof command.source !== 'string') {
      if (verbose) {
        console.log('  - Lambda Webpack Plugin: Warning - mkdir parameter has to be type of string. Process canceled.');
      }
      return;
    }
    return make_dir_1.default(command.source);
  };
}
exports.mkdirAction = mkdirAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWtkaXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJta2Rpci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBK0I7QUFFL0I7Ozs7O0dBS0c7QUFDSCxTQUFTLFdBQVcsQ0FBQyxPQUFZLEVBQUUsT0FBWTtJQUM3QyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTVCLE9BQU8sR0FBRyxFQUFFO1FBQ1YsSUFBSSxPQUFPLEVBQUU7WUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLDRDQUE0QyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUMzRTtRQUVELElBQUksT0FBTyxPQUFPLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBRTtZQUN0QyxJQUFJLE9BQU8sRUFBRTtnQkFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLGtHQUFrRyxDQUFDLENBQUM7YUFDakg7WUFDRCxPQUFPO1NBQ1I7UUFFRCxPQUFPLGtCQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFUSxrQ0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtYWtlRGlyIGZyb20gJ21ha2UtZGlyJztcblxuLyoqXG4gKiBFeGVjdXRlIG1rZGlyIGFjdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb21tYW5kIC0gQ29tbWFuZCBkYXRhIGZvciBnaXZlbiBhY3Rpb25cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufG51bGx9IC0gRnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZSBvciBudWxsXG4gKi9cbmZ1bmN0aW9uIG1rZGlyQWN0aW9uKGNvbW1hbmQ6IGFueSwgb3B0aW9uczogYW55KSB7XG4gIGNvbnN0IHsgdmVyYm9zZSB9ID0gb3B0aW9ucztcblxuICByZXR1cm4gKCkgPT4ge1xuICAgIGlmICh2ZXJib3NlKSB7XG4gICAgICBjb25zb2xlLmxvZyhgICAtIExhbWJkYSBXZWJwYWNrIFBsdWdpbjogQ3JlYXRpbmcgcGF0aCAke2NvbW1hbmQuc291cmNlfWApO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY29tbWFuZC5zb3VyY2UgIT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAodmVyYm9zZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnICAtIExhbWJkYSBXZWJwYWNrIFBsdWdpbjogV2FybmluZyAtIG1rZGlyIHBhcmFtZXRlciBoYXMgdG8gYmUgdHlwZSBvZiBzdHJpbmcuIFByb2Nlc3MgY2FuY2VsZWQuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIG1ha2VEaXIoY29tbWFuZC5zb3VyY2UpO1xuICB9O1xufVxuXG5leHBvcnQgeyBta2RpckFjdGlvbiB9O1xuIl19
