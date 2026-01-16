import { Command, EditorContext } from '../types/Command';

export class SlashCommandRegistry {
  private commands = new Map<string, Command>();

  register(command: Command): void {
    this.commands.set(command.name, command);
  }

  search(query: string): Command[] {
    return Array.from(this.commands.values())
      .filter(cmd => cmd.name.toLowerCase().includes(query.toLowerCase()));
  }

  execute(name: string, context: EditorContext): Promise<void> {
    const command = this.commands.get(name);
    if (!command || !command.canExecute(context)) {
      throw new Error(`Command ${name} cannot be executed`);
    }
    return command.execute(context);
  }

  getAvailableCommands(): Command[] {
    return Array.from(this.commands.values());
  }
}
