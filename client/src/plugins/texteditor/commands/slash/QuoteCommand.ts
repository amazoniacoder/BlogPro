import { Command, EditorContext } from '../types/Command';
import { QuoteService } from '../../blocks/services/QuoteService';

export class QuoteCommand implements Command {
  type: 'block' = 'block';
  name = 'quote';

  async execute(context: EditorContext): Promise<void> {
    const quoteService = context.services.get<QuoteService>('QuoteService');
    const quote = quoteService.createQuote('Enter your quote here...');
    context.blocks.push(quote);
  }

  async undo(context: EditorContext): Promise<void> {
    // Remove last added quote block
    const lastQuoteIndex = context.blocks.findLastIndex(block => block.type === 'quote');
    if (lastQuoteIndex !== -1) {
      context.blocks.splice(lastQuoteIndex, 1);
    }
  }

  canExecute(context: EditorContext): boolean {
    return context.services.get('QuoteService') !== undefined;
  }
}
