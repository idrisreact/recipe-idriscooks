# Stripe Webhooks Setup

## Local Development

For Stripe webhooks to work in local development, you need to run the Stripe CLI webhook forwarder.

### Setup Steps:

1. **Start your development server:**

   ```bash
   npm run dev
   ```

2. **In a separate terminal, start the Stripe webhook listener:**

   ```bash
   npm run stripe:listen
   ```

   This will forward Stripe webhook events from Stripe to your local server at `http://localhost:3000/api/stripe/webhook`.

3. **Important:** When you run `stripe listen`, it will output a webhook signing secret that starts with `whsec_`. You need to update your `.env` file with this secret:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Testing Webhooks

After setting up the webhook listener:

1. Make a test payment through your app
2. Watch the terminal running `stripe listen` - you should see webhook events being forwarded
3. Check your app logs to verify the webhook handler is processing events correctly

### Troubleshooting

**Issue:** Payment succeeds but user doesn't get access

- **Solution:** Make sure `stripe listen` is running in a separate terminal
- **Check:** Verify the `STRIPE_WEBHOOK_SECRET` in your `.env` matches the one from `stripe listen`

**Issue:** Webhook signature verification fails

- **Solution:** The webhook secret from `stripe listen` changes each time you restart it. Update your `.env` file with the new secret.

### Production Setup

For production, you need to:

1. Configure a webhook endpoint in your Stripe dashboard
2. Point it to: `https://yourdomain.com/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy the webhook signing secret from Stripe dashboard
5. Add it to your production environment variables as `STRIPE_WEBHOOK_SECRET`

### Manual Access Grant (Emergency)

If a payment succeeds but the webhook fails, you can manually grant access:

```bash
npx tsx scripts/grant-recipe-access.ts user@email.com
```

To verify access:

```bash
npx tsx scripts/check-user-access.ts user@email.com
```
