import { ComponentType } from 'react';
import { NavigationContainer } from '@react-navigation/native';

export interface ModuleMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  bundleUrl: string;
  size: number;
  checksum: string;
  minShellVersion: string;
  icon?: string;
}

export interface InstalledModule {
  metadata: ModuleMetadata;
  installedAt: number;
  localPath: string;
}

export interface ModuleCatalog {
  version: string;
  modules: ModuleMetadata[];
  lastUpdated: number;
}

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  component: ComponentType<any>;
  getNavigator?: () => ComponentType<any>;
}

export enum DownloadStatus {
  IDLE = 'idle',
  DOWNLOADING = 'downloading',
  VERIFYING = 'verifying',
  INSTALLING = 'installing',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export interface DownloadProgress {
  moduleId: string;
  status: DownloadStatus;
  progress: number;
  error?: string;
}

export interface ModuleLoaderState {
  catalog: ModuleCatalog | null;
  installedModules: Map<string, InstalledModule>;
  downloadProgress: Map<string, DownloadProgress>;
  loadedModules: Map<string, ModuleManifest>;
  isLoadingCatalog: boolean;
  catalogError: string | null;
}

export interface ModuleLoaderActions {
  fetchCatalog: () => Promise<void>;
  downloadModule: (moduleId: string) => Promise<void>;
  removeModule: (moduleId: string) => Promise<void>;
  loadModule: (moduleId: string) => Promise<ModuleManifest>;
  isModuleInstalled: (moduleId: string) => boolean;
  getInstalledModules: () => InstalledModule[];
  checkForUpdates: () => Promise<ModuleMetadata[]>;
  updateModule: (moduleId: string) => Promise<void>;
}

export type ModuleLoaderStore = ModuleLoaderState & ModuleLoaderActions;
