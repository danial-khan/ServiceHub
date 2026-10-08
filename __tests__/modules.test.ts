// Mock react-native Platform BEFORE importing moduleLoader
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: (obj: any) => obj.android,
  },
}));

// Mock @module-federation/runtime
jest.mock('@module-federation/runtime', () => ({
  init: jest.fn(),
  loadRemote: jest.fn(),
  registerRemotes: jest.fn(),
}));

// Mock @callstack/repack/client
jest.mock('@callstack/repack/client', () => ({
  ScriptManager: {
    shared: {
      addResolver: jest.fn(),
      loadScript: jest.fn(),
    },
  },
}));

import { moduleLoader, ModuleCatalog } from '../src/modules/moduleLoader';
import { init, loadRemote, registerRemotes } from '@module-federation/runtime';
import { ScriptManager } from '@callstack/repack/client';

const mockCatalog: ModuleCatalog = {
  version: '1.0.0',
  lastUpdated: '2026-10-08',
  modules: [
    {
      id: 'doctor',
      name: 'Doctor',
      version: '1.0.0',
      url: 'http://10.0.2.2:9000/modules/doctor/doctor.container.bundle',
      size: 45863,
      checksum: '765ebac94dd10c79c9295b5d373d293deff80adbfef84c8e889d858d50e51694',
      platform: 'android',
    },
    {
      id: 'barber',
      name: 'Barber',
      version: '1.0.0',
      url: 'http://10.0.2.2:9000/modules/barber/barber.container.bundle',
      size: 45863,
      checksum: '1fdfaa2b0cf79a5136350efb9de80e4615705fd901145722893ffb5270cc14a1',
      platform: 'android',
    },
  ],
};

