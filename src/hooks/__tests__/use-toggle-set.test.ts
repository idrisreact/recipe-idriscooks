import { renderHook, act } from '@testing-library/react';
import { useToggleSet } from '../use-toggle-set';

describe('useToggleSet', () => {
  it('should initialize with empty set', () => {
    const { result } = renderHook(() => useToggleSet<string>());

    expect(result.current.items.size).toBe(0);
  });

  it('should initialize with provided items', () => {
    const initialItems = ['item1', 'item2', 'item3'];
    const { result } = renderHook(() => useToggleSet(initialItems));

    expect(result.current.items.size).toBe(3);
    expect(result.current.has('item1')).toBe(true);
    expect(result.current.has('item2')).toBe(true);
    expect(result.current.has('item3')).toBe(true);
  });

  it('should toggle items on and off', () => {
    const { result } = renderHook(() => useToggleSet<string>());

    act(() => {
      result.current.toggle('item1');
    });

    expect(result.current.has('item1')).toBe(true);

    act(() => {
      result.current.toggle('item1');
    });

    expect(result.current.has('item1')).toBe(false);
  });

  it('should add items', () => {
    const { result } = renderHook(() => useToggleSet<string>());

    act(() => {
      result.current.add('item1');
      result.current.add('item2');
    });

    expect(result.current.items.size).toBe(2);
    expect(result.current.has('item1')).toBe(true);
    expect(result.current.has('item2')).toBe(true);
  });

  it('should remove items', () => {
    const { result } = renderHook(() => useToggleSet(['item1', 'item2']));

    act(() => {
      result.current.remove('item1');
    });

    expect(result.current.items.size).toBe(1);
    expect(result.current.has('item1')).toBe(false);
    expect(result.current.has('item2')).toBe(true);
  });

  it('should clear all items', () => {
    const { result } = renderHook(() => useToggleSet(['item1', 'item2', 'item3']));

    expect(result.current.items.size).toBe(3);

    act(() => {
      result.current.clear();
    });

    expect(result.current.items.size).toBe(0);
  });

  it('should add all items with toggleAll', () => {
    const { result } = renderHook(() => useToggleSet<string>());
    const itemsToAdd = ['item1', 'item2', 'item3'];

    act(() => {
      result.current.toggleAll(itemsToAdd, true);
    });

    expect(result.current.items.size).toBe(3);
    itemsToAdd.forEach((item) => {
      expect(result.current.has(item)).toBe(true);
    });
  });

  it('should remove all items with toggleAll', () => {
    const initialItems = ['item1', 'item2', 'item3'];
    const { result } = renderHook(() => useToggleSet(initialItems));

    act(() => {
      result.current.toggleAll(['item1', 'item2'], false);
    });

    expect(result.current.items.size).toBe(1);
    expect(result.current.has('item1')).toBe(false);
    expect(result.current.has('item2')).toBe(false);
    expect(result.current.has('item3')).toBe(true);
  });

  it('should work with numbers', () => {
    const { result } = renderHook(() => useToggleSet<number>([1, 2, 3]));

    expect(result.current.has(1)).toBe(true);

    act(() => {
      result.current.toggle(1);
      result.current.add(4);
    });

    expect(result.current.has(1)).toBe(false);
    expect(result.current.has(4)).toBe(true);
    expect(result.current.items.size).toBe(3);
  });

  it('should work with objects', () => {
    interface Item {
      id: number;
      name: string;
    }

    const item1: Item = { id: 1, name: 'First' };
    const item2: Item = { id: 2, name: 'Second' };

    const { result } = renderHook(() => useToggleSet<Item>([item1]));

    expect(result.current.has(item1)).toBe(true);

    act(() => {
      result.current.add(item2);
    });

    expect(result.current.items.size).toBe(2);
    expect(result.current.has(item2)).toBe(true);
  });

  it('should not add duplicate items', () => {
    const { result } = renderHook(() => useToggleSet<string>());

    act(() => {
      result.current.add('item1');
      result.current.add('item1');
      result.current.add('item1');
    });

    expect(result.current.items.size).toBe(1);
  });

  it('should handle toggle with initially present item', () => {
    const { result } = renderHook(() => useToggleSet(['item1']));

    expect(result.current.has('item1')).toBe(true);

    act(() => {
      result.current.toggle('item1');
    });

    expect(result.current.has('item1')).toBe(false);
  });
});
