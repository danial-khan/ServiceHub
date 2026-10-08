import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useModuleLoader } from '../src/modules/moduleLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

global.fetch = jest.fn();

describe('ModuleLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useModuleLoader());

    expect(result.current.catalog).toBeNull();
    expect(result.current.installedModules.size).toBe(0);
    expect(result.current.isLoadingCatalog).toBe(false);
  });

  it('should fetch catalog successfully', async () => {
    const mockCatalog = {
      version: '1.0.0',
      modules: [
        {
          id: 'DoctorModule',
          name: 'Doctor Booking',
          description: 'Book doctor appointments',
          version: '1.0.0',
          bundleUrl: 'http://localhost:9001/index.bundle',
          size: 500000,
          checksum: 'abc123',
          minShellVersion: '1.0.0',
        },
      ],
      lastUpdated: Date.now(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCatalog,
    });

    const { result } = renderHook(() => useModuleLoader());

    await act(async () => {
      await result.current.fetchCatalog();
    });

    expect(result.current.catalog).toEqual(mockCatalog);
    expect(result.current.catalogError).toBeNull();
  });

  it('should handle catalog fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useModuleLoader());

    await act(async () => {
      await result.current.fetchCatalog();
    });

    expect(result.current.catalog).toBeNull();
    expect(result.current.catalogError).toBe('Network error');
  });

  it('should download and install a module', async () => {
    const mockCatalog = {
      version: '1.0.0',
      modules: [
        {
          id: 'DoctorModule',
          name: 'Doctor Booking',
          description: 'Book doctor appointments',
          version: '1.0.0',
          bundleUrl: 'http://localhost:9001/index.bundle',
          size: 500000,
          checksum: 'abc123',
          minShellVersion: '1.0.0',
        },
      ],
      lastUpdated: Date.now(),
    };

    const { result } = renderHook(() => useModuleLoader());

    act(() => {
      result.current.catalog = mockCatalog;
    });

    await act(async () => {
      await result.current.downloadModule('DoctorModule');
    });

    expect(result.current.isModuleInstalled('DoctorModule')).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should remove an installed module', async () => {
    const { result } = renderHook(() => useModuleLoader());

    const mockModule = {
      metadata: {
        id: 'DoctorModule',
        name: 'Doctor Booking',
        description: 'Book doctor appointments',
        version: '1.0.0',
        bundleUrl: 'http://localhost:9001/index.bundle',
        size: 500000,
        checksum: 'abc123',
        minShellVersion: '1.0.0',
      },
      installedAt: Date.now(),
      localPath: 'local://DoctorModule',
    };

    act(() => {
      result.current.installedModules.set('DoctorModule', mockModule);
    });

    expect(result.current.isModuleInstalled('DoctorModule')).toBe(true);

    await act(async () => {
      await result.current.removeModule('DoctorModule');
    });

    expect(result.current.isModuleInstalled('DoctorModule')).toBe(false);
  });

  it('should get list of installed modules', () => {
    const { result } = renderHook(() => useModuleLoader());

    const mockModules = [
      {
        metadata: {
          id: 'DoctorModule',
          name: 'Doctor Booking',
          description: 'Book doctor appointments',
          version: '1.0.0',
          bundleUrl: 'http://localhost:9001/index.bundle',
          size: 500000,
          checksum: 'abc123',
          minShellVersion: '1.0.0',
        },
        installedAt: Date.now(),
        localPath: 'local://DoctorModule',
      },
      {
        metadata: {
          id: 'BarberModule',
          name: 'Barber Services',
          description: 'Book barber appointments',
          version: '1.0.0',
          bundleUrl: 'http://localhost:9002/index.bundle',
          size: 450000,
          checksum: 'def456',
          minShellVersion: '1.0.0',
        },
        installedAt: Date.now(),
        localPath: 'local://BarberModule',
      },
    ];

    act(() => {
      mockModules.forEach((mod) => {
        result.current.installedModules.set(mod.metadata.id, mod);
      });
    });

    const installed = result.current.getInstalledModules();
    expect(installed).toHaveLength(2);
    expect(installed.map((m) => m.metadata.id)).toContain('DoctorModule');
    expect(installed.map((m) => m.metadata.id)).toContain('BarberModule');
  });
});
