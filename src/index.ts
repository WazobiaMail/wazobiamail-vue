export { createWazobiaMail, WazobiaMailKey } from './plugin';
export { useWazobiaMail } from './composables/useWazobiaMail';
export { useSendMail } from './composables/useSendMail';
export { useMailbox } from './composables/useMailbox';
export { useDomains } from './composables/useDomains';
export { useSpamCheck } from './composables/useSpamCheck';

export type {
  WazobiaVueOptions,
  UseSendMailOptions,
  UseSendMailReturn,
  UseMailboxOptions,
  UseMailboxReturn,
  UseDomainsOptions,
  UseDomainsReturn,
  UseSpamCheckReturn,
} from './types';

// Re-export core WazobiaMail client, errors, and models for convenience
export {
  WazobiaMail,
  Wazobia,
  WazobiaError,
  WazobiaAuthenticationError,
  WazobiaForbiddenError,
  WazobiaNotFoundError,
  WazobiaValidationError,
  WazobiaRateLimitError,
  WazobiaApiError,
  WazobiaTimeoutError,
} from 'wazobiamail';

export type {
  SendMessageRequest,
  SendMessageResponse,
  SpamCheckRequest,
  SpamCheckResponse,
  SendingDomain,
  DnsRecord,
  Mailbox,
  MailboxMessageSummary,
  MailboxMessageDetail,
  Pagination,
} from 'wazobiamail';