describe('Module Loader with Module Federation Runtime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    // Reset moduleLoader state by clearing its internal maps
    (moduleLoader as any).catalog = null;
    (moduleLoader as any).resolverRegistered = false;
    (moduleLoader as any).loadedModules = new Map();
  });

  it('should fetch and parse module catalog', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCatalog,
    });

    const catalog = await moduleLoader.fetchCatalog();

    expect(catalog.modules).toHaveLength(2);
    expect(catalog.modules[0].id).toBe('doctor');
    expect(fetch).toHaveBeenCalledWith('http://10.0.2.2:9000/catalog.json');
  });

  it('should validate SHA-256 checksum correctly', async () => {
    const data = 'test module data';
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(data);
    const arrayBuffer = uint8Array.buffer.slice(
      uint8Array.byteOffset,
      uint8Array.byteOffset + uint8Array.byteLength
    );

    const sha256 = require('js-sha256');
    const correctHash = sha256(new Uint8Array(arrayBuffer));

    const testCatalog: ModuleCatalog = {
      version: '1.0.0',
      lastUpdated: '2026-10-08',
      modules: [
        {
          id: 'test',
          name: 'Test',
          url: 'http://10.0.2.2:9000/test.bundle',
          size: arrayBuffer.byteLength,
          checksum: correctHash,
          platform: 'android',
          version: '1.0.0',
        },
      ],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => testCatalog,
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => arrayBuffer,
      });

    await moduleLoader.fetchCatalog();
    const isValid = await moduleLoader.verifyChecksum('test');

    expect(isValid).toBe(true);
  });

  it('should reject mismatched checksum', async () => {
    const testCatalog: ModuleCatalog = {
      version: '1.0.0',
      lastUpdated: '2026-10-08',
      modules: [
        {
          id: 'bad',
          name: 'Bad',
          url: 'http://10.0.2.2:9000/bad.bundle',
          size: 100,
          checksum: 'incorrecthash',
          platform: 'android',
          version: '1.0.0',
        },
      ],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => testCatalog,
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(100),
      });

    await moduleLoader.fetchCatalog();

    await expect(moduleLoader.verifyChecksum('bad')).rejects.toThrow('Checksum mismatch');
  });

  it('should register resolver only once', async () => {
    const arrayBuffer = new ArrayBuffer(100);
    const correctHash = require('js-sha256')(new Uint8Array(arrayBuffer));

    const catalogWithCorrectHash: ModuleCatalog = {
      ...mockCatalog,
      modules: mockCatalog.modules.map((m) => ({ ...m, checksum: correctHash })),
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => catalogWithCorrectHash,
      arrayBuffer: async () => arrayBuffer,
    });

    (loadRemote as jest.Mock).mockResolvedValue({ default: () => 'MockComponent' });

    // First loadModule will call addResolver
    await moduleLoader.fetchCatalog();
    await moduleLoader.loadModule('doctor');
    
    // Second loadModule should NOT call addResolver again
    await moduleLoader.loadModule('barber');

    expect(ScriptManager.shared.addResolver).toHaveBeenCalledTimes(1);
  });

  it('should register remote and call loadRemote with correct params', async () => {
    const arrayBuffer = new ArrayBuffer(100);
    const correctHash = require('js-sha256')(new Uint8Array(arrayBuffer));

    const catalogWithCorrectHash: ModuleCatalog = {
      ...mockCatalog,
      modules: [{ ...mockCatalog.modules[0], checksum: correctHash }],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => catalogWithCorrectHash,
      arrayBuffer: async () => arrayBuffer,
    });

    const mockComponent = { default: () => 'DoctorComponent' };
    (loadRemote as jest.Mock).mockResolvedValue(mockComponent);

    await moduleLoader.fetchCatalog();
    const component = await moduleLoader.loadModule('doctor');

    expect(registerRemotes).toHaveBeenCalledWith([
      {
        name: 'doctor',
        entry: 'http://10.0.2.2:9000/modules/doctor/doctor.container.bundle',
      },
    ]);

    expect(loadRemote).toHaveBeenCalledWith('doctor/Module');
    expect(component).toBe(mockComponent);
  });

  it('should prevent loadRemote if checksum verification fails', async () => {
    const badCatalog: ModuleCatalog = {
      version: '1.0.0',
      lastUpdated: '2026-10-08',
      modules: [
        {
          id: 'evil',
          name: 'Evil',
          url: 'http://10.0.2.2:9000/evil.bundle',
          size: 100,
          checksum: 'wronghash',
          platform: 'android',
          version: '1.0.0',
        },
      ],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => badCatalog,
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(100),
      });

    await moduleLoader.fetchCatalog();

    await expect(moduleLoader.loadModule('evil')).rejects.toThrow('Checksum mismatch');
    expect(registerRemotes).not.toHaveBeenCalled();
    expect(loadRemote).not.toHaveBeenCalled();
  });

  it('should initialize MF runtime with ScriptManager resolver', async () => {
    const arrayBuffer = new ArrayBuffer(100);
    const correctHash = require('js-sha256')(new Uint8Array(arrayBuffer));

    const catalogWithCorrectHash: ModuleCatalog = {
      ...mockCatalog,
      modules: [{ ...mockCatalog.modules[0], checksum: correctHash }],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => catalogWithCorrectHash,
      arrayBuffer: async () => arrayBuffer,
    });

    (loadRemote as jest.Mock).mockResolvedValue({ default: () => 'Component' });

    await moduleLoader.fetchCatalog();
    await moduleLoader.loadModule('doctor');

    expect(ScriptManager.shared.addResolver).toHaveBeenCalledWith(expect.any(Function));

    const calls = (ScriptManager.shared.addResolver as jest.Mock).mock.calls;
    const resolverFn = calls[calls.length - 1][0];
    const result = await resolverFn('http://example.com/bundle.js');

    expect(result).toEqual({
      url: 'http://example.com/bundle.js',
      method: 'GET',
      verifyScriptSignature: 'strict',
    });
    
    expect(registerRemotes).toHaveBeenCalledWith([
      {
        name: 'doctor',
        entry: 'http://10.0.2.2:9000/modules/doctor/doctor.container.bundle',
      },
    ]);
    expect(loadRemote).toHaveBeenCalledWith('doctor/Module');
  });
});
