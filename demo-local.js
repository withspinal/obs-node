#!/usr/bin/env node

// Demo script showing Spinal local mode functionality
import { configure, instrumentHTTP, instrumentOpenAI, tag, displayLocalData } from './dist/index.js';

// Configure Spinal in local mode
configure({
  mode: 'local',
  localStorePath: './demo-spans.jsonl'
});

// Instrument HTTP and OpenAI
instrumentHTTP();
instrumentOpenAI();

console.log('🚀 Spinal configured in local mode');
console.log('📁 Spans will be saved to: ./demo-spans.jsonl\n');

// Simulate some API calls with tags
async function simulateAPIUsage() {
  console.log('📡 Simulating API usage...\n');
  
  // Tag for user flow
  const userFlowTag = tag({ aggregationId: 'demo-user-flow', tenant: 'demo' });
  
  try {
    // Make actual HTTP requests to generate spans
    console.log('🌐 Making HTTP requests...');
    
    // Request 1: JSONPlaceholder API
    const response1 = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    await response1.json();
    console.log('✅ HTTP request 1 completed');
    
    // Request 2: Another endpoint
    const response2 = await fetch('https://jsonplaceholder.typicode.com/users/1');
    await response2.json();
    console.log('✅ HTTP request 2 completed');
    
    // Simulate OpenAI-like request (this won't actually call OpenAI, but will create spans)
    const openaiTag = tag({ 
      aggregationId: 'openai-call', 
      model: 'gpt-4o-mini',
      'spinal.input_tokens': 150,
      'spinal.output_tokens': 75,
      'spinal.model': 'openai:gpt-4o-mini'
    });
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 200));
    openaiTag.dispose();
    console.log('✅ OpenAI simulation completed');
    
  } catch (error) {
    console.error('❌ Error during API calls:', error.message);
  } finally {
    // Clean up tags
    userFlowTag.dispose();
  }
  
  console.log('✅ API usage simulation complete\n');
}

// Run the demo
async function runDemo() {
  try {
    await simulateAPIUsage();
    
    // Wait a moment for spans to be exported
    console.log('⏳ Waiting for spans to be exported...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📊 Displaying collected local data:\n');
    await displayLocalData({ limit: 10, format: 'table' });
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    // Clean shutdown
    await import('./dist/index.js').then(m => m.shutdown());
  }
}

runDemo();
