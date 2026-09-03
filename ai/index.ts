export * from './provider';

import { AIProvider, StubAIProvider } from './provider';

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
}
