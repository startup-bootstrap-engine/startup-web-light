# API Middleware Setup Instructions

Follow these steps to complete the API middleware setup for PixelPerfect.

## Prerequisites

- Supabase account with an active project
- Access to your Supabase service role key

## Step 1: Configure Environment Variables

Create or update your `.env.local` file:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Add the following to `.env.local`:

```bash
# Supabase Service Role Key (from Supabase Dashboard > Settings > API)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# CORS (for development, use *; for production, use your domain)
ALLOWED_ORIGIN=*
```

### Finding Your Supabase Service Role Key

1. Go to [app.supabase.com](https://app.supabase.com/)
2. Select your project
3. Navigate to Settings → API
4. Under "Project API keys", copy the `service_role` key
5. ⚠️ **Keep this secret!** Never commit it to version control

## Step 2: Verify Setup

Start the development server:

```bash
yarn dev
```

### Test 1: Health Check (Public Route)

```bash
curl http://localhost:3000/api/health
```

**Expected**: 200 OK with response body

**Verify**:

- Response includes security headers
- `X-RateLimit-Remaining` header is present

### Test 2: Protected Route Without Auth

```bash
curl http://localhost:3000/api/protected/example
```

**Expected**: 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Valid authentication token required"
}
```

### Test 3: Rate Limiting

```bash
# Send 15 requests rapidly
for i in {1..15}; do
  curl -s http://localhost:3000/api/health
  echo "Request $i"
done
```

**Expected**:

- First 10 requests: 200 OK
- After 10 requests: 429 Too Many Requests

```json
{
  "error": "Too many requests. Please try again later."
}
```

### Test 4: Protected Route With Auth (Optional)

If you have a valid Supabase JWT token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/protected/example
```

**Expected**: 200 OK with user data

## Step 3: Production Configuration

### For Cloudflare Pages Deployment

Add environment variables in Cloudflare Dashboard:

1. Go to Workers & Pages → Your project → Settings → Environment Variables
2. Add for Production:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ALLOWED_ORIGIN=https://yourdomain.com
```

### Update `.env.prod`

```bash
# Production CORS - IMPORTANT: Use your actual domain!
ALLOWED_ORIGIN=https://yourdomain.com

# Other production variables remain the same
```

## Step 4: Run Tests

```bash
# Run API integration tests
yarn test:api

# Or run all tests
yarn test:all
```

**Expected**: Most tests should pass. Some tests require a valid test token and will be skipped.

## Troubleshooting

### "Missing Supabase environment variables" Error

**Cause**: `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set

**Solution**: Ensure these are in your `.env.local` file

### CORS Errors After Deployment

**Cause**: `ALLOWED_ORIGIN` not set or set incorrectly

**Solution**:

1. Set `ALLOWED_ORIGIN=https://yourdomain.com` (no trailing slash)
2. Redeploy
3. Clear browser cache

## Rate Limiting

The middleware uses a simple **in-memory rate limiter**:

- **Authenticated routes**: 50 requests per 10 seconds per user
- **Public routes**: 10 requests per 10 seconds per IP
- **No external services required**
- **Automatic cleanup** to prevent memory leaks

### Multi-Instance Deployments

⚠️ **Note**: The in-memory rate limiter works great for single-instance deployments. For multi-instance deployments (e.g., Cloudflare with multiple edge locations), each instance has its own memory, so limits are per-instance.

If you need global rate limiting across all instances, consider:
- Cloudflare KV
- Cloudflare Durable Objects
- Redis (self-hosted or managed)

## Next Steps

1. **Review the documentation**: Read `docs/guides/api-middleware.md` for detailed usage
2. **Create your first protected route**: Use `app/api/protected/example/route.ts` as a template
3. **Customize rate limits**: Edit `src/lib/rateLimit.ts` to adjust limits
4. **Add custom security headers**: Modify `middleware.ts` as needed

## Security Checklist

Before deploying to production:

- [ ] `ALLOWED_ORIGIN` is set to your actual domain (not `*`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is kept secret and not in version control
- [ ] Rate limits are appropriate for your expected traffic
- [ ] Security headers are configured correctly for your app
- [ ] CORS allows only trusted origins
- [ ] All tests pass (`yarn test:api`)

## Support

For questions or issues:

- Check `docs/guides/api-middleware.md` for detailed documentation
- Review `docs/PRDs/api-middleware-prd.md` for architecture details
- Examine test files in `tests/api/middleware.spec.ts` for examples
