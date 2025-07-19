#!/usr/bin/env node

/**
 * Demo script showing the extended Prompt Library functionality
 * This script demonstrates the new personas and configuration system
 */

import { PromptLibrary } from '../app/lib/common/prompt-library.js';

// Mock prompt options for demonstration
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

console.log('=== Bolt Echo Prompt Library Extension Demo ===\n');

// 1. Show all available prompts (built-in + custom)
console.log('1. Available Prompts:');
const allPrompts = PromptLibrary.getList();
allPrompts.forEach(prompt => {
  const type = prompt.isCustom ? '[CUSTOM]' : '[BUILT-IN]';
  console.log(`   ${type} ${prompt.id}: ${prompt.label}`);
  console.log(`      ${prompt.description}`);
});

// 2. Demonstrate new personas
console.log('\n2. Testing New Personas:');

console.log('\n   Deep Tree Echo Persona:');
try {
  const echoPrompt = PromptLibrary.getPropmtFromLibrary('deep-tree-echo', mockOptions);
  console.log(`   ✓ Generated prompt (${echoPrompt.length} characters)`);
  console.log(`   ✓ Contains persona name: ${echoPrompt.includes('Deep Tree Echo')}`);
} catch (error) {
  console.log(`   ✗ Error: ${error}`);
}

console.log('\n   Marduk Persona:');
try {
  const mardukPrompt = PromptLibrary.getPropmtFromLibrary('marduk', mockOptions);
  console.log(`   ✓ Generated prompt (${mardukPrompt.length} characters)`);
  console.log(`   ✓ Contains persona name: ${mardukPrompt.includes('Marduk')}`);
} catch (error) {
  console.log(`   ✗ Error: ${error}`);
}

console.log('\n   JAX CEO Persona:');
try {
  const jaxPrompt = PromptLibrary.getPropmtFromLibrary('jax-ceo', mockOptions);
  console.log(`   ✓ Generated prompt (${jaxPrompt.length} characters)`);
  console.log(`   ✓ Contains persona name: ${jaxPrompt.includes('JAX CEO')}`);
} catch (error) {
  console.log(`   ✗ Error: ${error}`);
}

// 3. Demonstrate custom prompt management
console.log('\n3. Custom Prompt Management:');

const customPrompt = {
  id: 'demo-assistant',
  label: 'Demo Assistant',
  description: 'A helpful demo assistant for testing',
  content: 'You are a helpful demo assistant created for testing the prompt library system.'
};

try {
  // Add custom prompt
  PromptLibrary.addCustomPrompt(customPrompt);
  console.log('   ✓ Added custom prompt:', customPrompt.id);

  // Retrieve custom prompt
  const retrieved = PromptLibrary.getCustomPrompt('demo-assistant');
  console.log('   ✓ Retrieved custom prompt:', retrieved?.label);

  // Use custom prompt
  const content = PromptLibrary.getPropmtFromLibrary('demo-assistant', mockOptions);
  console.log('   ✓ Generated content from custom prompt');

  // Update custom prompt
  PromptLibrary.updateCustomPrompt('demo-assistant', {
    description: 'Updated description for demo assistant'
  });
  console.log('   ✓ Updated custom prompt description');

} catch (error) {
  console.log(`   ✗ Error: ${error}`);
}

// 4. Demonstrate import/export functionality
console.log('\n4. Import/Export Functionality:');

try {
  // Export custom prompts
  const exported = PromptLibrary.exportCustomPrompts();
  console.log(`   ✓ Exported ${exported.customPrompts.length} custom prompts`);
  console.log(`   ✓ Export version: ${exported.version}`);

  // Clear and re-import
  PromptLibrary.clearAllCustomPrompts();
  console.log('   ✓ Cleared all custom prompts');

  const importResult = PromptLibrary.importCustomPrompts(exported);
  console.log(`   ✓ Re-imported ${importResult.imported} prompts`);
  console.log(`   ✓ Skipped ${importResult.skipped} prompts`);
  console.log(`   ✓ ${importResult.errors.length} errors during import`);

} catch (error) {
  console.log(`   ✗ Error: ${error}`);
}

// 5. Show final state
console.log('\n5. Final State:');
const finalPrompts = PromptLibrary.getList();
const builtInCount = finalPrompts.filter(p => !p.isCustom).length;
const customCount = finalPrompts.filter(p => p.isCustom).length;

console.log(`   Total prompts: ${finalPrompts.length}`);
console.log(`   Built-in prompts: ${builtInCount}`);
console.log(`   Custom prompts: ${customCount}`);

// Clean up
PromptLibrary.clearAllCustomPrompts();
console.log('\n✓ Demo completed successfully!');