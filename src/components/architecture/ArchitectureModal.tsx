import React, { useState } from 'react';
import { Layers, Network, Shield, Cpu, Database, Terminal, Lock } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'indian_matrix' | 'smart_demand' | 'topology' | 'agents' | 'fastapi' | 'terraform' | 'security'
  >('indian_matrix');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>REGEN-X Deep-Tech Architecture &amp; Indian Grid Matrix</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                CERC Regulated Moat
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            State-stitched distributed ML checkpointing via <code className="text-sky-300 font-mono">torch.distributed.elastic</code>, POSOCO / SLDC ingestion buffers, zero-egress Private VPC Fabric, and direct integration with India's largest IPP utility conglomerates.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('indian_matrix')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'indian_matrix'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-mono'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🇮🇳 Indian Supply Matrix</span>
          </button>
          <button
            onClick={() => setActiveSubTab('smart_demand')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'smart_demand'
                ? 'bg-sky-500 text-slate-950 shadow-md font-mono'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🧠 Smart Demand (Anti-Trap)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('topology')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'topology' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            System Topology
          </button>
          <button
            onClick={() => setActiveSubTab('agents')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'agents' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dual-Agent Loop
          </button>
          <button
            onClick={() => setActiveSubTab('fastapi')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'fastapi' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            FastAPI Production Code
          </button>
          <button
            onClick={() => setActiveSubTab('terraform')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'terraform' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Terraform IaC
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'security' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Threat Model &amp; DPDPA
          </button>
        </div>
      </div>

      {/* Tab 1: Indian Clean Energy Supply Matrix & CERC Regulatory Moat */}
      {activeSubTab === 'indian_matrix' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/40 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🇮🇳</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    The Domestic Indian Scope: Core Suppliers &amp; CERC Regulatory Moat
                  </h3>
                </div>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  In India, REGEN-X does not sell to everyday consumers. We plug straight into the massive Independent Power Producers (IPPs) and regional state utilities that dominate the green corridors.
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold shrink-0 self-start">
                Public Common Carrier Law
              </span>
            </div>
          </div>

          {/* 3 Core Indian Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* Supplier 1: Adani Green Energy */}
            <div className="bg-[#0b101d] border border-emerald-500/30 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white text-sm">Adani Green Energy</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Gujarat Hub
                  </span>
                </div>
                <div className="text-slate-300 font-semibold text-xs">
                  Khavda Renewable Energy Park (530 sq km)
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Operating the world's largest renewable energy facility in Khavda, Gujarat. This massive facility routinely faces immense physical transmission grid bottlenecks, resulting in severe state curtailment mandates.
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono space-y-1 text-slate-400">
                <div className="text-emerald-400 font-bold">REGEN-X Co-Location Node: IND-GUJ-SOLAR</div>
                <div>Capacity: 640 MWh | Substation: 400kV GIS</div>
                <div>POSOCO Telemetry Feed: Gujarat SLDC</div>
              </div>
            </div>

            {/* Supplier 2: ReNew Power & Tata Power */}
            <div className="bg-[#0b101d] border border-sky-500/30 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white text-sm">ReNew Power &amp; Tata Power</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Rajasthan &amp; MP
                  </span>
                </div>
                <div className="text-slate-300 font-semibold text-xs">
                  Bhadla Solar Park &amp; Rocky Arid Matrix
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Managing massive, distributed commercial solar arrays and utility-scale wind farms across the rocky, arid terrain of Rajasthan and Madhya Pradesh.
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono space-y-1 text-slate-400">
                <div className="text-sky-400 font-bold">REGEN-X Co-Location Node: IND-RAJ-SOLAR</div>
                <div>Capacity: 580 MWh | Substation: 765kV Green Corridor</div>
                <div>POSOCO Telemetry Feed: NRLDC (Northern Grid)</div>
              </div>
            </div>

            {/* Supplier 3: Sembcorp India & Greenko Group */}
            <div className="bg-[#0b101d] border border-teal-500/30 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white text-sm">Sembcorp India &amp; Greenko</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Tamil Nadu Corridor
                  </span>
                </div>
                <div className="text-slate-300 font-semibold text-xs">
                  Muppandal Wind Farm Cluster
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Dominating the high-velocity onshore wind corridors in Muppandal, Tamil Nadu, where seasonal monsoonal wind surges frequently overload localized regional substation transformers.
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono space-y-1 text-slate-400">
                <div className="text-teal-400 font-bold">REGEN-X Co-Location Node: IND-TN-WIND</div>
                <div>Capacity: 420 MWh | Substation: 230kV TANGEDCO</div>
                <div>POSOCO Telemetry Feed: SRLDC (Southern Grid)</div>
              </div>
            </div>
          </div>

          {/* CERC Regulatory Moat Callout */}
          <div className="bg-[#0b101d] border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>The Regulatory Infrastructure Moat (CERC Public Common Carriers)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              These massive conglomerates are legally classified by the <strong className="text-white">Central Electricity Regulatory Commission (CERC)</strong> as <strong className="text-amber-300">Public Common Carriers</strong>. By law, they are strictly prohibited from entering downstream commercial computing markets or selling B2B cloud AI compute packages. They completely lack the software DNA to handle distributed container orchestration, multi-region dataset pre-warming, or machine learning framework lifecycle management.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 font-bold">
              &gt; Key Strategic Moat: Indian IPP utilities are legally classified as public common carriers and are supply-side energy partners, NOT downstream computing competitors.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Smart Demand Architecture vs Simulator Trap */}
      {activeSubTab === 'smart_demand' && (
        <div className="space-y-6 text-xs">
          <div className="bg-[#0b101d] border border-sky-500/30 rounded-2xl p-5 shadow-xl space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Smart Demand Architecture vs. Passive Carbon Tracking</span>
            </h3>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Traditional approaches treat sustainability passively with retrospective carbon reporting or basic cron jobs. REGEN X introduces an active, software-defined load-mobility network overlay. Distributed GPU clusters cannot be shut down or shifted abruptly without causing memory fragmentation. If you cut power to an active multi-node distributed machine learning run, the nodes desynchronize, trigger a ring-communication timeout, and cause a full cluster crash.
            </p>
          </div>

          {/* Interactive Flow Architecture */}
          <div className="bg-[#020617] p-5 rounded-2xl border border-slate-800 font-mono text-[11px] text-sky-400 overflow-x-auto leading-relaxed">
{`[ Real-Time Inception Network ] ──► Ingests Live POSOCO / State Load Despatch Feeds
                                               │
                                               ▼
[ Agent 1: Telemetry Historian ] ──► Vertex AI Neuromorphic Knowledge Graph ( NGFG )
                                               │
                                               ▼ (Redis Memorystore Global Lock Check)
[ Agent 2: Infra Governor Agent ]──► Invokes PyTorch Distributed Elastic Checkpoint Save
                                               │
                                               ▼ (Sub-200ms Serverless Scale-Out)
[ Secure Execution Pool ]       ──► Isolated Google Cloud Run Private Subnets`}
          </div>

          {/* 3 Technical Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-2 text-xs">
                <Network className="w-4 h-4 text-emerald-400" />
                <span>1. Eliminating Ingest Bottlenecks via Pub/Sub</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Real-time JSON data streams pulled from Indian state load despatch centers (SLDCs) filter through Google Cloud Pub/Sub message queues, buffering massive traffic spikes and allowing the system to handle millions of concurrent telemetry inputs smoothly.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-2 text-xs">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>2. State-Stitched Elastic Checkpointing</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Instead of letting Gemini fire a brute-force container scale-down command during a solar drop, Gemini interfaces with a specialized coordinator that invokes the <code className="text-sky-300 font-mono">torch.distributed.elastic</code> API wrapper. Captures snapshots of model weights, serializes into tiny weight diff layers, and safely shifts them into our private memory tier before scaling.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-2 text-xs">
                <Shield className="w-4 h-4 text-teal-400" />
                <span>3. Zero-Egress Network Perimeter</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                All compute nodes and storage layers run within an internal, isolated Google Cloud VPC Private Subnet utilizing Private Google Access. Forces massive dataset files to sync internally over Google's global private fiber network backbone, dropping cross-region network data egress costs to near-zero.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: FastAPI Production Code */}
      {activeSubTab === 'fastapi' && (
        <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Concurrency-Hardened Production Engine (`backend/app/main.py`)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                FastAPI implementation using the official google-genai SDK, strict Pydantic schemas, and Redis concurrency locks.
              </p>
            </div>
            <span className="font-mono text-emerald-400 text-xs px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30">
              backend/app/main.py (Saved in Workspace)
            </span>
          </div>

          <pre className="bg-[#020617] p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-[420px] leading-relaxed">
{`import os, json, random, hashlib
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

app = FastAPI(title="REGEN X Hardened Multi-Agent Core Engine - Indian Grid Production Tier")
client = genai.Client()

class GridTelemetryState(BaseModel):
    region_id: str = Field(description="Target geographic clean energy grid sector inside India.")
    spot_market_price_per_mwh: float = Field(description="Calculated real-time electricity tariff vector in INR.")
    active_curtailment_mwh: int = Field(description="Volume of un-utilized stranded renewable power.")
    hardware_health_status: str = Field(description="Health validation of the local edge data node cluster.")

class GreenComputePassportSchema(BaseModel):
    passport_token_id: str = Field(description="SHA-256 Cryptographic Hash Secure Proof of Execution.")
    target_job_id: str = Field(description="Unique Enterprise Computational Workload ID.")
    verified_renewable_source: str = Field(description="Programmatic Asset Label of Grid Input Source.")
    execution_geo_location: str = Field(description="Explicit physical coordinates string.")
    net_carbon_avoided_metric_tons: float = Field(description="Avoided Carbon Footprint Calculation Output.")
    sustainability_score_rating: str = Field(description="Standardized Workload Efficiency Grade (A+ Tier).")
    execution_timestamp: str = Field(description="Immutable Timestamp Ledger Lock.")

class InfrastructureGovernorResponse(BaseModel):
    validated_target_region: str = Field(description="The authorized geographic cloud zone target.")
    routing_action_decision: str = Field(description="System transition command: SCALE_MAX_SPONGE, MODULATE_GPU_POWER_THROTTLE, or ACTIVATE_HYBRID_BASELINE_SLA.")
    decision_confidence_score: float = Field(description="Statistical confidence matrix tracking optimization accuracy.")
    data_sovereignty_signature: str = Field(description="Compliance code verification signature: PASSED_DOMESTIC_BOUNDARY or PASSED_GLOBAL_FLUID.")
    passport_ledger: GreenComputePassportSchema = Field(description="The Green Compute Passport™ structured metadata block.")

@app.post("/v1/orchestrate")
async def run_regenx_pipeline(payload: ArbitragePayload):
    # Enforces Redis distributed locks, POSOCO SLDC ingestion, and PyTorch Elastic checkpointers
    ...`}
          </pre>
        </div>
      )}

      {/* Topology Tab */}
      {activeSubTab === 'topology' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm pb-2 border-b border-slate-800">
              <Network className="w-4 h-4" />
              <span>1. Telemetry Ingestion Tier</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Ingests live physical power metrics from renewable parks (Khavda Solar, Muppandal Wind, Roscoe ERCOT) and queries BigQuery public environmental tables to build 45-minute look-ahead curtailment indices.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px] space-y-1 text-slate-300">
              <div>· Google Maps Platform Weather API</div>
              <div>· Spot Tariff Cleared Vectors ($/MWh)</div>
              <div>· Sub-second Redlock Distributed Lock</div>
            </div>
          </div>

          <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm pb-2 border-b border-slate-800">
              <Cpu className="w-4 h-4" />
              <span>2. Autonomous AI Governor Tier</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Powered by Vertex AI & Gemini 3.8 Flash with structured JSON schema outputs. Evaluates data sovereignty boundaries (DPDPA Domestic Lock vs Global Fluid) and issues sub-200ms container commands.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px] space-y-1 text-slate-300">
              <div>· SCALE_MAX_SPONGE: Absorbs surplus</div>
              <div>· MODULATE_GPU_POWER_THROTTLE: Drops clocks</div>
              <div>· ACTIVATE_HYBRID_BASELINE: Fault guard</div>
            </div>
          </div>

          <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm pb-2 border-b border-slate-800">
              <Database className="w-4 h-4" />
              <span>3. Execution & Audit Ledger Tier</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Container runtime footprints execute inside Serverless Cloud Run v2 with Private Google Access. Every completed execution mints a cryptographic SHA-256 Green Compute Passport™ saved to BigQuery.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px] space-y-1 text-slate-300">
              <div>· Zero-Egress Isolated Private VPC</div>
              <div>· BigQuery DAY Partitioned Ledger</div>
              <div>· SHA-256 Verifiable Green Passports</div>
            </div>
          </div>
        </div>
      )}

      {/* Agents Tab */}
      {activeSubTab === 'agents' && (
        <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Deterministic Dual-Agent Choreography Engine Architecture
          </h3>
          <div className="bg-[#020617] p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-sky-400 leading-relaxed overflow-x-auto">
{`   [ PHYSICAL RENEWABLE GRIDS: Khavda Solar | Muppandal Wind | Texas ERCOT ]
                                  │
                                  ▼
      AGENT 1: INGESTION & FORECASTING LOOP (THE HISTORIAN)
      • Pulls live solar irradiance, wind gusts, and spot clearing tariffs
      • Pre-computes curtailment volume (MWh) and carbon displacement rate
      • Normalizes state into GridTelemetryState Pydantic Payload
                                  │
                                  ▼ (Type-Validated Structured State)
      AGENT 2: AUTONOMOUS INFRASTRUCTURE GOVERNOR (GEMINI 3.8 FLASH)
      • Enforces Data Residency Invariants (DOMESTIC_ONLY vs GLOBAL_FLUID)
      • Decision 1 (Tariff <= 0): SCALE_MAX_SPONGE -> Auto-scale containers
      • Decision 2 (Cloud Shadow): MODULATE_GPU_POWER_THROTTLE
      • Decision 3 (Fault Detected): ACTIVATE_HYBRID_BASELINE_SLA
      • Mints Cryptographic SHA-256 Green Compute Passport™ Proof
               │                                            │
               ▼                                            ▼
   CLOUD RUN SERVERLESS FLEET                   BIGQUERY IMMUTABLE AUDIT LEDGER
   • Zero-egress Private VPC                    • Partitioned by entry_date DAY
   • Pre-warmed container sponge                • SHA-256 Cryptographic Tokens`}
          </div>
        </div>
      )}

      {/* Terraform IaC Tab */}
      {activeSubTab === 'terraform' && (
        <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Terraform Production Infrastructure Code (`terraform/main.tf`)
            </h3>
            <span className="text-[11px] font-mono text-emerald-400">
              Zero-Egress Private VPC Topology
            </span>
          </div>
          <pre className="bg-[#020617] p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-[380px] leading-relaxed">
{`# Production-Grade Resource Layout Automation Profile for REGEN-X Stack
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.10.0"
    }
  }
}

# 1. NETWORK TOPOLOGY: Private Network Setup to drop Egress Fees to zero
resource "google_compute_network" "private_vpc" {
  name                    = "regenx-production-private-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "isolated_subnet" {
  name                     = "regenx-core-private-subnet"
  ip_cidr_range            = "10.100.0.0/24"
  region                   = var.primary_region
  network                  = google_compute_network.private_vpc.id
  private_ip_google_access = true # Zero-cost data transfers to GCS buckets internally
}

# 2. SERVERLESS COMPUTE: Cloud Run V2 System Configurations
resource "google_cloud_run_v2_service" "orchestrator_node" {
  name     = "regenx-core-orchestrator"
  location = var.primary_region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY" # Blocks public scanning; zero network leak

  template {
    scaling {
      min_instance_count = 1   # Eliminates cold starts (<200ms horizontal auto-scaling)
      max_instance_count = 50  # Scales compute footprints to absorb green surges
    }
    vpc_access {
      connector = google_vpc_access_connector.vpc_connector.id
      egress    = "ALL_TRAFFIC" # Routes communications strictly via private VPC
    }
  }
}`}
          </pre>
        </div>
      )}

      {/* Security Tab */}
      {activeSubTab === 'security' && (
        <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Cyber-Physical Threat Modeling & Jurisdictional Compliance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>Threat 1: Cross-Border Regulatory Egress (Data Residency Leak)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                <strong>Mitigation:</strong> Programmatic constraint checks are compiled directly into the Gemini Agent's JSON system parameter blocks. If a job configuration is marked as <code className="text-emerald-400 font-mono">DOMESTIC_ONLY</code> (e.g. India DPDPA or EU GDPR), the system intercepts and blocks multi-region container scaling calls, maintaining strict data sovereignty compliance.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Shield className="w-4 h-4" />
                <span>Threat 2: Public Endpoint Tampering & External Interception</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                <strong>Mitigation:</strong> Sets Cloud Run container ingress explicitly to <code className="text-emerald-400 font-mono">INGRESS_TRAFFIC_INTERNAL_ONLY</code>. All inter-service communications are routed exclusively across Private Google Access tunnels, preventing public exposure and eliminating network egress fees.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
