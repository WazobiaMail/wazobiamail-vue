import type { App, InjectionKey, Plugin } from 'vue';
import { WazobiaMail } from 'wazobiamail';
import type { WazobiaVueOptions } from './types';

export const WazobiaMailKey: InjectionKey<WazobiaMail> = Symbol('WazobiaMail');

export function createWazobiaMail(options: WazobiaVueOptions = {}): Plugin {
  return {
    install(app: App) {
      const client = new WazobiaMail(options);
      app.provide(WazobiaMailKey, client);
      app.config.globalProperties.$wazobiamail = client;
    },
  };
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $wazobiamail: WazobiaMail;
  }
}
