# WhatsApp Integration – Frequently Asked Questions (FAQ)

## ⚠️ IMPORTANT

This FAQ is designed to help customers understand the WhatsApp integration, its limitations, and associated risks.

**This document should be publicly accessible** (e.g., on the website, in the help center).

---

## 1️⃣ General Questions

### Q1.1: What WhatsApp integration does the platform use?

**A:** The platform uses an **unofficial WhatsApp API** with a **BYON (Bring Your Own Number)** model.

This means:
- You use your own WhatsApp number
- The platform connects to your WhatsApp account
- You own and control the number

**This is NOT the official WhatsApp Business Cloud API.**

---

### Q1.2: Why doesn't the platform use the official WhatsApp Business Cloud API?

**A:** The MVP uses an unofficial API to:
- **Reduce costs** (no Meta Business verification fees)
- **Launch faster** (no lengthy approval process)
- **Give you control** (you own the number)

**Future versions** may support the official API as an optional upgrade.

---

### Q1.3: Is this legal?

**A:** Using unofficial WhatsApp APIs is **against Meta's Terms of Service**.

However:
- Many businesses use unofficial APIs
- The risk is **account ban**, not legal action
- **You** (the customer) assume this risk, not the SaaS provider

**We strongly recommend reading our Terms of Service before using this feature.**

---

## 2️⃣ Account Ban Risks

### Q2.1: Can my WhatsApp account be banned?

**A:** **Yes.** WhatsApp may ban accounts that use unofficial APIs.

Bans can be:
- **Temporary** (24-48 hours)
- **Permanent** (account disabled forever)

---

### Q2.2: What increases the risk of being banned?

**A:** The following actions significantly increase ban risk:

1. **Spam**: Sending unsolicited messages
2. **Mass messaging**: Broadcasting to multiple customers
3. **Aggressive automation**: High-frequency automated messages
4. **User reports**: Customers marking your messages as spam

**Avoid these actions to minimize ban risk.**

---

### Q2.3: What happens if my account is banned?

**A:** If your WhatsApp account is banned:

1. **Your conversation history is preserved** in the platform
2. **Your sales, invoices, and customer data remain intact**
3. **You can replace the WhatsApp number** in Settings
4. **You can continue using the platform** with a new number

**No data is lost** (except for messages not yet synced).

---

### Q2.4: Can the SaaS provider recover my banned account?

**A:** **No.** The SaaS provider **cannot** recover banned WhatsApp accounts.

**You** are responsible for:
- Complying with Meta's Terms of Service
- Avoiding actions that increase ban risk
- Recovering or replacing your WhatsApp number

---

## 3️⃣ Features & Limitations

### Q3.1: What can I do with the WhatsApp integration?

**A:** In the MVP, you can:

✅ **Send invoices** to individual customers via WhatsApp  
✅ **View conversation history** with customers  
✅ **Track commercial state** (LEAD → SALE → INVOICED → PAID)  
✅ **Send manual 1-to-1 messages** to customers  

---

### Q3.2: What can I NOT do with the WhatsApp integration?

**A:** The MVP does **NOT** support:

❌ **Bots or automated responses** (chatbots, auto-replies)  
❌ **Mass messaging** (broadcast, campaigns, bulk messaging)  
❌ **Automated workflows** (trigger-based messaging, scheduled messages)  
❌ **WhatsApp Business Cloud API features** (message templates, interactive buttons)  

**These features may be added in future versions.**

---

### Q3.3: Can I send the same invoice to multiple customers?

**A:** **No.** Mass messaging is **strictly forbidden** in the MVP.

You must send invoices **one at a time** to individual customers.

**Attempting to send mass messages increases ban risk.**

---

### Q3.4: Can I automate invoice sending?

**A:** **No.** Automated messaging is **not supported** in the MVP.

You must **manually** send each invoice via WhatsApp.

**Automated workflows may be added in future versions.**

---

## 4️⃣ Usage Limits

### Q4.1: Are there limits on WhatsApp messages?

**A:** **Yes.** Your plan includes limits on:

- **Messages per month**
- **Conversations per month**
- **Invoices per month**

| Plan | Messages/Month | Conversations/Month | Invoices/Month |
|------|----------------|---------------------|----------------|
| **Starter** | 300 | 150 | 300 |
| **Pro** | 1,000 | 700 | 1,000 |
| **Growth** | 3,000 | Unlimited* | Unlimited* |

\* Fair Use Policy applies

---

### Q4.2: What happens if I exceed my message limit?

**A:** If you exceed your message limit:

1. **Message sending is blocked**
2. **You see an error message**
3. **You are prompted to upgrade your plan**

**No messages are sent** when the limit is exceeded.

---

### Q4.3: Can I buy extra messages?

**A:** **Not in the MVP.** Add-ons for extra messages are planned for future versions.

For now, you must **upgrade to a higher plan** to increase your limits.

---

## 5️⃣ Customer Consent

### Q5.1: Do I need customer consent to send WhatsApp messages?

**A:** **Yes.** You **must** obtain explicit consent from customers before sending WhatsApp messages.

The platform tracks consent status in the customer profile (`WhatsAppConsent` field).

---

### Q5.2: What happens if I try to message a customer without consent?

**A:** If a customer has **not** given WhatsApp consent:

1. **Message sending is blocked**
2. **You see an error message**
3. **You must update the customer's consent status** before sending

---

### Q5.3: How do I update customer consent?

**A:** You can update customer consent in the **Customer Profile** screen:

1. Go to **Customers**
2. Select the customer
3. Toggle **WhatsApp Consent** to **Yes**
4. Save changes

