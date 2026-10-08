import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModuleLoaderStore, ModuleCatalog, ModuleMetadata, InstalledModule, DownloadStatus, ModuleManifest } from './types';
import React from 'react';

const CATALOG_URL = 'http://localhost:9000/catalog.json';
const INSTALLED_MODULES_KEY = '@servicehub:installed_modules';

const simulateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

const loadInstalledModules = async (): Promise<Map<string, InstalledModule>> => {
  try {
    const stored = await AsyncStorage.getItem(INSTALLED_MODULES_KEY);
    if (stored) {
      const modules = JSON.parse(stored);
      return new Map(Object.entries(modules));
    }
  } catch (error) {
    console.error('Failed to load installed modules:', error);
  }
  return new Map();
};

const saveInstalledModules = async (modules: Map<string, InstalledModule>) => {
  try {
    const obj = Object.fromEntries(modules.entries());
    await AsyncStorage.setItem(INSTALLED_MODULES_KEY, JSON.stringify(obj));
  } catch (error) {
    console.error('Failed to save installed modules:', error);
  }
};

export const useModuleLoader = create<ModuleLoaderStore>((set, get) => ({
  catalog: null,
  installedModules: new Map(),
  downloadProgress: new Map(),
  loadedModules: new Map(),
  isLoadingCatalog: false,
  catalogError: null,

  fetchCatalog: async () => {
    set({ isLoadingCatalog: true, catalogError: null });
    try {
      const response = await fetch(CATALOG_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch module catalog');
      }
      const catalog: ModuleCatalog = await response.json();
      set({ catalog, isLoadingCatalog: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ catalogError: message, isLoadingCatalog: false });
      console.warn('Using offline mode - catalog unavailable');
    }
  },

  downloadModule: async (moduleId: string) => {
    const { catalog, downloadProgress, installedModules } = get();
    const module = catalog?.modules.find(m => m.id === moduleId);
    
    if (!module) {
      throw new Error('Module not found in catalog');
    }

    const progress = new Map(downloadProgress);
    progress.set(moduleId, {
      moduleId,
      status: DownloadStatus.DOWNLOADING,
      progress: 0,
    });
    set({ downloadProgress: progress });

    try {
      const simulateDownload = (duration: number) => {
        return new Promise<void>((resolve) => {
          const steps = 20;
          let currentStep = 0;
          const interval = setInterval(() => {
            currentStep++;
            const progress = new Map(get().downloadProgress);
            progress.set(moduleId, {
              moduleId,
              status: DownloadStatus.DOWNLOADING,
              progress: currentStep / steps,
            });
            set({ downloadProgress: progress });

            if (currentStep >= steps) {
              clearInterval(interval);
              resolve();
            }
          }, duration / steps);
        });
      };

      await simulateDownload(1500);

      progress.set(moduleId, {
        moduleId,
        status: DownloadStatus.VERIFYING,
        progress: 1,
      });
      set({ downloadProgress: progress });

      await new Promise<void>(resolve => setTimeout(resolve, 500));

      const checksum = simulateChecksum(module.bundleUrl);
      
      progress.set(moduleId, {
        moduleId,
        status: DownloadStatus.INSTALLING,
        progress: 1,
      });
      set({ downloadProgress: progress });

      await new Promise<void>(resolve => setTimeout(resolve, 500));

      const installed: InstalledModule = {
        metadata: module,
        installedAt: Date.now(),
        localPath: `local://${moduleId}`,
      };

      const newInstalled = new Map(installedModules);
      newInstalled.set(moduleId, installed);
      set({ installedModules: newInstalled });
      await saveInstalledModules(newInstalled);

      progress.set(moduleId, {
        moduleId,
        status: DownloadStatus.COMPLETE,
        progress: 1,
      });
      set({ downloadProgress: progress });

      setTimeout(() => {
        const p = new Map(get().downloadProgress);
        p.delete(moduleId);
        set({ downloadProgress: p });
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Download failed';
      progress.set(moduleId, {
        moduleId,
        status: DownloadStatus.ERROR,
        progress: 0,
        error: message,
      });
      set({ downloadProgress: progress });
      throw error;
    }
  },

  removeModule: async (moduleId: string) => {
    const { installedModules, loadedModules } = get();
    const installed = installedModules.get(moduleId);
    
    if (installed) {
      const newInstalled = new Map(installedModules);
      newInstalled.delete(moduleId);
      set({ installedModules: newInstalled });
      await saveInstalledModules(newInstalled);

      const newLoaded = new Map(loadedModules);
      newLoaded.delete(moduleId);
      set({ loadedModules: newLoaded });
    }
  },

  loadModule: async (moduleId: string): Promise<ModuleManifest> => {
    const { installedModules, loadedModules } = get();
    
    const existing = loadedModules.get(moduleId);
    if (existing) {
      return existing;
    }

    const installed = installedModules.get(moduleId);
    if (!installed) {
      throw new Error('Module not installed');
    }

    try {
      let moduleExport;
      
      if (moduleId === 'DoctorModule') {
        moduleExport = await import('../../modules/doctor/src');
      } else if (moduleId === 'BarberModule') {
        moduleExport = await import('../../modules/barber/src');
      } else if (moduleId === 'FoodModule') {
        moduleExport = await import('../../modules/food/src');
      } else {
        throw new Error(`Unknown module: ${moduleId}`);
      }
      
      const manifest: ModuleManifest = {
        id: installed.metadata.id,
        name: installed.metadata.name,
        version: installed.metadata.version,
        component: moduleExport.default || moduleExport,
        getNavigator: moduleExport.getNavigator,
      };

      const newLoaded = new Map(loadedModules);
      newLoaded.set(moduleId, manifest);
      set({ loadedModules: newLoaded });

      return manifest;
    } catch (error) {
      console.error('Failed to load module:', error);
      throw new Error(`Failed to load module: ${error}`);
    }
  },

  isModuleInstalled: (moduleId: string) => {
    return get().installedModules.has(moduleId);
  },

  getInstalledModules: () => {
    return Array.from(get().installedModules.values());
  },

  checkForUpdates: async () => {
    const { catalog, installedModules } = get();
    const updates: ModuleMetadata[] = [];

    if (!catalog) return updates;

    for (const [moduleId, installed] of installedModules.entries()) {
      const catalogModule = catalog.modules.find(m => m.id === moduleId);
      if (catalogModule && catalogModule.version !== installed.metadata.version) {
        updates.push(catalogModule);
      }
    }

    return updates;
  },

  updateModule: async (moduleId: string) => {
    await get().removeModule(moduleId);
    await get().downloadModule(moduleId);
  },
}));

export const initializeModuleLoader = async () => {
  const installedModules = await loadInstalledModules();
  useModuleLoader.setState({ installedModules });
  await useModuleLoader.getState().fetchCatalog();
};
