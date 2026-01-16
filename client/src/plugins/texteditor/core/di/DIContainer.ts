/**
 * Dependency Injection Container
 * 
 * Centralized service management with lifecycle control and dependency resolution.
 */

export interface ServiceDefinition<T> {
  factory: () => T | Promise<T>;
  singleton?: boolean;
  dependencies?: string[];
}

export interface ServiceRegistration {
  name: string;
  definition: ServiceDefinition<any>;
}

export class DIContainer {
  private services = new Map<string, ServiceDefinition<any>>();
  private instances = new Map<string, any>();
  private resolving = new Set<string>();

  /**
   * Register a service with the container
   */
  register<T>(name: string, definition: ServiceDefinition<T>): void {
    if (this.services.has(name)) {
      throw new Error(`Service '${name}' is already registered`);
    }
    
    this.services.set(name, definition);
  }

  /**
   * Resolve a service by name
   */
  async resolve<T>(name: string): Promise<T> {
    // Check for circular dependencies
    if (this.resolving.has(name)) {
      throw new Error(`Circular dependency detected for service '${name}'`);
    }

    const definition = this.services.get(name);
    if (!definition) {
      throw new Error(`Service '${name}' not found`);
    }

    // Return singleton instance if exists
    if (definition.singleton && this.instances.has(name)) {
      return this.instances.get(name);
    }

    this.resolving.add(name);

    try {
      // Resolve dependencies first
      if (definition.dependencies) {
        for (const dep of definition.dependencies) {
          await this.resolve(dep);
        }
      }

      // Create service instance
      const instance = await definition.factory();

      // Store singleton instance
      if (definition.singleton) {
        this.instances.set(name, instance);
      }

      return instance;
    } finally {
      this.resolving.delete(name);
    }
  }

  /**
   * Check if service is registered
   */
  isRegistered(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all registered service names
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Dispose all singleton instances
   */
  async dispose(): Promise<void> {
    const disposalPromises: Promise<void>[] = [];

    for (const [, instance] of this.instances) {
      if (instance && typeof instance.dispose === 'function') {
        disposalPromises.push(instance.dispose());
      }
    }

    await Promise.allSettled(disposalPromises);
    
    this.instances.clear();
    this.services.clear();
    this.resolving.clear();
  }

  /**
   * Clear specific service instance (for testing)
   */
  clearInstance(name: string): void {
    this.instances.delete(name);
  }
}
