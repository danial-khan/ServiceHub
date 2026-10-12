import { init, loadRemote, registerRemotes } from '@module-federation/runtime';
import { ScriptManager, ScriptLocator } from '@callstack/repack/client';
import { Platform } from 'react-native';
import sha256 from 'js-sha256';

const BASE_URL = Platform.select({
  ios: 'http://localhost:9000',
  android: 'http://10.0.2.2:9000',
})!;

export interface ModuleMetadata {
  id: string;
  name: string;
  version: string;
  url: string;
  size: number;
  checksum: string;
  platform: string;
  description?: string;
  updatedAt?: string;
}

export interface ModuleCatalog {
  version: string;
  lastUpdated: string;
  modules: ModuleMetadata[];
}

class ModuleLoader {
  private catalog: ModuleCatalog | null = null;
  private resolverRegistered = false;
  private loadedModules = new Map<string, any>();
  private remoteBaseUrls = new Map<string, string>();

  async initialize() {
    if (this.resolverRegistered) return;
    
    ScriptManager.shared.addResolver(async (scriptId: string, caller?: string): Promise<ScriptLocator> => {
      const verifyScriptSignature = __DEV__ ? 'off' : 'strict';
      
      // Check if this is a remote container entry
      const module = this.getModule(scriptId);
      if (module) {
        // This is a remote entry URL from the catalog
        return {
          url: module.url,
          method: 'GET',
          verifyScriptSignature,
        };
      }
      
      // This is a chunk request - need to resolve relative to the caller's base URL
      if (caller) {
        const callerBaseUrl = this.remoteBaseUrls.get(caller);
        if (callerBaseUrl) {
          const { Script } = await import('@callstack/repack/client');
          return {
            url: Script.getRemoteURL(`${callerBaseUrl}/${scriptId}`),
            method: 'GET',
            verifyScriptSignature,
          };
        }
      }
      
      // Fallback: treat scriptId as a full URL
      return {
        url: scriptId,
        method: 'GET',
        verifyScriptSignature,
      };
    });
    
    this.resolverRegistered = true;

    // Note: We don't call init() here because the shell's ModuleFederationPluginV2
    // already creates the runtime instance. Calling init() twice can cause conflicts.
  }

  async fetchCatalog(): Promise<ModuleCatalog> {
    const response = await fetch(`${BASE_URL}/catalog.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch catalog: ${response.status}`);
    }
    this.catalog = await response.json();
    return this.catalog;
  }

  getCatalog(): ModuleCatalog | null {
    return this.catalog;
  }

  getModule(moduleId: string): ModuleMetadata | null {
    if (!this.catalog) return null;
    return this.catalog.modules.find((m) => m.id === moduleId) || null;
  }

  async verifyChecksum(moduleId: string): Promise<boolean> {
    const module = this.getModule(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found in catalog`);
    }

    const response = await fetch(module.url);
    if (!response.ok) {
      throw new Error(`Failed to download ${moduleId}: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const computedHash = sha256(uint8Array);

    if (computedHash !== module.checksum) {
      throw new Error(
        `Checksum mismatch for ${moduleId}. Expected ${module.checksum}, got ${computedHash}`
      );
    }

    return true;
  }

  async loadModule(moduleId: string): Promise<any> {
    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId);
    }

    await this.initialize();
    
    const module = this.getModule(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found in catalog`);
    }

    await this.verifyChecksum(moduleId);

    // Store the base URL for this remote (for chunk resolution)
    const baseUrl = module.url.substring(0, module.url.lastIndexOf('/'));
    this.remoteBaseUrls.set(moduleId, baseUrl);

    registerRemotes([
      {
        name: moduleId,
        entry: module.url,
      },
    ]);

    const moduleNamespace = await loadRemote(`${moduleId}/Module`) as { default?: any };
    
    if (!moduleNamespace || !moduleNamespace.default) {
      throw new Error(
        `Module ${moduleId} did not export a default component. Check that the remote's index.tsx has 'export default'.`
      );
    }
    
    const component = moduleNamespace.default;
    this.loadedModules.set(moduleId, component);
    return component;
  }

  async uninstallModule(moduleId: string): Promise<void> {
    this.loadedModules.delete(moduleId);
  }

  isModuleLoaded(moduleId: string): boolean {
    return this.loadedModules.has(moduleId);
  }
}

export const moduleLoader = new ModuleLoader();
