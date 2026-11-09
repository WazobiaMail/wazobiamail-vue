import { describe, it, expect, mock } from 'bun:test';
import { useSendMail } from '../src';
import { WazobiaMail } from 'wazobiamail';

describe('useSendMail Composable', () => {
  it('manages reactive lifecycle states on successful message send', async () => {
    const mockClient = new WazobiaMail('wzbm_mock_key');
    mockClient.messages.send = mock(async () => ({
      success: true,
      message: 'Email dispatched successfully',
      data: {
        id: 'msg_test_123',
        status: 'queued',
        result: {
          trackingId: 'trk_abc',
          status: 'queued',
          recipients: 1,
        },
      },
    })) as any;

    let successCallbackFired = false;
    const { isLoading, isSuccess, error, data, send, reset } = useSendMail({
      client: mockClient,
      onSuccess: () => {
        successCallbackFired = true;
      },
    });

    expect(isLoading.value).toBe(false);
    expect(isSuccess.value).toBe(false);
    expect(error.value).toBeNull();
    expect(data.value).toBeNull();

    const promise = send({
      from: 'sender@example.com',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    });

    expect(isLoading.value).toBe(true);

    const result = await promise;

    expect(isLoading.value).toBe(false);
    expect(isSuccess.value).toBe(true);
    expect(error.value).toBeNull();
    expect(data.value?.data.result.trackingId).toBe('trk_abc');
    expect(result.data.result.trackingId).toBe('trk_abc');
    expect(successCallbackFired).toBe(true);

    // Test reset
    reset();
    expect(isLoading.value).toBe(false);
    expect(isSuccess.value).toBe(false);
    expect(data.value).toBeNull();
  });

  it('handles error state properly and triggers onError callback', async () => {
    const mockClient = new WazobiaMail('wzbm_mock_key');
    mockClient.messages.send = mock(async () => {
      throw new Error('API key rejected');
    }) as any;

    let errorCaughtInCallback = '';
    const { isLoading, isSuccess, error, data, send } = useSendMail({
      client: mockClient,
      onError: (err) => {
        errorCaughtInCallback = err.message;
      },
    });

    try {
      await send({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Failing Subject',
      });
      expect(true).toBe(false); // should not reach
    } catch (err: any) {
      expect(err.message).toBe('API key rejected');
    }

    expect(isLoading.value).toBe(false);
    expect(isSuccess.value).toBe(false);
    expect(error.value?.message).toBe('API key rejected');
    expect(data.value).toBeNull();
    expect(errorCaughtInCallback).toBe('API key rejected');
  });
});
