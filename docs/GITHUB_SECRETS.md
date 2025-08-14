# GitHub Secrets Setup

This document explains how to set up GitHub secrets for the CI/CD pipeline.

## Required Secrets

### OPENAI_API_KEY

**Purpose**: Used for end-to-end tests that make real OpenAI API calls to verify the analytics functionality.

**How to set it up**:

1. **Get an OpenAI API Key**:
   - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key or use an existing one
   - Copy the API key (starts with `sk-`)

2. **Add to GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (e.g., `sk-1234567890abcdef...`)
   - Click **Add secret**

3. **Verify Setup**:
   - The secret will be available in CI as `${{ secrets.OPENAI_API_KEY }}`
   - E2E tests will automatically use this key when running

## CI Pipeline Flow

The CI pipeline now includes:

1. **Unit Tests** (`test` job):
   - Runs all unit tests
   - No external dependencies required
   - Must pass before E2E tests run

2. **E2E Tests** (`e2e-tests` job):
   - Runs end-to-end tests with real OpenAI API calls
   - Requires `OPENAI_API_KEY` secret
   - Tests actual API integration and cost calculations
   - Must pass before publishing

3. **Publish** (`publish` job):
   - Publishes to npm if all tests pass
   - Only runs on main branch pushes
   - Requires both unit and E2E tests to pass

## Security Notes

- **API Key Security**: The OpenAI API key is stored as a GitHub secret and is never exposed in logs
- **Cost Management**: E2E tests make minimal API calls (3 calls per test run) to keep costs low
- **Token Usage**: Tests use small prompts to minimize token consumption
- **Rate Limits**: Tests include appropriate delays to respect OpenAI rate limits

## Troubleshooting

### E2E Tests Failing

If E2E tests fail, check:

1. **API Key Valid**: Ensure the OpenAI API key is valid and has credits
2. **Rate Limits**: Check if you've hit OpenAI rate limits
3. **Network Issues**: Verify GitHub Actions can reach OpenAI API
4. **Secret Setup**: Confirm the secret is properly configured

### Missing Secret Error

If you see an error like:
```
❌ OPENAI_API_KEY environment variable is required for E2E tests
```

This means the `OPENAI_API_KEY` secret is not set up. Follow the setup steps above.

### Cost Monitoring

Monitor your OpenAI API usage:
- E2E tests use approximately 50-100 tokens per run
- With current pricing, this costs less than $0.01 per test run
- You can monitor usage in your [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## Alternative Setup

If you don't want to run E2E tests in CI:

1. **Skip E2E Tests**: Remove the `e2e-tests` job from `.github/workflows/ci.yml`
2. **Update Dependencies**: Change `needs: [test, e2e-tests]` back to `needs: test` in the publish job
3. **Local Testing**: Run E2E tests locally with `npm test -- tests/e2e/analytics-e2e.test.ts`

## Environment Variables

The E2E tests use these environment variables:

- `OPENAI_API_KEY`: Required for API calls
- `SPINAL_MODE`: Set to 'local' for testing
- `SPINAL_LOCAL_STORE_PATH`: Set to test-specific path

All other configuration is handled automatically by the test setup.
