import { ref } from 'vue';
import type { SendingDomain, DnsRecord } from 'wazobiamail';
import { useWazobiaMail } from './useWazobiaMail';
import type { UseDomainsOptions, UseDomainsReturn } from '../types';

export function useDomains(options: UseDomainsOptions = {}): UseDomainsReturn {
  const client = options.client ?? useWazobiaMail();

  const domains = ref<SendingDomain[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);

  const list = async (): Promise<SendingDomain[]> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await client.domains.list();
      domains.value = response.data.items;
      return response.data.items;
    } catch (err) {
      const caught = err instanceof Error ? err : new Error(String(err));
      error.value = caught;
      throw caught;
    } finally {
      isLoading.value = false;
    }
  };

  const create = async (domainName: string): Promise<SendingDomain> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await client.domains.create({ domain: domainName });
      domains.value.push(response.data.domain);
      return response.data.domain;
    } catch (err) {
      const caught = err instanceof Error ? err : new Error(String(err));
      error.value = caught;
      throw caught;
    } finally {
      isLoading.value = false;
    }
  };

  const getDnsRecords = async (domainId: string): Promise<DnsRecord[]> => {
    const response = await client.domains.getDnsRecords(domainId);
    return response.data?.domain?.records ?? [];
  };

  const verify = async (domainId: string): Promise<boolean> => {
    const response = await client.domains.verify(domainId);
    const verification = response.data?.verification;
    const isVerified = verification?.verificationStatus === 'verified';
    // Update local domain verification status if present
    const idx = domains.value.findIndex((d) => d.id === domainId);
    if (idx !== -1) {
      domains.value[idx] = {
        ...domains.value[idx],
        verificationStatus: verification?.verificationStatus ?? domains.value[idx].verificationStatus,
        verified: isVerified,
        status: verification?.verificationStatus ?? domains.value[idx].status,
      };
    }
    return isVerified;
  };

  if (options.immediate !== false) {
    void list();
  }

  return {
    domains,
    isLoading,
    error,
    list,
    create,
    getDnsRecords,
    verify,
  };
}
