import { BaseBlock } from '../../blocks/types/BaseBlock';

export interface EditorContext {
  selection: Selection | null;
  content: string;
  blocks: BaseBlock[];
  services: ServiceRegistry;
}

export interface ServiceRegistry {
  get<T>(serviceName: string): T;
  register<T>(serviceName: string, service: T): void;
}

export interface Command {
  type: 'format' | 'block' | 'insert';
  name: string;
  execute(context: EditorContext): Promise<void>;
  undo(context: EditorContext): Promise<void>;
  canExecute(context: EditorContext): boolean;
}
