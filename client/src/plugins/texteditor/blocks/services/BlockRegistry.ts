import { BaseBlock } from '../types/BaseBlock';

type BlockConstructor = new (id: string, type: string, data?: Record<string, any>) => BaseBlock;

export class BlockRegistry {
  private blocks = new Map<string, BlockConstructor>();

  register(type: string, blockClass: BlockConstructor): void {
    this.blocks.set(type, blockClass);
  }

  create(type: string, id: string, data?: Record<string, any>): BaseBlock {
    const BlockClass = this.blocks.get(type);
    if (!BlockClass) {
      throw new Error(`Block type ${type} not registered`);
    }
    return new BlockClass(id, type, data);
  }

  getAvailableTypes(): string[] {
    return Array.from(this.blocks.keys());
  }
}
