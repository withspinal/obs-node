# Testing OpenAI Token Capture

This document explains how to test the OpenAI token capture functionality with real API calls.

## Prerequisites

1. **OpenAI API Key**: You need a valid OpenAI API key
2. **Node.js**: Version 16 or higher
3. **Build the project**: Run `npm run build` first

## Setting up your API key

Create a `.env` file in the project root:

```bash
# .env
OPENAI_API_KEY=your_api_key_here
```

⚠️ **Security Note**: Never commit your `.env` file to version control. The `.env` file is already added to `.gitignore`.

## Running the real API test

```bash
node test-real-openai.js
```

This will:
1. Load your API key from the `.env` file
2. Make a real API call to OpenAI
3. Capture the token usage from the response
4. Display the telemetry data with token counts
5. Show cost estimates

## Expected Output

You should see output like:
```
🧪 Testing with real OpenAI API...

📤 Making real OpenAI API call...
✅ OpenAI API call completed
📊 API Response usage: { prompt_tokens: 12, completion_tokens: 3, total_tokens: 15 }
🤖 Response: Hello

⏳ Waiting for spans to be exported...

📊 Collected telemetry data:
[
  {
    "name": "openai-api-call",
    "attributes": {
      "spinal.model": "openai:gpt-4o-mini",
      "spinal.input_tokens": 12,
      "spinal.output_tokens": 3,
      "spinal.total_tokens": 15
    }
  }
]

📋 Summary:
{
  "totalSpans": 1,
  "uniqueTraces": 1,
  "spanTypes": { "openai-api-call": 1 },
  "estimatedCost": 0.0018
}
```

## What gets captured

The SDK automatically captures:
- **Model used**: `spinal.model` (e.g., "openai:gpt-4o-mini")
- **Input tokens**: `spinal.input_tokens` (prompt tokens)
- **Output tokens**: `spinal.output_tokens` (completion tokens)
- **Total tokens**: `spinal.total_tokens`
- **Cost estimate**: Calculated based on the model and token usage

## Troubleshooting

### "OPENAI_API_KEY not found"
Make sure you've created a `.env` file with your API key:
```bash
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

### "OpenAI API error"
Check that your API key is valid and has sufficient credits.

### No token data in spans
This indicates the response parsing isn't working. Check the console output for any errors.

## Cleanup

After testing, you can remove the test files:
```bash
rm test-real-openai.js real-openai-test.jsonl
```

The test files are already in `.gitignore` so they won't be committed accidentally.
