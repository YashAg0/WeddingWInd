# WeddingWithIndia — Operations & Developer Troubleshooting Manual

This manual provides diagnostic solutions for common runtime, database, authentication, build, and deployment issues on **WeddingWithIndia**.

---

## 1. Database & Connection Issues

### Issue 1: Database Connection Timeout / Max Client Connections Reached
- **Symptom**: `PrismaClientInitializationError: Timed out fetching a new connection from the connection pool`.
- **Cause**: Serverless Lambdas opening direct PostgreSQL connections without PgBouncer session pooling.
- **Solution**: Ensure your `DATABASE_URL` uses the Supabase PgBouncer pooler port (`6543`) with `pgbouncer=true&connection_limit=1`.

### Issue 2: Offline Mock Data Fallback Triggered
- **Symptom**: Console logs show `[getDbUser] PostgreSQL unavailable — returning transient fallback user`.
- **Cause**: Database network unreachable or incorrect connection string.
- **Solution**: Execute `npm run validate:db` to ping database. Check network status and local credentials.

---

## 2. Authentication & Authorization Issues

### Issue 3: Middleware Duplicate Export Error
- **Symptom**: Next.js build error: `Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected`.
- **Cause**: Next.js 16 expects `proxy.ts` when proxy mode is enabled.
- **Solution**: Delete `middleware.ts` and keep `proxy.ts` as the single edge routing source.

### Issue 4: Admin Access Blocked ("FORBIDDEN: You do not have permissions...")
- **Symptom**: Admin dashboard returns 403 Forbidden.
- **Cause**: Current Clerk user does not have `role: "ADMIN"` assigned in PostgreSQL.
- **Solution**: Run `node scripts/bootstrap-admin.js <your-email>` to promote your account to `ADMIN`.

---

## 3. Stripe & Payment Issues

### Issue 5: Webhook Signature Verification Failed
- **Symptom**: `/api/webhooks/stripe` returns 400 `Webhook Error: No signature`.
- **Cause**: Mismatched `STRIPE_WEBHOOK_SECRET` key or raw body parsing issue.
- **Solution**: Verify `STRIPE_WEBHOOK_SECRET` in `.env` matching your Stripe CLI or hosting dashboard webhook signing secret.
