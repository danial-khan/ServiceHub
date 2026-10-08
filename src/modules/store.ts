import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moduleLoader, ModuleMetadata } from './moduleLoader';

interface ModuleState {
  availableModules: ModuleMetadata[];
  installedModules: Record<string, string>; // moduleId -> version
  downloadingModules: Record<string, boolean>;
  loadedComponents: Record<string, any>;
  error: string | null;
  
  fetchCatalog: () => Promise<void>;
  installModule: (moduleId: string) => Promise<void>;
  uninstallModule: (moduleId: string) => Promise<void>;
  getModuleComponent: (moduleId: string) => any;
  setError: (error: string | null) => void;
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set, get) => ({
      availableModules: [],
      installedModules: {},
      downloadingModules: {},
      loadedComponents: {},
      error: null,

      fetchCatalog: async () => {
        try {
          const catalog = await moduleLoader.fetchCatalog();
          set({ availableModules: catalog.modules, error: null });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch catalog';
          set({ error: message });
          throw error;
        }
      },

      installModule: async (moduleId: string) => {
        const { downloadingModules, installedModules } = get();
        
        if (downloadingModules[moduleId]) {
          return; // Already downloading
        }

        set({
          downloadingModules: { ...downloadingModules, [moduleId]: true },
          error: null,
        });

        try {
          // Download, verify, and load the module
          const component = await moduleLoader.loadModule(moduleId);
          
          const module = moduleLoader.getModule(moduleId);
          if (!module) {
            throw new Error(`Module ${moduleId} not found`);
          }

          set(state => ({
            installedModules: {
              ...state.installedModules,
              [moduleId]: module.version,
            },
            loadedComponents: {
              ...state.loadedComponents,
              [moduleId]: component,
            },
            downloadingModules: {
              ...state.downloadingModules,
              [moduleId]: false,
            },
            error: null,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to install module';
          set(state => ({
            downloadingModules: {
              ...state.downloadingModules,
              [moduleId]: false,
            },
            error: message,
          }));
          throw error;
        }
      },

      uninstallModule: async (moduleId: string) => {
        try {
          await moduleLoader.uninstallModule(moduleId);
          
          set(state => {
            const { [moduleId]: _, ...remainingInstalled } = state.installedModules;
            const { [moduleId]: __, ...remainingComponents } = state.loadedComponents;
            
            return {
              installedModules: remainingInstalled,
              loadedComponents: remainingComponents,
              error: null,
            };
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to uninstall module';
          set({ error: message });
          throw error;
        }
      },

      getModuleComponent: (moduleId: string) => {
        return get().loadedComponents[moduleId];
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'module-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        installedModules: state.installedModules,
        // Don't persist loaded components, they need to be loaded fresh
      }),
    }
  )
);
