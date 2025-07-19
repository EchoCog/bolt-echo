/**
 * Quick validation script to test the new personas
 */

import { PromptLibrary } from './app/lib/common/prompt-library.js';

const mockOptions = {
  cwd: '/test',
  allowedHtmlElements: ['div', 'span', 'p'],
  modificationTagName: 'test-mod',
  supabase: {
    isConnected: true,
    hasSelectedProject: true,
    credentials: {
      anonKey: 'test-key',
      supabaseUrl: 'https://test.supabase.co',
    },
  },
};

console.log('🧪 Testing New Personas in Bolt Echo\n');

// Test each new persona
const personas = ['deep-tree-echo', 'marduk', 'jax-ceo'];

for (const persona of personas) {
  try {
    console.log(`Testing ${persona}:`);
    const prompt = PromptLibrary.getPropmtFromLibrary(persona, mockOptions);
    console.log(`  ✅ Generated ${prompt.length} character prompt`);
    console.log(`  ✅ Contains expected content: ${prompt.includes(persona.replace('-', ' ')) || prompt.includes(persona.toUpperCase())}`);
    console.log('');
  } catch (error) {
    console.log(`  ❌ Error: ${error}\n`);
  }
}

// Test custom prompt functionality
console.log('🔧 Testing Custom Prompt System:');
try {
  const testPrompt = {
    id: 'validation-test',
    label: 'Validation Test Prompt',
    description: 'Testing the custom prompt system',
    content: 'You are a validation test assistant.'
  };
  
  PromptLibrary.addCustomPrompt(testPrompt);
  console.log('  ✅ Added custom prompt');
  
  const retrieved = PromptLibrary.getPropmtFromLibrary('validation-test', mockOptions);
  console.log(`  ✅ Retrieved custom prompt: ${retrieved === testPrompt.content}`);
  
  PromptLibrary.removeCustomPrompt('validation-test');
  console.log('  ✅ Removed custom prompt');
  
} catch (error) {
  console.log(`  ❌ Error: ${error}`);
}

console.log('\n🎉 Persona validation complete!');