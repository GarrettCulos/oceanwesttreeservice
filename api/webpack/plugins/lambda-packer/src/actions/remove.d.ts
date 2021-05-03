/**
 * Execute remove action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
declare function rimrafAction(command: any, options: any): (() => Promise<unknown>) | undefined;
export { rimrafAction };
