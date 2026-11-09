import { ref } from 'vue';
import type { SendMessageRequest, SendMessageResponse } from 'wazobiamail';
import { useWazobiaMail } from './useWazobiaMail';
import type { UseSendMailOptions, UseSendMailReturn } from '../types';

export function useSendMail(options: UseSendMailOptions = {}): UseSendMailReturn {
  const client = options.client ?? useWazobiaMail();

  const isLoading = ref<boolean>(false);
  const isSuccess = ref<boolean>(false);
  const error = ref<Error | null>(null);
  const data = ref<SendMessageResponse | null>(null);

  const reset = () => {
    isLoading.value = false;
    isSuccess.value = false;
    error.value = null;
    data.value = null;
  };

  const send = async (
    payload: SendMessageRequest,
    sendOptions?: { idempotencyKey?: string }
  ): Promise<SendMessageResponse> => {
    isLoading.value = true;
    error.value = null;
    isSuccess.value = false;

    try {
      const response = await client.messages.send(payload, sendOptions);
      data.value = response;
      isSuccess.value = true;
      options.onSuccess?.(response);
      return response;
    } catch (err) {
      const caught = err instanceof Error ? err : new Error(String(err));
      error.value = caught;
      isSuccess.value = false;
      options.onError?.(caught);
      throw caught;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    isSuccess,
    error,
    data,
    send,
    reset,
  };
}
