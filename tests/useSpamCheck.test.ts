import { describe, it, expect, mock } from 'bun:test';
import { useSpamCheck } from '../src';
import { WazobiaMail } from 'wazobiamail';

describe('useSpamCheck Composable', () => {
  it('performs deliverability analysis and stores reactive result', async () => {
    const mockClient = new WazobiaMail('wzbm_mock_key');
    mockClient.messages.spamCheck = mock(async () => ({
      success: true,
      message: 'Analysis complete',
      data: {
        score: 9.5,
        verdict: 'PASS',
        recommendations: ['Add DKIM DNS record for 100% deliverability'],
      },
    })) as any;

    const { isLoading, result, error, check, reset } = useSpamCheck(mockClient);

    expect(isLoading.value).toBe(false);
    expect(result.value).toBeNull();
    expect(error.value).toBeNull();

    const data = await check({
      from: 'newsletter@example.com',
      subject: 'Weekly Digest',
      html: '<p>Weekly news</p>',
    });

    expect(isLoading.value).toBe(false);
    expect(data.score).toBe(9.5);
    expect(result.value?.verdict).toBe('PASS');
    expect(result.value?.recommendations.length).toBe(1);

    reset();
    expect(result.value).toBeNull();
  });
});
