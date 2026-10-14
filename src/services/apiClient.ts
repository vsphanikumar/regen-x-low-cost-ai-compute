/**
 * REGEN-X Enterprise API Client & Orchestration Service
 * Centralized HTTP transport layer with exponential backoff retries,
 * timeout controls, typed error handling, and structured telemetry.
 */
import { GridNode, ComputeJob, ComplianceRecord, OrchestrationResponse } from '../types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  backoffFactor?: number;
}

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRIES = 2;

async function requestWithRetry<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    backoffFactor = 1.5,
    ...fetchOptions
  } = options;

  let attempt = 0;
  let delayMs = 300;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        ...fetchOptions,
        signal: options.signal || controller.signal,
      });
      clearTimeout(timeoutTimer);

      if (!response.ok) {
        let errJson: any = null;
        try {
          errJson = await response.json();
        } catch {
          // Non-JSON response
        }
        throw new ApiError(
          errJson?.message || `HTTP Request failed with status ${response.status}`,
          response.status,
          errJson?.error_code || 'HTTP_ERROR',
          errJson
        );
      }

      return (await response.json()) as T;
    } catch (error: any) {
      clearTimeout(timeoutTimer);
      if (error?.name === 'AbortError') {
        throw new ApiError(`Request to ${endpoint} timed out after ${timeoutMs}ms`, 408, 'TIMEOUT');
      }

      attempt++;
      if (attempt > retries) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(error?.message || 'Network request failed', 0, 'NETWORK_ERROR', error);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= backoffFactor;
    }
  }

  throw new ApiError('Max retry limit exceeded', 500, 'MAX_RETRIES');
}

export const ApiClient = {
  /**
   * Ingest live grid telemetry nodes across all registered energy corridors
   */
  async getNodes(signal?: AbortSignal): Promise<GridNode[]> {
    return requestWithRetry<GridNode[]>('/v1/grid/telemetry', { signal });
  },

  /**
   * Retrieve active batch compute workload queue and allocations
   */
  async getJobs(signal?: AbortSignal): Promise<ComputeJob[]> {
    return requestWithRetry<ComputeJob[]>('/v1/jobs', { signal });
  },

  /**
   * Retrieve cryptographic BigQuery Green Compute Passport audit ledger
   */
  async getComplianceRecords(signal?: AbortSignal): Promise<ComplianceRecord[]> {
    return requestWithRetry<ComplianceRecord[]>('/v1/compliance/passport', { signal });
  },

  /**
   * Execute real-time multi-agent arbitrage optimization loop
   */
  async executeArbitrage(
    payload: {
      region_id: string;
      target_job_id: string;
      sla_is_urgent: boolean;
      data_residency_restriction: 'DOMESTIC_ONLY' | 'GLOBAL_FLUID';
    },
    signal?: AbortSignal
  ): Promise<OrchestrationResponse> {
    return requestWithRetry<OrchestrationResponse>('/v1/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeoutMs: 15000,
      retries: 1,
      signal,
    });
  },

  /**
   * Inject weather or market simulation overrides into target grid node
   */
  async overrideSimulation(
    payload: {
      region_id: string;
      mock_curtailment_mwh?: number;
      mock_spot_price?: number;
      solar_irradiance_factor?: number;
      wind_gust_factor?: number;
    },
    signal?: AbortSignal
  ): Promise<{ status: string; node: GridNode }> {
    return requestWithRetry<{ status: string; node: GridNode }>('/v1/simulation/override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeoutMs: 8000,
      retries: 1,
      signal,
    });
  },
};
