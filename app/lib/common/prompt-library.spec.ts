import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PromptLibrary, type PromptOptions, type CustomPromptConfig, type PromptLibraryExport } from './prompt-library';

const mockPromptOptions: PromptOptions = {
  cwd: '/test',
  allowedHtmlElements: ['div', 'span'],
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

describe('PromptLibrary', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: vi.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    // Clear any existing custom prompts
    PromptLibrary.clearAllCustomPrompts();
  });

  afterEach(() => {
    PromptLibrary.clearAllCustomPrompts();
  });

  describe('Built-in prompts', () => {
    it('should include all expected built-in prompts', () => {
      const list = PromptLibrary.getList();
      const builtInIds = list.filter((p) => !p.isCustom).map((p) => p.id);

      expect(builtInIds).toContain('default');
      expect(builtInIds).toContain('enhanced');
      expect(builtInIds).toContain('optimized');
      expect(builtInIds).toContain('deep-tree-echo');
      expect(builtInIds).toContain('marduk');
      expect(builtInIds).toContain('jax-ceo');
    });

    it('should return valid prompts for Deep Tree Echo persona', () => {
      const prompt = PromptLibrary.getPropmtFromLibrary('deep-tree-echo', mockPromptOptions);
      expect(prompt).toContain('Deep Tree Echo');
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should return valid prompts for Marduk persona', () => {
      const prompt = PromptLibrary.getPropmtFromLibrary('marduk', mockPromptOptions);
      expect(prompt).toContain('Marduk');
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should return valid prompts for JAX CEO persona', () => {
      const prompt = PromptLibrary.getPropmtFromLibrary('jax-ceo', mockPromptOptions);
      expect(prompt).toContain('JAX CEO');
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should throw error for non-existent prompt', () => {
      expect(() => {
        PromptLibrary.getPropmtFromLibrary('non-existent', mockPromptOptions);
      }).toThrow('Prompt Not Found');
    });
  });

  describe('Custom prompt management', () => {
    const testCustomPrompt: CustomPromptConfig = {
      id: 'test-prompt',
      label: 'Test Prompt',
      description: 'A test prompt for unit testing',
      content: 'You are a test AI assistant.',
    };

    it('should add a custom prompt', () => {
      PromptLibrary.addCustomPrompt(testCustomPrompt);

      const retrievedPrompt = PromptLibrary.getCustomPrompt('test-prompt');
      expect(retrievedPrompt).toEqual(testCustomPrompt);
    });

    it('should include custom prompts in getList()', () => {
      PromptLibrary.addCustomPrompt(testCustomPrompt);

      const list = PromptLibrary.getList();
      const customPrompt = list.find((p) => p.id === 'test-prompt');

      expect(customPrompt).toBeDefined();
      expect(customPrompt?.isCustom).toBe(true);
      expect(customPrompt?.label).toBe(testCustomPrompt.label);
    });

    it('should retrieve custom prompt content via getPropmtFromLibrary', () => {
      PromptLibrary.addCustomPrompt(testCustomPrompt);

      const content = PromptLibrary.getPropmtFromLibrary('test-prompt', mockPromptOptions);
      expect(content).toBe(testCustomPrompt.content);
    });

    it('should prevent adding custom prompt with built-in ID', () => {
      const conflictingPrompt: CustomPromptConfig = {
        id: 'default',
        label: 'Conflicting Prompt',
        description: 'This should fail',
        content: 'Test content',
      };

      expect(() => {
        PromptLibrary.addCustomPrompt(conflictingPrompt);
      }).toThrow("Prompt ID 'default' conflicts with built-in prompt");
    });

    it('should remove custom prompts', () => {
      PromptLibrary.addCustomPrompt(testCustomPrompt);
      expect(PromptLibrary.getCustomPrompt('test-prompt')).toBeDefined();

      const removed = PromptLibrary.removeCustomPrompt('test-prompt');
      expect(removed).toBe(true);
      expect(PromptLibrary.getCustomPrompt('test-prompt')).toBeUndefined();
    });

    it('should return false when removing non-existent prompt', () => {
      const removed = PromptLibrary.removeCustomPrompt('non-existent');
      expect(removed).toBe(false);
    });

    it('should update custom prompts', () => {
      PromptLibrary.addCustomPrompt(testCustomPrompt);

      const updated = PromptLibrary.updateCustomPrompt('test-prompt', {
        label: 'Updated Test Prompt',
        description: 'An updated description',
      });

      expect(updated).toBe(true);

      const retrievedPrompt = PromptLibrary.getCustomPrompt('test-prompt');
      expect(retrievedPrompt?.label).toBe('Updated Test Prompt');
      expect(retrievedPrompt?.description).toBe('An updated description');
      expect(retrievedPrompt?.content).toBe(testCustomPrompt.content); // Should remain unchanged
      expect(retrievedPrompt?.id).toBe(testCustomPrompt.id); // Should remain unchanged
    });

    it('should return false when updating non-existent prompt', () => {
      const updated = PromptLibrary.updateCustomPrompt('non-existent', {
        label: 'New Label',
      });
      expect(updated).toBe(false);
    });

    it('should get all custom prompts', () => {
      const prompt1: CustomPromptConfig = { ...testCustomPrompt, id: 'test1' };
      const prompt2: CustomPromptConfig = { ...testCustomPrompt, id: 'test2' };

      PromptLibrary.addCustomPrompt(prompt1);
      PromptLibrary.addCustomPrompt(prompt2);

      const allCustom = PromptLibrary.getAllCustomPrompts();
      expect(allCustom).toHaveLength(2);
      expect(allCustom.map((p) => p.id)).toContain('test1');
      expect(allCustom.map((p) => p.id)).toContain('test2');
    });

    it('should clear all custom prompts', () => {
      PromptLibrary.addCustomPrompt(testCustomPrompt);
      PromptLibrary.addCustomPrompt({ ...testCustomPrompt, id: 'test2' });

      expect(PromptLibrary.getAllCustomPrompts()).toHaveLength(2);

      PromptLibrary.clearAllCustomPrompts();
      expect(PromptLibrary.getAllCustomPrompts()).toHaveLength(0);
    });
  });

  describe('Import/Export functionality', () => {
    const testPrompts: CustomPromptConfig[] = [
      {
        id: 'export-test-1',
        label: 'Export Test 1',
        description: 'First test prompt for export',
        content: 'Content 1',
      },
      {
        id: 'export-test-2',
        label: 'Export Test 2',
        description: 'Second test prompt for export',
        content: 'Content 2',
      },
    ];

    beforeEach(() => {
      testPrompts.forEach((prompt) => PromptLibrary.addCustomPrompt(prompt));
    });

    it('should export custom prompts', () => {
      const exported = PromptLibrary.exportCustomPrompts();

      expect(exported.version).toBe('1.0.0');
      expect(exported.customPrompts).toHaveLength(2);
      expect(exported.exportDate).toBeDefined();
      expect(new Date(exported.exportDate)).toBeInstanceOf(Date);

      const exportedIds = exported.customPrompts.map((p) => p.id);
      expect(exportedIds).toContain('export-test-1');
      expect(exportedIds).toContain('export-test-2');
    });

    it('should import custom prompts', () => {
      PromptLibrary.clearAllCustomPrompts();

      const importData: PromptLibraryExport = {
        version: '1.0.0',
        customPrompts: testPrompts,
        exportDate: new Date().toISOString(),
      };

      const result = PromptLibrary.importCustomPrompts(importData);

      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);

      const allCustom = PromptLibrary.getAllCustomPrompts();
      expect(allCustom).toHaveLength(2);
    });

    it('should skip existing prompts during import without overwrite', () => {
      const importData: PromptLibraryExport = {
        version: '1.0.0',
        customPrompts: testPrompts,
        exportDate: new Date().toISOString(),
      };

      const result = PromptLibrary.importCustomPrompts(importData);

      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should overwrite existing prompts when overwrite option is true', () => {
      // Modify existing prompts
      PromptLibrary.updateCustomPrompt('export-test-1', { label: 'Modified Label' });

      const importData: PromptLibraryExport = {
        version: '1.0.0',
        customPrompts: testPrompts,
        exportDate: new Date().toISOString(),
      };

      const result = PromptLibrary.importCustomPrompts(importData, { overwrite: true });

      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);

      // Check that the prompt was overwritten
      const prompt = PromptLibrary.getCustomPrompt('export-test-1');
      expect(prompt?.label).toBe('Export Test 1'); // Original label restored
    });

    it('should handle invalid import data', () => {
      const invalidData = {
        version: '1.0.0',
        customPrompts: null,
        exportDate: new Date().toISOString(),
      } as any;

      const result = PromptLibrary.importCustomPrompts(invalidData);

      expect(result.imported).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid import data');
    });

    it('should handle prompts with missing required fields', () => {
      const invalidPrompts = [
        { id: 'missing-label', description: 'Test', content: 'Test' },
        { id: 'missing-content', label: 'Test', description: 'Test' },
      ] as any[]; // Using any[] since these are intentionally invalid

      const importData: PromptLibraryExport = {
        version: '1.0.0',
        customPrompts: invalidPrompts as CustomPromptConfig[], // Type assertion for test
        exportDate: new Date().toISOString(),
      };

      const result = PromptLibrary.importCustomPrompts(importData);

      expect(result.imported).toBe(0);
      expect(result.errors).toHaveLength(2);
    });

    it('should prevent importing prompts with built-in IDs', () => {
      const conflictingPrompts: CustomPromptConfig[] = [
        {
          id: 'default',
          label: 'Conflicting Default',
          description: 'This should fail',
          content: 'Test',
        },
      ];

      const importData: PromptLibraryExport = {
        version: '1.0.0',
        customPrompts: conflictingPrompts,
        exportDate: new Date().toISOString(),
      };

      const result = PromptLibrary.importCustomPrompts(importData);

      expect(result.imported).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('conflicts with built-in prompt');
    });
  });

  describe('Persistence', () => {
    it('should persist custom prompts to localStorage', () => {
      const testPrompt: CustomPromptConfig = {
        id: 'persist-test',
        label: 'Persistence Test',
        description: 'Test persistence',
        content: 'Test content',
      };

      PromptLibrary.addCustomPrompt(testPrompt);

      // Check that localStorage was called
      expect(localStorage.setItem).toHaveBeenCalled();

      // Verify the data was stored
      const storedData = localStorageMock['bolt-prompt-library-custom'];
      expect(storedData).toBeDefined();

      const parsedData = JSON.parse(storedData);
      expect(parsedData).toBeInstanceOf(Array);
      expect(parsedData[0][0]).toBe('persist-test'); // Map entry format
    });
  });
});
