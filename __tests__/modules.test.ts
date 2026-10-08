import crypto from 'crypto';

// Mock @callstack/repack/client before importing moduleLoader
jest.mock('@callstack/repack/client', () => ({
  ScriptManager: {
    shared: {
      addResolver: jest.fn(),
      loadScript: jest.fn(),
    },
  },
  Script: {
    getRemoteURL: (url: string) => url,
  },
}));

import { moduleLoader, ModuleCatalog } from '../src/modules/moduleLoader';

// Mock fetch globally
global.fetch = jest.fn();

describe('Module Loader with Real Fetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it('should fetch and parse catalog correctly', async () => {
    const mockCatalog: ModuleCatalog = {
      version: '1.0.0',
      lastUpdated: '2026-10-08T21:00:00.000Z',
      modules: [
        {
          id: 'doctor',
          name: 'Doctor',
          url: 'http://localhost:9000/modules/doctor.bundle',
          size: 1000,
          checksum: 'abc123',
          platform: 'android',
          version: '1.0.0',
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCatalog,
    });

    const catalog = await moduleLoader.fetchCatalog();
    
    expect(catalog.modules).toHaveLength(1);
    expect(catalog.modules[0].id).toBe('doctor');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:9000/catalog.json');
  });

  it('should throw error when catalog fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(moduleLoader.fetchCatalog()).rejects.toThrow('Failed to fetch catalog: 404');
  });

  it('should validate SHA-256 checksum correctly', async () => {
    const data = 'test module data';
    const buffer = Buffer.from(data, 'utf-8');
    // Compute hash the same way moduleLoader does (from Uint8Array)
    const uint8Array = new Uint8Array(buffer);
    const correctHash = require('js-sha256')(uint8Array);

    // Setup catalog
    const mockCatalog: ModuleCatalog = {
      version: '1.0.0',
      lastUpdated: '2026-10-08',
      modules: [
        {
          id: 'test',
          name: 'Test',
          url: 'http://localhost:9000/test.bundle',
          size: buffer.length,
          checksum: correctHash,
          platform: 'android',
          version: '1.0.0',
        },
      ],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCatalog,
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => buffer.buffer,
      });

    await moduleLoader.fetchCatalog();
    const downloadedBuffer = await moduleLoader.downloadAndVerify('test');
    
    expect(downloadedBuffer).toBeDefined();
    expect(downloadedBuffer.byteLength).toBe(buffer.length);
  });

  it('should reject on checksum mismatch', async () => {
    const data = 'test module data';
    const buffer = Buffer.from(data, 'utf-8');
    const wrongHash = 'wrong_hash_1234567890abcdef';

    // Setup catalog with wrong hash
    const mockCatalog: ModuleCatalog = {
      version: '1.0.0',
      lastUpdated: '2026-10-08',
      modules: [
        {
          id: 'test',
          name: 'Test',
          url: 'http://localhost:9000/test.bundle',
          size: buffer.length,
          checksum: wrongHash,
          platform: 'android',
          version: '1.0.0',
        },
      ],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCatalog,
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => buffer.buffer,
      });

    await moduleLoader.fetchCatalog();
    
    await expect(moduleLoader.downloadAndVerify('test')).rejects.toThrow('Checksum mismatch');
  });

  it('should throw error for non-existent module', async () => {
    const mockCatalog: ModuleCatalog = {
      version: '1.0.0',
      lastUpdated: '2026-10-08',
      modules: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCatalog,
    });

    await moduleLoader.fetchCatalog();
    
    await expect(moduleLoader.downloadAndVerify('nonexistent')).rejects.toThrow(
      'Module nonexistent not found in catalog'
    );
  });

  it('should handle module download failure', async () => {
    const mockCatalog: ModuleCatalog = {
      version: '1.0.0',
      lastUpdated: '2026-10-08',
      modules: [
        {
          id: 'test',
          name: 'Test',
          url: 'http://localhost:9000/test.bundle',
          size: 1000,
          checksum: 'abc',
          platform: 'android',
          version: '1.0.0',
        },
      ],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCatalog,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

    await moduleLoader.fetchCatalog();
    
    await expect(moduleLoader.downloadAndVerify('test')).rejects.toThrow(
      'Failed to download module test: 500'
    );
  });

  it('should handle multiple modules in catalog', async () => {
    const mockCatalog: ModuleCatalog = {
      version: '1.0.0',
      lastUpdated: '2026-10-08',
      modules: [
        { id: 'doctor', name: 'Doctor', url: 'http://localhost/doctor.bundle', size: 1000, checksum: 'abc', platform: 'android', version: '1.0.0' },
        { id: 'barber', name: 'Barber', url: 'http://localhost/barber.bundle', size: 2000, checksum: 'def', platform: 'android', version: '1.0.0' },
        { id: 'food', name: 'Food', url: 'http://localhost/food.bundle', size: 3000, checksum: 'ghi', platform: 'android', version: '1.0.0' },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCatalog,
    });

    await moduleLoader.fetchCatalog();
    const catalog = moduleLoader.getCatalog();
    
    expect(catalog?.modules).toHaveLength(3);
    expect(catalog?.modules.map(m => m.id)).toEqual(['doctor', 'barber', 'food']);
  });

  it('should validate checksum format (64 hex chars for SHA-256)', () => {
    const validHash = '765ebac94dd10c79c9295b5d373d293deff80adbfef84c8e889d858d50e51694';
    const invalidHash = 'abc123';
    
    expect(validHash).toHaveLength(64);
    expect(invalidHash.length).toBeLessThan(64);
    expect(/^[a-f0-9]{64}$/.test(validHash)).toBe(true);
    expect(/^[a-f0-9]{64}$/.test(invalidHash)).toBe(false);
  });

  it('should get specific module from catalog', async () => {
    const mockCatalog: ModuleCatalog = {
      version: '1.0.0',
      lastUpdated: '2026-10-08',
      modules: [
        { id: 'doctor', name: 'Doctor', url: 'http://localhost/doctor.bundle', size: 1000, checksum: 'abc', platform: 'android', version: '1.0.0' },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCatalog,
    });

    await moduleLoader.fetchCatalog();
    const module = moduleLoader.getModule('doctor');
    
    expect(module).toBeDefined();
    expect(module?.id).toBe('doctor');
    expect(module?.name).toBe('Doctor');
  });

  it('should return undefined for non-existent module', async () => {
    const mockCatalog: ModuleCatalog = {
      version: '1.0.0',
      lastUpdated: '2026-10-08',
      modules: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCatalog,
    });

    await moduleLoader.fetchCatalog();
    const module = moduleLoader.getModule('nonexistent');
    
    expect(module).toBeUndefined();
  });
});
