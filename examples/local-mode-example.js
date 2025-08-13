#!/usr/bin/env node

/**
 * Example: Using Spinal Local Mode in a Node.js Application
 * 
 * This example demonstrates how to integrate Spinal Observability SDK
 * in local mode to track API usage and costs without sending data to the cloud.
 */

import { configure, instrumentHTTP, instrumentOpenAI, tag, displayLocalData } from 'spinal-obs-node';

// Step 1: Configure Spinal in local mode
configure({
  mode: 'local',
  localStorePath: './example-spans.jsonl'
});

// Step 2: Enable instrumentation
instrumentHTTP();
instrumentOpenAI();

console.log('🚀 Spinal configured in local mode');
console.log('📁 Spans will be saved to: ./example-spans.jsonl\n');

// Example: User authentication flow
async function userSignupFlow(userData) {
  // Tag the entire user signup flow
  const signupTag = tag({
    aggregationId: 'user-signup-flow',
    tenant: 'example-app',
    userId: userData.email
  });

  try {
    console.log('👤 Processing user signup...');

    // Step 1: Validate user data
    const validationTag = tag({ aggregationId: 'data-validation' });
    await validateUserData(userData);
    validationTag.dispose();

    // Step 2: Check if user exists (HTTP request)
    const checkUserTag = tag({ aggregationId: 'user-existence-check' });
    const userExists = await checkUserExists(userData.email);
    checkUserTag.dispose();

    if (userExists) {
      throw new Error('User already exists');
    }

    // Step 3: Generate welcome message using AI
    const aiTag = tag({ 
      aggregationId: 'welcome-message-generation',
      'spinal.model': 'openai:gpt-4o-mini',
      'spinal.input_tokens': 120,
      'spinal.output_tokens': 60
    });
    
    const welcomeMessage = await generateWelcomeMessage(userData.name);
    aiTag.dispose();

    // Step 4: Send welcome email
    const emailTag = tag({ aggregationId: 'welcome-email-send' });
    await sendWelcomeEmail(userData.email, welcomeMessage);
    emailTag.dispose();

    console.log('✅ User signup completed successfully');
    return { success: true, message: welcomeMessage };

  } catch (error) {
    console.error('❌ User signup failed:', error.message);
    throw error;
  } finally {
    signupTag.dispose();
  }
}

// Simulated functions
async function validateUserData(userData) {
  await new Promise(resolve => setTimeout(resolve, 100));
  if (!userData.email || !userData.name) {
    throw new Error('Invalid user data');
  }
}

async function checkUserExists(email) {
  // Simulate HTTP request to user service
  const response = await fetch(`https://jsonplaceholder.typicode.com/users?email=${email}`);
  const users = await response.json();
  return users.length > 0;
}

async function generateWelcomeMessage(name) {
  // Simulate AI API call
  await new Promise(resolve => setTimeout(resolve, 200));
  return `Welcome to our platform, ${name}! We're excited to have you on board.`;
}

async function sendWelcomeEmail(email, message) {
  // Simulate email service call
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, message })
  });
  await response.json();
}

// Example: Chat API endpoint simulation
async function chatAPIEndpoint(userMessage) {
  const chatTag = tag({
    aggregationId: 'chat-api',
    userId: 'user-123',
    sessionId: 'session-456'
  });

  try {
    console.log('💬 Processing chat message...');

    // Simulate AI response generation
    const aiResponseTag = tag({
      aggregationId: 'ai-response-generation',
      'spinal.model': 'openai:gpt-4o-mini',
      'spinal.input_tokens': 200,
      'spinal.output_tokens': 150
    });

    await new Promise(resolve => setTimeout(resolve, 300));
    const response = `AI response to: "${userMessage}"`;
    aiResponseTag.dispose();

    // Simulate storing chat history
    const storageTag = tag({ aggregationId: 'chat-history-storage' });
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, response })
    });
    storageTag.dispose();

    console.log('✅ Chat message processed');
    return { response };

  } catch (error) {
    console.error('❌ Chat processing failed:', error.message);
    throw error;
  } finally {
    chatTag.dispose();
  }
}

// Main execution
async function runExample() {
  try {
    console.log('🎯 Running Spinal Local Mode Example\n');

    // Simulate user signup
    console.log('=== User Signup Flow ===');
    await userSignupFlow({
      name: 'John Doe',
      email: 'john@example.com'
    });

    console.log('\n=== Chat API Flow ===');
    await chatAPIEndpoint('Hello, how are you?');

    // Wait for spans to be exported
    console.log('\n⏳ Waiting for spans to be exported...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Display collected data
    console.log('\n📊 Collected Data Summary:');
    await displayLocalData({ format: 'summary' });

    console.log('\n📋 Recent Spans:');
    await displayLocalData({ limit: 5, format: 'table' });

  } catch (error) {
    console.error('❌ Example failed:', error);
  } finally {
    // Clean shutdown
    await import('spinal-obs-node').then(m => m.shutdown());
  }
}

// Run the example
runExample();
