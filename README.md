# WazobiaMail Vue 3 SDK

[![npm version](https://img.shields.io/npm/v/wazobiamail-vue.svg?style=flat-square)](https://www.npmjs.com/package/wazobiamail-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883.svg?style=flat-square)](https://vuejs.org/)

Official Vue 3 integration package for [WazobiaMail](https://wazobiamail.com). Provides reactive composables, dependency injection plugins, and pre-built state management for email dispatch, domain verification, deliverability analysis, and Enterprise headless inboxes.

---

## Features

- ⚡ **Native Vue 3 Reactivity**: Fully reactive composables with `ref`, `computed`, and automatic lifecycle cleanup.
- 📦 **Plugin & Injection**: `createWazobiaMail` plugin for global app injection via `app.use()`.
- 📬 **Enterprise Headless Inbox**: Reactive `useMailbox` composable with pagination, unread filters, optimistic deletion, and auto-polling.
- 🚀 **Zero-Config Form Submission**: Reactive `useSendMail` with `isLoading`, `isSuccess`, `error`, and idempotency support.
- 🛡️ **Deliverability Tools**: Pre-flight spam check and DNS records verification composables.
- 🧩 **100% Strict TypeScript**: Complete type inference and autocompletion for all models and API responses.

---

## Installation

Install via npm, bun, or pnpm:

```bash
bun add wazobiamail-vue wazobiamail
# or
npm install wazobiamail-vue wazobiamail
```

---

## Quickstart

### 1. Register Plugin (`main.ts`)

```typescript
import { createApp } from 'vue';
import { createWazobiaMail } from 'wazobiamail-vue';
import App from './App.vue';

const app = createApp(App);

app.use(createWazobiaMail({
  apiKey: import.meta.env.VITE_WAZOBIA_API_KEY,
}));

app.mount('#app');
```

---

### 2. Sending Emails with `useSendMail`

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useSendMail } from 'wazobiamail-vue';

const recipient = ref('');
const subject = ref('');
const content = ref('');

const { isLoading, isSuccess, error, send } = useSendMail({
  onSuccess: (data) => {
    alert(`Email queued! Tracking ID: ${data.data.result.trackingId}`);
  },
});

const handleSubmit = async () => {
  await send({
    from: 'hello@yourdomain.com',
    to: recipient.value,
    subject: subject.value,
    html: `<p>${content.value}</p>`,
  });
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="recipient" placeholder="Recipient" required />
    <input v-model="subject" placeholder="Subject" required />
    <textarea v-model="content" placeholder="Content"></textarea>

    <button :disabled="isLoading">
      {{ isLoading ? 'Sending...' : 'Send Email' }}
    </button>

    <p v-if="isSuccess" class="success">Email sent successfully!</p>
    <p v-if="error" class="error">{{ error.message }}</p>
  </form>
</template>
```

---

### 3. Enterprise Mailbox Inbox with `useMailbox`

Read, poll, and manage messages inside a hosted mailbox:

```vue
<script setup lang="ts">
import { useMailbox } from 'wazobiamail-vue';

const {
  messages,
  pagination,
  isLoading,
  refresh,
  nextPage,
  prevPage,
  deleteMessage,
} = useMailbox('mb_live_12345', {
  pollInterval: 15000, // Poll every 15 seconds; auto-stopped on unmount
});
</script>

<template>
  <div class="inbox">
    <h2>Mailbox Inbox</h2>
    <button @click="refresh" :disabled="isLoading">Refresh</button>

    <ul>
      <li v-for="msg in messages" :key="msg.id">
        <strong>{{ msg.subject }}</strong> - <span>{{ msg.from }}</span>
        <button @click="deleteMessage(msg.id)">Delete</button>
      </li>
    </ul>

    <div class="pagination">
      <button @click="prevPage" :disabled="!pagination?.hasPrev">Previous</button>
      <span>Page {{ pagination?.page }} of {{ pagination?.totalPages }}</span>
      <button @click="nextPage" :disabled="!pagination?.hasNext">Next</button>
    </div>
  </div>
</template>
```

---

### 4. Sending Domains & DNS Verification with `useDomains`

```vue
<script setup lang="ts">
import { useDomains } from 'wazobiamail-vue';

const { domains, isLoading, verify } = useDomains();
</script>

<template>
  <div>
    <h2>Sending Domains</h2>
    <div v-for="domain in domains" :key="domain.id">
      <p>{{ domain.domain }} — Status: {{ domain.status }}</p>
      <button v-if="!domain.verified" @click="verify(domain.id)">
        Verify DNS
      </button>
    </div>
  </div>
</template>
```

---

## License

MIT License &copy; 2026 WazobiaMail
