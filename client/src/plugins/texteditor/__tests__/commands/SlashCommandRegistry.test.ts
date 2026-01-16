import { SlashCommandRegistry } from '../../commands/slash/SlashCommandRegistry';
import { QuoteCommand } from '../../commands/slash/QuoteCommand';
import { EditorContext } from '../../commands/types/Command';

describe('SlashCommandRegistry', () => {
  let registry: SlashCommandRegistry;
  let mockContext: EditorContext;

  beforeEach(() => {
    registry = new SlashCommandRegistry();
    mockContext = {
      selection: null,
      content: '',
      blocks: [],
      services: {
        get: vi.fn().mockReturnValue({ createQuote: vi.fn() }),
        register: vi.fn()
      }
    };
  });

  it('registers and retrieves commands', () => {
    const quoteCommand = new QuoteCommand();
    registry.register(quoteCommand);

    const commands = registry.getAvailableCommands();
    expect(commands).toHaveLength(1);
    expect(commands[0].name).toBe('quote');
  });

  it('searches commands by query', () => {
    const quoteCommand = new QuoteCommand();
    registry.register(quoteCommand);

    const results = registry.search('quo');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('quote');
  });

  it('executes commands when valid', async () => {
    const quoteCommand = new QuoteCommand();
    registry.register(quoteCommand);

    await expect(registry.execute('quote', mockContext)).resolves.not.toThrow();
  });
});
