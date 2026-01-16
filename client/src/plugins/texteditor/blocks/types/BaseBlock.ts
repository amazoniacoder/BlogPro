import React from 'react';

export interface BaseBlock {
  id: string;
  type: string;
  data: Record<string, any>;
  render(): React.ReactElement;
  serialize(): string;
  deserialize(data: string): void;
}

export abstract class AbstractBlock implements BaseBlock {
  constructor(
    public id: string,
    public type: string,
    public data: Record<string, any> = {}
  ) {}

  abstract render(): React.ReactElement;
  abstract serialize(): string;
  abstract deserialize(data: string): void;
}
