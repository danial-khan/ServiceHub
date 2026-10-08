import { ScriptManager, Script } from '@callstack/repack/client';
import sha256 from 'js-sha256';

export interface ModuleCatalog {
  version: string;
  lastUpdated: string;
  modules: ModuleMetadata[];
}

export interface ModuleMetadata {
  id: string;
  name: string;
  description?: string;
  version: string;
  url: string;
  size: number;
  checksum: string;
  platform: string;
  icon?: string;
}

const MODULE_HOST_URL = 'http://localhost:9000';

export class ModuleLoader {
  private catalog: ModuleCatalog | null = null;
  private loadedModules = new Map<string, any>();

  async fetchCatalog(): Promise<ModuleCatalog> {
    const response = await fetch(`${MODULE_HOST_URL}/catalog.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch catalog: ${response.status}`);
    }
    this.catalog = await response.json();
    return this.catalog;
  }

  getCatalog(): ModuleCatalog | null {
    return this.catalog;
  }

  getModule(id: string): ModuleMetadata | undefined {
    return this.catalog?.modules.find(m => m.id === id);
  }

  async downloadAndVerify(moduleId: string): Promise<ArrayBuffer> {
    const module = this.getModule(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found in catalog`);
    }

    // Download the container bundle
    const response = await fetch(module.url);
    if (!response.ok) {
      throw new Error(`Failed to download module ${moduleId}: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    
    // Verify SHA-256 checksum
    const uint8Array = new Uint8Array(arrayBuffer);
    const computedHash = sha256(uint8Array);
    
    if (computedHash !== module.checksum) {
      throw new Error(
        `Checksum mismatch for ${moduleId}. Expected ${module.checksum}, got ${computedHash}`
      );
    }

    return arrayBuffer;
  }

  async loadModule(moduleId: string): Promise<any> {
    // Check if already loaded
    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId);
    }

    const module = this.getModule(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found in catalog`);
    }

    // Download and verify
    await this.downloadAndVerify(moduleId);

    // Configure ScriptManager resolver for this module
    ScriptManager.shared.addResolver(async (scriptId, caller) => {
      // Map the module ID to its container URL
      const mod = this.getModule(scriptId);
      if (mod) {
        return {
          url: Script.getRemoteURL(mod.url),
          cache: true,
          query: {
            platform: mod.platform,
          },
        };
      }
      return undefined;
    });

    // Load the remote module using ScriptManager
    try {
      const container: any = await ScriptManager.shared.loadScript(moduleId);
      
      // Get the Module Federation container and initialize it
      if (container && container.get) {
        const factory = await container.get('./Module');
        const Component = factory();
        
        this.loadedModules.set(moduleId, Component);
        return Component;
      }
      
      throw new Error(`Invalid module container for ${moduleId}`);
    } catch (error) {
      throw new Error(`Failed to load module ${moduleId}: ${error}`);
    }
  }

  async unloadModule(moduleId: string): Promise<void> {
    this.loadedModules.delete(moduleId);
    // ScriptManager will handle cache invalidation
  }

  isModuleLoaded(moduleId: string): boolean {
    return this.loadedModules.has(moduleId);
  }
}

export const moduleLoader = new ModuleLoader();
