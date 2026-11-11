import { describe, it, expect, mock } from 'bun:test';
import { useMailbox } from '../src';
import { WazobiaMail } from 'wazobiamail';

describe('useMailbox Composable', () => {
  it('loads mailbox messages and handles optimistic deletion', async () => {
    const mockMessages = [
      {
        id: 'msg_1',
        messageId: 'header_msg_1',
        mailboxId: 'mb_test',
        subject: 'First Email',
        from: 'sender1@example.com',
        to: ['user@example.com'],
        date: '2026-11-09T00:00:00Z',
        isRead: false,
        hasAttachments: false,
        sizeBytes: 1024,
      },
      {
        id: 'msg_2',
        messageId: 'header_msg_2',
        mailboxId: 'mb_test',
        subject: 'Second Email',
        from: 'sender2@example.com',
        to: ['user@example.com'],
        date: '2026-11-09T01:00:00Z',
        isRead: true,
        hasAttachments: true,
        sizeBytes: 2048,
      },
    ];

    const mockClient = new WazobiaMail('wzbm_mock_key');
    mockClient.mailboxes.messages.list = mock(async () => ({
      success: true,
      message: 'OK',
      data: {
        items: [...mockMessages],
        total: 2,
        page: 1,
        limit: 20,
      },
    })) as any;

    mockClient.mailboxes.messages.delete = mock(async () => ({
      success: true,
      message: 'Message deleted',
      data: { success: true },
    })) as any;

    const { messages, pagination, deleteMessage } = useMailbox('mb_test', {
      client: mockClient,
      immediate: true,
    });

    // Wait for immediate async tick
    await new Promise((r) => setTimeout(r, 10));

    expect(messages.value.length).toBe(2);
    expect(messages.value[0].subject).toBe('First Email');
    expect(pagination.value?.totalItems).toBe(2);
    expect(pagination.value?.hasNext).toBe(false);

    // Delete message msg_1
    await deleteMessage('msg_1');

    expect(messages.value.length).toBe(1);
    expect(messages.value[0].id).toBe('msg_2');
    expect(mockClient.mailboxes.messages.delete).toHaveBeenCalledWith('mb_test', 'msg_1');
  });

  it('manages polling timers cleanly', () => {
    const mockClient = new WazobiaMail('wzbm_mock_key');
    mockClient.mailboxes.messages.list = mock(async () => ({
      success: true,
      message: 'OK',
      data: { items: [], total: 0, page: 1, limit: 20 },
    })) as any;

    const { startPolling, stopPolling } = useMailbox('mb_test', {
      client: mockClient,
      immediate: false,
    });

    // Starting and stopping polling without errors
    startPolling(5000);
    stopPolling();
  });
});
