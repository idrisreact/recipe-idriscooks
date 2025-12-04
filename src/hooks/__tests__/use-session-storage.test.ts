import { renderHook, act } from '@testing-library/react';
import { useSessionStorage } from '../use-session-storage';

describe('useSessionStorage', () => {
  const TEST_KEY = 'testKey';
  const TEST_VALUE = 'testValue';

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it('should return initial value when no stored value exists', () => {
    const { result } = renderHook(() => useSessionStorage(TEST_KEY, TEST_VALUE));

    expect(result.current[0]).toBe(TEST_VALUE);
  });

  it('should return stored value if it exists', () => {
    sessionStorage.setItem(TEST_KEY, JSON.stringify('storedValue'));

    const { result } = renderHook(() => useSessionStorage(TEST_KEY, TEST_VALUE));

    expect(result.current[0]).toBe('storedValue');
  });

  it('should update sessionStorage when value is set', () => {
    const { result } = renderHook(() => useSessionStorage(TEST_KEY, TEST_VALUE));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(sessionStorage.getItem(TEST_KEY)).toBe(JSON.stringify('newValue'));
  });

  it('should handle function updater', () => {
    const { result } = renderHook(() => useSessionStorage(TEST_KEY, 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it('should remove value from sessionStorage', () => {
    const { result } = renderHook(() => useSessionStorage(TEST_KEY, TEST_VALUE));

    act(() => {
      result.current[1]('newValue');
    });

    expect(sessionStorage.getItem(TEST_KEY)).not.toBeNull();

    act(() => {
      result.current[2]();
    });

    expect(sessionStorage.getItem(TEST_KEY)).toBeNull();
    expect(result.current[0]).toBe(TEST_VALUE);
  });

  it('should work with objects', () => {
    const initialObj = { name: 'John', age: 30 };
    const { result } = renderHook(() => useSessionStorage(TEST_KEY, initialObj));

    expect(result.current[0]).toEqual(initialObj);

    const newObj = { name: 'Jane', age: 25 };

    act(() => {
      result.current[1](newObj);
    });

    expect(result.current[0]).toEqual(newObj);
    expect(JSON.parse(sessionStorage.getItem(TEST_KEY)!)).toEqual(newObj);
  });

  it('should work with arrays', () => {
    const initialArray = [1, 2, 3];
    const { result } = renderHook(() => useSessionStorage(TEST_KEY, initialArray));

    expect(result.current[0]).toEqual(initialArray);

    act(() => {
      result.current[1]([...initialArray, 4]);
    });

    expect(result.current[0]).toEqual([1, 2, 3, 4]);
  });

  it('should work with boolean values', () => {
    const { result } = renderHook(() => useSessionStorage(TEST_KEY, false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });

  it('should handle JSON parse errors gracefully', () => {
    sessionStorage.setItem(TEST_KEY, 'invalid-json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useSessionStorage(TEST_KEY, TEST_VALUE));

    expect(result.current[0]).toBe(TEST_VALUE);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle storage errors when setting', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full');
    });

    const { result } = renderHook(() => useSessionStorage(TEST_KEY, TEST_VALUE));

    act(() => {
      result.current[1]('newValue');
    });

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it('should handle storage errors when removing', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useSessionStorage(TEST_KEY, TEST_VALUE));

    act(() => {
      result.current[2]();
    });

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    removeItemSpy.mockRestore();
  });

  it('should sync across storage events', () => {
    const { result } = renderHook(() => useSessionStorage(TEST_KEY, TEST_VALUE));

    const newValue = 'updatedValue';
    const storageEvent = new StorageEvent('storage', {
      key: TEST_KEY,
      newValue: JSON.stringify(newValue),
      storageArea: sessionStorage,
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    expect(result.current[0]).toBe(newValue);
  });

  it('should handle different keys independently', () => {
    const { result: result1 } = renderHook(() => useSessionStorage('key1', 'value1'));
    const { result: result2 } = renderHook(() => useSessionStorage('key2', 'value2'));

    expect(result1.current[0]).toBe('value1');
    expect(result2.current[0]).toBe('value2');

    act(() => {
      result1.current[1]('newValue1');
    });

    expect(result1.current[0]).toBe('newValue1');
    expect(result2.current[0]).toBe('value2');
  });
});
