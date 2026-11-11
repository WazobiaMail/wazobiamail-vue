import { describe, it, expect, mock } from 'bun:test';
import { useDomains } from '../src';
import { WazobiaMail } from 'wazobiamail';

describe('useDomains Composable', () => {
  it('lists domains and verifies domain successfully', async () => {
    const mockDomain = {
      id: 'dom_123',
      domain: 'mail.example.com',
      isDefault: true,
      verificationStatus: 'pending',
      verified: false,
      status: 'pending',
      createdAt: '2026-11-09T00:00:00Z',
      updatedAt: '2026-11-09T00:00:00Z',
    };

    const mockClient = new WazobiaMail('wzbm_mock_key');
    mockClient.domains.list = mock(async () => ({
      success: true,
      message: 'OK',
      data: { items: [{ ...mockDomain }] },
    })) as any;

    mockClient.domains.create = mock(async (req: any) => ({
      success: true,
      message: 'Domain created',
      data: {
        domain: {
          id: 'dom_456',
          domain: req.domain,
          isDefault: false,
          verificationStatus: 'pending',
          verified: false,
          status: 'pending',
          createdAt: '2026-11-09T00:00:00Z',
          updatedAt: '2026-11-09T00:00:00Z',
        },
      },
    })) as any;

    mockClient.domains.verify = mock(async () => ({
      success: true,
      message: 'Domain verified',
      data: {
        verification: {
          domainId: 'dom_123',
          domain: 'mail.example.com',
          verificationStatus: 'verified',
          verifiedCount: 1,
          pendingCount: 0,
          checks: [],
        },
      },
    })) as any;

    const { domains, list, create, verify } = useDomains({
      client: mockClient,
      immediate: true,
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(domains.value.length).toBe(1);
    expect(domains.value[0].domain).toBe('mail.example.com');
    expect(domains.value[0].verified).toBe(false);

    // Verify domain
    const isVerified = await verify('dom_123');
    expect(isVerified).toBe(true);
    expect(domains.value[0].verified).toBe(true);
    expect(domains.value[0].status).toBe('verified');

    // Create domain
    const created = await create('notifications.example.com');
    expect(created.id).toBe('dom_456');
    expect(domains.value.length).toBe(2);
  });
});
