
export class AppStorageService {

  constructor() {
  }

  setBoolean(key: string, value: boolean): void {
    localStorage.setItem(key, value ? 'true' : 'false');
  }

  setNumber(key: string, value: number): void {
    localStorage.setItem(key, `${value}`);
  }

  setString(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  getBoolean(key: string, defaultValue: boolean = false): boolean | null {
    if (!this.hasKey(key)) {
      return defaultValue;
    }
    const value = this.getNullableItem(key);
    return value === null ? null : value == 'true';
  }

  getNumber(key: string, defaultValue: number | null = null): number | null {
    if (!this.hasKey(key)) {
      return defaultValue;
    }
    const value = this.getNullableItem(key);
    return value === null ? null : +value;
  }

  getString(key: string, defaultValue: string | null = null): string | null {
    if (!this.hasKey(key)) {
      return defaultValue;
    }
    return localStorage.getItem(key);
  }

  hasKey(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }

  private getNullableItem(key: string): any {
    const value = localStorage.getItem(key);
    if (value === 'null') {
      return null;
    }
    return value;
  }
}

export const appStorageService = new AppStorageService();