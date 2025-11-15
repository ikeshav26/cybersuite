import axios from 'axios';
import { env } from '@/lib/env';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  private: boolean;
  language?: string;
  stargazers_count?: number;
  forks_count?: number;
  updated_at: string;
}

export interface RepositoryWithStatus extends Repository {
  isProtected: boolean;
  lastScan?: Date;
  vulnerabilitiesCount?: number;
  openPR?: {
    number: number;
    title: string;
    url: string;
    created_at: string;
  };
}

export interface ScanResult {
  owner: string;
  repo: string;
  vulnerabilities: Array<{
    id: string;
    severity: string;
    type: string;
    file: string;
    line: number;
    description: string;
  }>;
  scannedAt: Date;
  filesScanned: number;
}

/**
 * Fetch user repositories with installation status
 */
export async function fetchUserRepositories(
  username: string,
  installationId: number
): Promise<{
  success: boolean;
  installed: boolean;
  repositories: Repository[];
  repository_count: number;
}> {
  const response = await axios.post(`${env.AI_SERVICE_URL}/user/${username}/repositories`, {
    installationId,
  });
  return response.data.data;
}

/**
 * Scan a repository for vulnerabilities
 */
export async function scanRepository(
  owner: string,
  repo: string,
  installationId: number
): Promise<ScanResult> {
  const response = await axios.post(`${env.AI_SERVICE_URL}/scan-repository`, {
    owner,
    repo,
    installationId,
  });
  return response.data.data;
}

/**
 * Get repository scan status
 */
export async function getRepositoryStatus(
  owner: string,
  repo: string
): Promise<{
  lastScan?: Date;
  vulnerabilitiesCount: number;
  openPR?: {
    number: number;
    title: string;
    url: string;
    created_at: string;
  };
}> {
  const response = await axios.get(`${env.AI_SERVICE_URL}/repositories/${owner}/${repo}/status`);
  return response.data.data;
}

/**
 * Generate a pull request with security fixes
 */
export async function generateSecurityPR(
  vulnerabilityIds: string[],
  title: string,
  description: string,
  owner: string,
  repo: string,
  installationId: number
): Promise<{
  id: string;
  prNumber: number;
  title: string;
  url: string;
  status: string;
}> {
  const response = await axios.post(`${env.AI_SERVICE_URL}/generate-pr`, {
    vulnerabilityIds,
    title,
    description,
    owner,
    repo,
    installationId,
  });
  return response.data.data;
}
