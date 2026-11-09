# WazobiaMail Vue 3 SDK

[![npm version](https://img.shields.io/npm/v/wazobiamail-vue.svg?style=flat-square)](https://www.npmjs.com/package/wazobiamail-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883.svg?style=flat-square)](https://vuejs.org/)
[![Docs](https://img.shields.io/badge/Docs-docs.wazobiamail.com-blueviolet.svg?style=flat-square)](https://docs.wazobiamail.com)

Official Vue 3 integration package for [WazobiaMail](https://wazobiamail.com). Provides reactive composables, dependency injection plugins, and pre-built state management for email dispatch, domain verification, deliverability analysis, and Enterprise headless inboxes.

> 📚 **Official Platform Documentation**: Visit [docs.wazobiamail.com](https://docs.wazobiamail.com) for exhaustive API references, architecture guides, DNS setup walkthroughs, and webhook configurations.

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

### 3. Delivery Tracking, Stats, Read Receipts & Click Receipts

Every transactional email dispatched via `useSendMail` returns a unique tracking ID (`data.data.result.trackingId`). WazobiaMail automatically tracks:

- **Read Receipts (Open Tracking)**: An invisible 1x1 tracking pixel records when recipients open your email, capturing timestamp, IP geolocation, user-agent, and open counts.
- **Click Receipts (Link Tracking)**: Links in HTML content are automatically rewritten to your tracking domain, logging each click event, recipient, destination URL, and click counts.
- **Delivery Lifecycle**: Real-time status progression from `queued` ➔ `sent` ➔ `delivered` ➔ `opened` ➔ `clicked` ➔ `bounced`.

You can inspect tracking details directly with `useWazobiaMail()`:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useWazobiaMail } from 'wazobiamail-vue';

const client = useWazobiaMail();
const trackingData = ref<any>(null);

const checkReceipt = async (trackingId: string) => {
  const response = await client.messages.getTracked(trackingId);
  trackingData.value = response.data;
};
</script>

<template>
  <div v-if="trackingData" class="receipt-card">
    <h3>Delivery Receipt: {{ trackingData.status }}</h3>
    <p>Delivered: {{ trackingData.deliveredAt }}</p>
    <p>Read Receipts (Opens): {{ trackingData.openCount }}</p>
    <p>Click Receipts (Clicks): {{ trackingData.clickCount }}</p>
  </div>
</template>
```

---

### 4. Enterprise Mailbox Inbox with `useMailbox`

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

### 5. Sending Domains & DNS Verification with `useDomains`

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

## Subdomain vs. Apex / Root Domain Architecture & Edge Cases

When configuring custom domains for transactional sending, choosing between a **subdomain** (e.g. `mail.yourdomain.com` or `send.yourdomain.com`) and an **apex/root domain** (`yourdomain.com`) is a critical architectural decision.

### 1. Why Using a Subdomain is Recommended (Root Domain NOT Used)

In production environments, **we strongly recommend using a dedicated sending subdomain** rather than your root/apex domain:

- **Preserve Existing Business Email (Google Workspace / Microsoft 365):**
  If your root domain (`yourdomain.com`) already receives corporate email via Google Workspace or Microsoft 365, adding MX records pointing to WazobiaMail at the root apex `@` will **break your existing company email inbox routing**. Using `mail.yourdomain.com` isolates transactional email routing completely.
- **Isolate Sender Reputation:**
  Transactional emails (password resets, invoices, OTP codes) have high engagement and deliverability requirements. Sending from a subdomain (`mail.yourdomain.com`) ensures that any accidental marketing spam complaints won't degrade your corporate employee email deliverability.
- **Avoid SPF 10-Lookup Limit Exhaustion (RFC 7208):**
  SPF records have a strict limit of 10 DNS lookups. Root domains often accumulate multiple SaaS providers (Google, Zendesk, Salesforce, HubSpot). A dedicated subdomain gives WazobiaMail its own clean, independent SPF record without lookup count contention.

---

### 2. DNS Hostnames When Root Domain is NOT Used

When verifying a subdomain like `mail.yourdomain.com`, ensure you configure your DNS provider (Cloudflare, Route53, Namecheap, GoDaddy) with the correct hostnames:

| Record Type | Host / Name (if domain is `mail.yourdomain.com`) | Target / Value | Notes |
| :--- | :--- | :--- | :--- |
| **TXT (SPF)** | `mail` (or `mail.yourdomain.com`) | `v=spf1 include:_spf.wazobiamail.com ~all` | **Do NOT** place on `@` root |
| **TXT (DKIM)** | `wzbm._domainkey.mail` | `k=rsa; p=MIGfMA0GCSqGSIb3...` | Selector is scoped to the subdomain |
| **MX (Hosted)**| `mail` (priority 10 / 20) | `mx1.wazobiamail.com` / `mx2.wazobiamail.com` | Only required if receiving mail or hosted inboxes |
| **CNAME (Tracking)** | `email.mail` | `trk.wazobiamail.com` | Used for custom branded click/open tracking |
| **TXT (DMARC)** | `_dmarc.mail` (or fallback to `_dmarc`) | `v=DMARC1; p=reject; rua=mailto:dmarc@...` | Resolvers fall back to apex `_dmarc` if omitted |

---

### 3. Critical Edge Cases & Troubleshooting

#### ⚠️ Edge Case 1: `UnverifiedSenderDomain` (HTTP 422 / 403)
- If you verified `mail.yourdomain.com` in WazobiaMail, your `from` address **must** match that subdomain:
  - ✅ **Valid**: `from: 'Acme <billing@mail.yourdomain.com>'`
  - ❌ **Invalid**: `from: 'Acme <billing@yourdomain.com>'` (Fails because apex `yourdomain.com` is unverified)
- Attempting to send from an unverified parent domain will return a validation error.

#### 💡 Edge Case 2: Reply-To Decoupling (Best Practice)
- You can send from the verified subdomain while routing customer replies to your corporate root domain mailbox:
  ```vue
  <script setup lang="ts">
  import { useSendMail } from 'wazobiamail-vue';
  const { send } = useSendMail();

  const handleSend = () => {
    send({
      from: 'Acme Orders <orders@mail.yourdomain.com>', // Verified sending subdomain
      replyTo: 'support@yourdomain.com',               // Your corporate inbox on Google/Outlook
      to: 'customer@example.com',
      subject: 'Your Receipt',
      html: '<p>Thank you for your order!</p>',
    });
  };
  </script>
  ```
- This gives you the deliverability benefits of a dedicated sending subdomain while preserving user-friendly reply handling.

#### ☁️ Edge Case 3: Cloudflare Proxy Status (Grey Cloud vs. Orange Cloud)
- **Problem**: In Cloudflare DNS, leaving the proxy enabled (**Orange Cloud**) for mail or tracking records breaks SMTP traffic, DNS verification, and SSL certificate issuance.
- **Solution**: Always toggle Cloudflare records to **"DNS only" (Grey Cloud / Proxied: Off)** for all WazobiaMail SPF, DKIM, MX, and tracking records.

#### ⏳ Edge Case 4: Negative DNS Caching (SOA Minimum TTL Delay)
- If you trigger `verify(domain.id)` immediately after publishing DNS records before they propagate, recursive resolvers may cache the negative response (`NXDOMAIN` or empty record).
- Subsequent verification checks will continue to fail until the DNS TTL expires (often 5 to 60 minutes).
- **Tip**: Test propagation with `dig TXT mail.yourdomain.com` or `dig TXT wzbm._domainkey.mail.yourdomain.com +trace` before triggering verification.

#### 🛡️ Edge Case 5: DMARC Subdomain Policy (`sp=`) Inheritance
- If your apex domain (`yourdomain.com`) has a DMARC record with `sp=reject` or `sp=quarantine`:
  - Any subdomain (e.g. `mail.yourdomain.com`) automatically inherits that rejection policy unless it defines its own `_dmarc.mail.yourdomain.com` record.
  - If SPF or DKIM alignment fails on the subdomain, recipient mail servers (Gmail, Yahoo, Outlook) will reject or spam-folder your emails immediately. Ensure both SPF and DKIM pass before sending production traffic.

#### 📬 Edge Case 6: Headless Inboxes & Hosted Mailboxes on Subdomains
- When provisioning hosted mailboxes (`useMailbox`), the mailbox address belongs to the specific verified domain (e.g. `support@mail.yourdomain.com`).
- Inbound receiving requires the MX records for that exact subdomain to point to WazobiaMail. Do not point root domain MX to WazobiaMail if you have existing email services there.

#### 🔁 Edge Case 7: Network Timeouts & Idempotency
- If an HTTP request times out due to transient network issues, pass `idempotencyKey` to `send(...)`. Retrying with the same key returns the existing tracking receipt without duplicate sending.

---

## License

MIT License &copy; 2026 WazobiaMail
