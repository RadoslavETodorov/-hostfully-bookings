const KEY = 'hostfully.bookings.v1';

export function loadFromStorage<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return fallback;
    };

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  };
};

export function saveToStorage<T>(value: T) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // ignore
  };
};
