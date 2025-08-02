// Settings type definitions

export interface Settings {
  // Application whitelist
  whitelistedApps: string[]; // Array of process paths
  
  // Future settings can be added here
  // theme?: 'light' | 'dark' | 'system';
  // autoRefreshInterval?: number;
  // defaultDevice?: string;
}

export const defaultSettings: Settings = {
  whitelistedApps: [],
};