import { describe, it, expect } from 'bun:test';
import { createApp } from 'vue';
import { createWazobiaMail, useWazobiaMail } from '../src';
import { WazobiaMail } from 'wazobiamail';

describe('WazobiaMail Vue 3 Plugin', () => {
  it('installs plugin and provides client instance to app context', () => {
    const app = createApp({
      template: '<div></div>',
    });

    const plugin = createWazobiaMail({
      apiKey: 'wzbm_vue_test_12345',
      baseUrl: 'https://api.test.wazobiamail.com/api/v1',
    });

    app.use(plugin);

    expect(app.config.globalProperties.$wazobiamail).toBeInstanceOf(WazobiaMail);
    expect(app.config.globalProperties.$wazobiamail.toJSON().baseUrl).toBe('https://api.test.wazobiamail.com/api/v1');
    expect(app.config.globalProperties.$wazobiamail.toJSON().apiKey).toContain('wzbm_');
  });

  it('resolves client via useWazobiaMail when custom options are passed', () => {
    const client = useWazobiaMail({
      apiKey: 'wzbm_explicit_key_67890',
    });

    expect(client).toBeInstanceOf(WazobiaMail);
    expect(client.toJSON().apiKey).toContain('wzbm_');
  });
});
