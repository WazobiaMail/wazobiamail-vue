import { ref, unref, onUnmounted, getCurrentInstance, type MaybeRef } from 'vue';
import type { MailboxMessageSummary, Pagination } from 'wazobiamail';
import { useWazobiaMail } from './useWazobiaMail';
import type { UseMailboxOptions, UseMailboxReturn } from '../types';

export function useMailbox(
  mailboxId: MaybeRef<string>,
  options: UseMailboxOptions = {}
): UseMailboxReturn {
  const client = options.client ?? useWazobiaMail();

  const messages = ref<MailboxMessageSummary[]>([]);
  const pagination = ref<Pagination | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);

  const currentPage = ref<number>(options.page ?? 1);
  const currentLimit = ref<number>(options.limit ?? 20);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const getMailboxId = (): string => unref(mailboxId);

  const refresh = async (): Promise<void> => {
    const id = getMailboxId();
    if (!id) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await client.mailboxes.messages.list(id, {
        unreadOnly: options.unreadOnly,
        page: currentPage.value,
        limit: currentLimit.value,
      });

      messages.value = response.data?.items ?? [];
      pagination.value = response.data?.pagination ?? null;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      isLoading.value = false;
    }
  };

  const nextPage = async (): Promise<void> => {
    if (pagination.value?.hasNext) {
      currentPage.value += 1;
      await refresh();
    }
  };

  const prevPage = async (): Promise<void> => {
    if (pagination.value?.hasPrev || currentPage.value > 1) {
      currentPage.value -= 1;
      await refresh();
    }
  };

  const deleteMessage = async (messageId: string): Promise<void> => {
    const id = getMailboxId();
    if (!id) return;

    try {
      await client.mailboxes.messages.delete(id, messageId);
      messages.value = messages.value.filter((m) => m.id !== messageId);
    } catch (err) {
      const caught = err instanceof Error ? err : new Error(String(err));
      error.value = caught;
      throw caught;
    }
  };

  const stopPolling = (): void => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  const startPolling = (intervalMs: number = options.pollInterval ?? 10000): void => {
    stopPolling();
    if (intervalMs > 0) {
      pollTimer = setInterval(() => {
        void refresh();
      }, intervalMs);
    }
  };

  if (getCurrentInstance()) {
    onUnmounted(() => {
      stopPolling();
    });
  }

  if (options.immediate !== false) {
    void refresh();
  }

  if (options.pollInterval && options.pollInterval > 0) {
    startPolling(options.pollInterval);
  }

  return {
    messages,
    pagination,
    isLoading,
    error,
    refresh,
    nextPage,
    prevPage,
    deleteMessage,
    startPolling,
    stopPolling,
  };
}
