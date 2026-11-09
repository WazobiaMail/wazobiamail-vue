import { ref } from 'vue';
import type { SpamCheckRequest, SpamCheckResponse, WazobiaMail } from 'wazobiamail';
import { useWazobiaMail } from './useWazobiaMail';
import type { UseSpamCheckReturn } from '../types';

export function useSpamCheck(clientOverride?: WazobiaMail): UseSpamCheckReturn {
  const client = clientOverride ?? useWazobiaMail();

  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);
  const result = ref<SpamCheckResponse['data'] | null>(null);

  const reset = () => {
    isLoading.value = false;
    error.value = null;
    result.value = null;
  };

  const check = async (payload: SpamCheckRequest): Promise<SpamCheckResponse['data']> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await client.messages.spamCheck(payload);
      result.value = response.data;
      return response.data;
    } catch (err) {
      const caught = err instanceof Error ? err : new Error(String(err));
      error.value = caught;
      throw caught;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    result,
    check,
    reset,
  };
}
