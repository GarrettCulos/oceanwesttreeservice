/**
 * Execute mkdir action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
declare function archiveAction(command: any, options: any): () => Promise<unknown>;
export { archiveAction };
