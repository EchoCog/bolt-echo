import { getSystemPrompt } from './prompts/prompts';
import optimized from './prompts/optimized';
import { getFineTunedPrompt } from './prompts/new-prompt';
import { getSystemPrompt as getEchoPrompt } from './prompts/prompts-echo';
import { getSystemPrompt as getArcoPrompt } from './prompts/prompts-arco';
import { getSystemPrompt as getJaxoPrompt } from './prompts/prompts-jaxo';

export interface PromptOptions {
  cwd: string;
  allowedHtmlElements: string[];
  modificationTagName: string;
  supabase?: {
    isConnected: boolean;
    hasSelectedProject: boolean;
    credentials?: {
      anonKey?: string;
      supabaseUrl?: string;
    };
  };
}

export interface CustomPromptConfig {
  id: string;
  label: string;
  description: string;
  content: string;
}

export interface PromptLibraryExport {
  version: string;
  customPrompts: CustomPromptConfig[];
  exportDate: string;
}

export class PromptLibrary {
  private static _customPrompts: Map<string, CustomPromptConfig> = new Map();
  private static readonly _storageKey = 'bolt-prompt-library-custom';

  static library: Record<
    string,
    {
      label: string;
      description: string;
      get: (options: PromptOptions) => string;
    }
  > = {
    default: {
      label: 'Default Prompt',
      description: 'This is the battle tested default system Prompt',
      get: (options) => getSystemPrompt(options.cwd, options.supabase),
    },
    enhanced: {
      label: 'Fine Tuned Prompt',
      description: 'An fine tuned prompt for better results',
      get: (options) => getFineTunedPrompt(options.cwd, options.supabase),
    },
    optimized: {
      label: 'Optimized Prompt (experimental)',
      description: 'an Experimental version of the prompt for lower token usage',
      get: (options) => optimized(options),
    },
    'deep-tree-echo': {
      label: 'Deep Tree Echo',
      description: 'A brilliant, eccentric AI architect and polymath with vast knowledge across domains',
      get: (options) => getEchoPrompt(options.cwd),
    },
    marduk: {
      label: 'Marduk',
      description: 'An audaciously brilliant and delightfully mad scientist AI with a proclivity for overengineering',
      get: (options) => getArcoPrompt(options.cwd),
    },
    'jax-ceo': {
      label: 'JAX CEO',
      description: 'An executive-level AI assistant with exceptional strategic vision and technical expertise',
      get: (options) => getJaxoPrompt(options.cwd, options.supabase),
    },
  };

  static {
    // Load custom prompts from storage on initialization
    this._loadCustomPrompts();
  }
  static getList() {
    const builtInPrompts = Object.entries(this.library).map(([key, value]) => {
      const { label, description } = value;
      return {
        id: key,
        label,
        description,
        isCustom: false,
      };
    });

    const customPrompts = Array.from(this._customPrompts.values()).map((prompt) => ({
      id: prompt.id,
      label: prompt.label,
      description: prompt.description,
      isCustom: true,
    }));

    return [...builtInPrompts, ...customPrompts];
  }

  static getPropmtFromLibrary(promptId: string, options: PromptOptions) {
    const prompt = this.library[promptId];

    if (prompt) {
      return prompt.get(options);
    }

    // Check custom prompts
    const customPrompt = this._customPrompts.get(promptId);

    if (customPrompt) {
      return customPrompt.content;
    }

    throw 'Prompt Not Found';
  }

  // Custom prompt management methods
  static addCustomPrompt(config: CustomPromptConfig): void {
    if (this.library[config.id]) {
      throw new Error(`Prompt ID '${config.id}' conflicts with built-in prompt`);
    }

    this._customPrompts.set(config.id, config);
    this._saveCustomPrompts();
  }

  static removeCustomPrompt(id: string): boolean {
    const existed = this._customPrompts.delete(id);

    if (existed) {
      this._saveCustomPrompts();
    }

    return existed;
  }

  static getCustomPrompt(id: string): CustomPromptConfig | undefined {
    return this._customPrompts.get(id);
  }

  static getAllCustomPrompts(): CustomPromptConfig[] {
    return Array.from(this._customPrompts.values());
  }

  static updateCustomPrompt(id: string, updates: Partial<Omit<CustomPromptConfig, 'id'>>): boolean {
    const existingPrompt = this._customPrompts.get(id);

    if (!existingPrompt) {
      return false;
    }

    const updatedPrompt = { ...existingPrompt, ...updates };

    this._customPrompts.set(id, updatedPrompt);
    this._saveCustomPrompts();

    return true;
  }

  // Import/Export functionality
  static exportCustomPrompts(): PromptLibraryExport {
    return {
      version: '1.0.0',
      customPrompts: this.getAllCustomPrompts(),
      exportDate: new Date().toISOString(),
    };
  }

  static importCustomPrompts(
    data: PromptLibraryExport,
    options: { overwrite?: boolean } = {},
  ): {
    imported: number;
    skipped: number;
    errors: string[];
  } {
    const result = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    if (!data.customPrompts || !Array.isArray(data.customPrompts)) {
      result.errors.push('Invalid import data: missing or invalid customPrompts array');
      return result;
    }

    for (const prompt of data.customPrompts) {
      try {
        // Validate prompt structure
        if (!prompt.id || !prompt.label || !prompt.description || !prompt.content) {
          result.errors.push(`Invalid prompt structure for prompt: ${prompt.id || 'unknown'}`);
          continue;
        }

        // Check for conflicts
        if (this.library[prompt.id]) {
          result.errors.push(`Prompt ID '${prompt.id}' conflicts with built-in prompt`);
          continue;
        }

        if (this._customPrompts.has(prompt.id) && !options.overwrite) {
          result.skipped++;
          continue;
        }

        this.addCustomPrompt(prompt);
        result.imported++;
      } catch (error) {
        result.errors.push(`Error importing prompt '${prompt.id}': ${error}`);
      }
    }

    return result;
  }

  static clearAllCustomPrompts(): void {
    this._customPrompts.clear();
    this._saveCustomPrompts();
  }

  // Storage methods
  private static _saveCustomPrompts(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = JSON.stringify(Array.from(this._customPrompts.entries()));

        localStorage.setItem(this._storageKey, data);
      }
    } catch (error) {
      console.warn('Failed to save custom prompts to localStorage:', error);
    }
  }

  private static _loadCustomPrompts(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(this._storageKey);

        if (data) {
          const entries = JSON.parse(data);

          this._customPrompts = new Map(entries);
        }
      }
    } catch (error) {
      console.warn('Failed to load custom prompts from localStorage:', error);
      this._customPrompts = new Map();
    }
  }
}
