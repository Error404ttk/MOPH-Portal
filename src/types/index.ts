export interface LinkItem {
  name: string;
  url: string;
  description?: string;
  icon?: string;
}

export interface LinkCategory {
  id: string | number;  // Made id required
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
  password: string;
  name: string;
  role: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  waitForConnections?: boolean;
  connectionLimit?: number;
  queueLimit?: number;
  isInitialized?: boolean;
}
