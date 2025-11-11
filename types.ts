import * as LucideIcons from 'lucide-react';

export type IconName = keyof typeof LucideIcons;

export interface LinkItem {
  name: string;
  url: string;
  icon: IconName;
  description?: string;
}

export interface LinkCategory {
  id: string | number;
  title: string;
  description?: string;
  links: LinkItem[];
  sort_order?: number;
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