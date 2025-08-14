#!/usr/bin/env node

// Test script for real OpenAI API token capture
import { configure, instrumentOpenAI, displayLocalData } from './dist/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value && !key.startsWith('#')) {
          envVars[key.trim()] = value.replace(/^["']|["']$/g, ''); // Remove quotes
        }
      }
    });
    
    return envVars;
  } catch {
    return {};
  }
}

const env = loadEnv();
const openaiApiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.log('❌ OPENAI_API_KEY not found');
  console.log('💡 Create a .env file with: OPENAI_API_KEY=your_api_key_here');
  console.log('   Or set environment variable: export OPENAI_API_KEY=your_api_key_here');
  process.exit(1);
}

// Configure Spinal in local mode
configure({
  mode: 'local',
  localStorePath: './openai-test-spans.jsonl'
});

// Instrument OpenAI
instrumentOpenAI();

console.log('🧪 Testing OpenAI Token Capture with Real API\n');

async function testOpenAI() {
  try {
    console.log('📤 Making OpenAI API call...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say hello in one word' }],
        max_tokens: 10
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ OpenAI API call completed');
    console.log('📊 API Response usage:', data.usage);
    console.log('🤖 Response:', data.choices[0]?.message?.content);
    
    // Wait for spans to be exported
    console.log('\n⏳ Waiting for spans to be exported...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Display the collected data
    console.log('\n📊 Collected telemetry data:');
    await displayLocalData({ format: 'json' });
    
    console.log('\n📋 Summary:');
    await displayLocalData({ format: 'summary' });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await import('./dist/index.js').then(m => m.shutdown());
  }
}

testOpenAI();
