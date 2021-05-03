import { base64This } from './helpers';

describe('helper functions', () => {
  it('can base64 encode string', () => {
    const encoded = base64This('testing');
    expect(encoded).toEqual('dGVzdGluZw==');
  });
});
