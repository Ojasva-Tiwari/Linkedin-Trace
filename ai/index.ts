export * from './provider';
export * from './synthesis-engine';

import {
  AIProvider,
  AIProviderConfig,
  StubAIProvider,
  OpenAIProvider,
  AnthropicProvider,
  LocalModelProvider,
} from './provider';

/**
 * AI Provider Registry / Factory.
 * Resolves the configured provider while maintaining provider decoupling.
 */
export class AIService {
  private static activeProvider: AIProvider = new StubAIProvider();

  public static getProvider(): AIProvider {
    return this.activeProvider;
  }

  public static setProvider(provider: AIProvider): void {
    this.activeProvider = provider;
  }

  public static createProvider(config: AIProviderConfig): AIProvider {
    switch (config.type) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'local':
        return new LocalModelProvider(config);
      case 'stub':
      default:
        return new StubAIProvider();
    }
  }
}

