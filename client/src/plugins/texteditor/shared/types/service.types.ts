export interface BaseService {
  readonly name: string;
  readonly version: string;
  initialize(): Promise<void>;
  cleanup(): void;
}
