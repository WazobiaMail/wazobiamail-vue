import { inject } from 'vue';
import { WazobiaMail } from 'wazobiamail';
import { WazobiaMailKey } from '../plugin';
import type { WazobiaVueOptions } from '../types';

export function useWazobiaMail(options?: WazobiaVueOptions): WazobiaMail {
  if (options) {
    return new WazobiaMail(options);
  }

  const injected = inject(WazobiaMailKey, null);
  if (injected) {
    return injected;
  }

  // If running in an environment with ambient process.env credentials, try instantiating
  return new WazobiaMail();
}
