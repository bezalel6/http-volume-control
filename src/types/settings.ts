// Settings type definitions

export interface Settings {
  // Basic test setting
  name: string;
  
  // Future settings can be added here
  // theme?: 'light' | 'dark' | 'system';
  // autoRefreshInterval?: number;
  // defaultDevice?: string;
}

export const defaultSettings: Settings = {
  name: 'User',
};