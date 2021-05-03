/**
 * Execute mkdir action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
declare function mkdirAction(command: any, options: any): () => Promise<string> | undefined;
export { mkdirAction };
