export type EnergyType = 'SOLAR' | 'WIND' | 'HYDRO' | 'HYBRID';
export type HardwareStatus = 'HEALTHY' | 'DRAINING' | 'FAULT';
export type JobStatus = 'PENDING' | 'TRAINING' | 'SCALED_SPONGE' | 'THROTTLED' | 'COMPLETED';
export type ResidencyRule = 'DOMESTIC_ONLY' | 'GLOBAL_FLUID';
export type RoutingDecision = 'SCALE_MAX_SPONGE' | 'MODULATE_GPU_POWER_THROTTLE' | 'ACTIVATE_HYBRID_BASELINE_SLA';
export type SustainabilityRating = 'A+' | 'A' | 'B';

export interface GridNode {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  energyType: EnergyType;
  spotPricePerMWh: number;
  curtailmentMWh: number;
  availablePowerMWh: number;
  hardwareStatus: HardwareStatus;
  activeContainers: number;
  carbonAvoidanceRateKgPerMWh: number;
  lastTelemetryTimestamp: string;
  ippSupplier?: string;
  cercClassification?: string;
  sldcFeedSource?: string;
  parkFootprintKm2?: number;
  healthMetrics?: {
    gpuThermalCelsius?: number;
    thermalEfficiencyPct?: number;
    tflopsPerWatt?: number;
    coolingPue?: number;
    coolingMethod?: string;
    flowRateLpm?: number;
    avgContainerUptimeHours?: number;
    containerReliabilityPct?: number;
    restartsCount24h?: number;
    pduFrequencyHz?: number;
    inverterSyncStatus?: string;
    nvlinkBandwidthGbps?: number;
    eccCorrectedErrors?: number;
    dieTemperatures?: number[];
  };
}

export interface ComputeJob {
  jobId: string;
  clientOwner: string;
  frameworkType: 'PYTORCH_DDP' | 'NEMO_MEGATRON' | 'SYNTHETIC_DATA_GEN' | 'MEDIA_RENDER';
  dataResidency: ResidencyRule;
  slaUrgent: boolean;
  status: JobStatus;
  allocatedNodeId: string;
  allocatedNodeName: string;
  gpusRequested: number;
  carbonAvoidedTons: number;
  startTime: string;
}

export interface GreenComputePassport {
  passportTokenId: string;
  targetJobId: string;
  clientOwner: string;
  verifiedRenewableSource: string;
  executionGeoLocation: string;
  regionId: string;
  netCarbonAvoidedMetricTons: number;
  sustainabilityScoreRating: SustainabilityRating;
  routingDecision: RoutingDecision;
  sovereigntySignature: 'PASSED_DOMESTIC_BOUNDARY' | 'PASSED_GLOBAL_FLUID';
  executionTimestamp: string;
  cryptographicSignature: string;
  // Aliases for API compatibility
  passport_token_id?: string;
  target_job_id?: string;
  verified_renewable_source?: string;
  execution_geo_location?: string;
  net_carbon_avoided_metric_tons?: number;
  sustainability_score_rating?: string;
  execution_timestamp?: string;
}

export type ComplianceRecord = GreenComputePassport;

export interface SimulationState {
  curtailmentDelta: number;
  spotPriceDelta: number;
  solarIrradianceFactor: number;
  windGustFactor: number;
}

export interface OrchestrationResponse {
  status: string;
  concurrency_token: string;
  gemini_structured_output: {
    validated_target_region: string;
    routing_action_decision: RoutingDecision;
    decision_confidence_score: number;
    data_sovereignty_signature: string;
    reasoning_summary: string;
    hardware_action_dispatched: string;
    spot_market_price_per_mwh: number;
    verified_stranded_power_mwh: number;
    passport_ledger: GreenComputePassport;
  };
}

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'TELEMETRY' | 'AGENT' | 'PASSPORT' | 'WARN' | 'ERROR';
  message: string;
  details?: string;
}

export interface CurtailmentToast {
  id: string;
  nodeId: string;
  nodeName: string;
  energyType: EnergyType;
  curtailmentMWh: number;
  availablePowerMWh: number;
  spotPricePerMWh: number;
  thresholdMWh: number;
  timestamp: string;
  severity: 'WARNING' | 'CRITICAL' | 'SURGE';
  read?: boolean;
  matchedJobId?: string;
  matchedJobName?: string;
  targetGpus?: number;
  opportunityScore?: number;
  customerSavingsEst?: number;
  customerSavingsPct?: number;
  saasRevenueSpreadEst?: number;
  stabilityWindowMin?: number;
  humanApprovalRequired?: boolean;
  conceptReasoning?: string;
}
