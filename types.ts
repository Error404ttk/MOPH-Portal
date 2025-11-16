import * as LucideIcons from 'lucide-react';

export type IconName = keyof typeof LucideIcons;

export interface LinkItem {
  name: string;
  url: string;
  icon: IconName;
  description?: string;
}

export interface LinkCategory {
  // FIX: Add id property to match data structure and fix usage in components.
  id: number;
  title: string;
  description?: string;
  links: LinkItem[];
}

export interface FooterData {
  copyrightText: string;
  descriptionText: string;
}

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this should be hashed
  name: string;
  role: 'admin' | 'editor';
  lastLogin?: string;
  mustChangePassword?: boolean;
}

export interface DatabaseConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
  isInitialized: boolean;
}

export interface About {
  id: number;
  title: string;
  content: string;
  updated_at?: string;
}
