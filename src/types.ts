import type { Ref } from 'vue';
import type {
  WazobiaMail,
  WazobiaClientOptions,
  SendMessageRequest,
  SendMessageResponse,
  SpamCheckRequest,
  SpamCheckResponse,
  SendingDomain,
  DnsRecord,
  MailboxMessageSummary,
  Pagination,
} from 'wazobiamail';

export interface WazobiaVueOptions extends WazobiaClientOptions {
  /**
   * Whether to initialize lazily when first used.
   * @default false
   */
  lazy?: boolean;
}

export interface UseSendMailOptions {
  client?: WazobiaMail;
  onSuccess?: (data: SendMessageResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseSendMailReturn {
  isLoading: Ref<boolean>;
  isSuccess: Ref<boolean>;
  error: Ref<Error | null>;
  data: Ref<SendMessageResponse | null>;
  send: (
    payload: SendMessageRequest,
    options?: { idempotencyKey?: string }
  ) => Promise<SendMessageResponse>;
  reset: () => void;
}

export interface UseMailboxOptions {
  client?: WazobiaMail;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
  /**
   * Polling interval in milliseconds. If specified and > 0, automatically polls for new messages.
   * Automatically cleaned up on component unmount.
   */
  pollInterval?: number;
  immediate?: boolean;
}

export interface UseMailboxReturn {
  messages: Ref<MailboxMessageSummary[]>;
  pagination: Ref<Pagination | null>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
}

export interface UseDomainsOptions {
  client?: WazobiaMail;
  immediate?: boolean;
}

export interface UseDomainsReturn {
  domains: Ref<SendingDomain[]>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  list: () => Promise<SendingDomain[]>;
  create: (domainName: string) => Promise<SendingDomain>;
  getDnsRecords: (domainId: string) => Promise<DnsRecord[]>;
  verify: (domainId: string) => Promise<boolean>;
}

export interface UseSpamCheckReturn {
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  result: Ref<SpamCheckResponse['data'] | null>;
  check: (payload: SpamCheckRequest) => Promise<SpamCheckResponse['data']>;
  reset: () => void;
}