---

## 6️⃣ Technical Questions

### Q6.1: How do I connect my WhatsApp number?

**A:** To connect your WhatsApp number:

1. Go to **Settings** → **WhatsApp**
2. Enter your WhatsApp phone number
3. Follow the connection instructions
4. Verify the connection

**Note**: You must have an active WhatsApp account on this number.

---

### Q6.2: Can I use multiple WhatsApp numbers?

**A:** **Yes**, depending on your plan:

| Plan | WhatsApp Numbers |
|------|------------------|
| **Starter** | 1 |
| **Pro** | 2 |
| **Growth** | 3 |

---

### Q6.3: What happens to my conversation history if I change my WhatsApp number?

**A:** If you replace your WhatsApp number:

1. **Old conversation history is preserved** in the platform
2. **New conversations use the new number**
3. **No data is lost**

---

## 7️⃣ Billing & Plans

### Q7.1: Is WhatsApp messaging included in my plan?

**A:** **Yes**, but with limits.

Each plan includes a specific number of messages per month.

See [Q4.1](#q41-are-there-limits-on-whatsapp-messages) for details.

---

### Q7.2: Do I pay extra for WhatsApp messages?

**A:** **Not in the MVP.** Messages are included in your plan (up to the limit).

**Future versions** may offer add-ons for extra messages.

---

### Q7.3: What's the difference between Starter and Pro plans for WhatsApp?

**A:** The main differences are:

| Feature | Starter | Pro |
|---------|---------|-----|
| **Messages/Month** | 300 | 1,000 |
| **Conversations/Month** | 150 | 700 |
| **WhatsApp Numbers** | 1 | 2 |
| **Invoice Sending** | Manual PDF download | Integrated WhatsApp sending |

**Pro plan is recommended** for active businesses.

---

## 8️⃣ Troubleshooting

### Q8.1: Why can't I send a WhatsApp message?

**A:** Common reasons:

1. **WhatsApp number is not configured** → Go to Settings → WhatsApp
2. **Customer has not given consent** → Update customer consent
3. **Message limit exceeded** → Upgrade your plan
4. **WhatsApp number is inactive** → Verify your WhatsApp connection

---

### Q8.2: Why is my WhatsApp account banned?

**A:** Possible reasons:

1. **You sent spam or unsolicited messages**
2. **You sent mass messages** (broadcast, campaigns)
3. **You used aggressive automation**
4. **Customers reported your messages as spam**

**To avoid bans**: Only send messages to customers who have given consent, and avoid mass messaging.

---

### Q8.3: How do I replace a banned WhatsApp number?

**A:** To replace a banned WhatsApp number:

1. Go to **Settings** → **WhatsApp**
2. Click **Replace Number**
3. Enter your new WhatsApp phone number
4. Follow the connection instructions

**Your conversation history is preserved.**

---

## 9️⃣ Future Features

### Q9.1: Will the platform support the official WhatsApp Business Cloud API?

**A:** **Yes**, in future versions.

The official API will be offered as an **optional upgrade** for customers who:
- Want verified business accounts
- Need official message templates
- Require interactive buttons

**The unofficial API (BYON) will remain available** for cost-sensitive customers.

---

### Q9.2: Will the platform support bots and automation?

**A:** **Yes**, in future versions.

Planned features include:
- AI-powered chatbots
- Auto-replies
- Workflow automation
- Scheduled messages

**These features will only be available with the official WhatsApp Business Cloud API.**

---

### Q9.3: Will the platform support mass messaging?

**A:** **Yes**, in future versions, **with strict conditions**:

- Only for customers with **explicit opt-in**
- Only with the **official WhatsApp Business Cloud API**
- Only for **higher-tier plans** (to control costs)

**Mass messaging will NEVER be supported with the unofficial API.**

---

## 🔟 Legal & Compliance

### Q10.1: Who is responsible if my WhatsApp account is banned?

**A:** **You** (the customer) are responsible.

The SaaS provider:
- Does NOT guarantee account recovery
- Is NOT liable for bans or suspensions
- Does NOT compensate for losses resulting from bans

**You assume all risks** when using the WhatsApp integration.

---

### Q10.2: Do I need to comply with GDPR/CCPA?

**A:** **Yes**, if you operate in regions covered by these laws.

You are responsible for:
- Obtaining customer consent
- Providing privacy notices
- Allowing customers to opt out
- Deleting customer data upon request

**The platform provides tools** to help you comply (e.g., consent tracking).

---

### Q10.3: Where can I read the full Terms of Service?

**A:** The full Terms of Service are available at:

- **[Terms of Service](https://yoursaas.com/terms)**
- **In-app**: Settings → Legal → Terms of Service

**We strongly recommend reading the Terms of Service before using the WhatsApp integration.**

---

## 1️⃣1️⃣ Contact & Support

### Q11.1: How do I get help with WhatsApp integration?

**A:** You can get help by:

1. **Reading this FAQ**
2. **Contacting support**: [support@yoursaas.com]
3. **Visiting the help center**: [yoursaas.com/help]

---

### Q11.2: Can I request a new WhatsApp feature?

**A:** **Yes!** We welcome feature requests.

Please submit your request via:
- **Email**: [support@yoursaas.com]
- **In-app**: Settings → Help → Feature Request

---

## 1️⃣2️⃣ Document Status

**Version**: 1.0  
**Last Updated**: 2026-01-21  
**Status**: Official  
**Scope**: MVP Only

**This FAQ is the official customer-facing documentation for WhatsApp integration.**
