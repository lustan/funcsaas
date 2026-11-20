export type LifecycleStage =
  | 'DISCOVERY'
  | 'BLUEPRINT_FROZEN'
  | 'SANDBOX_VERIFIED'
  | 'GATE3_APPROVED'
  | 'PRODUCTION_LIVE';

export interface BusinessChip {
  id: string;
  label: string;
  description: string;
  points: number;
  days: number;
  enabled: boolean;
  fitGapRow: FitGapItem;
  diagramNodeId: string;
  ddlTitle: string;
  ddlSql: string;
}

export interface FitGapItem {
  id: string;
  module: string;
  requirement: string;
  fitType: 'OUT_OF_BOX' | 'SPI_EXTENSION';
  targetSymbol: string;
  points: number;
  effortLabel: string;
  sourceChipId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'agent' | 'user';
  title?: string;
  content: string;
  timestamp: string;
  highlights?: string[];
}

export interface CustomRequirement {
  id: string;
  prompt: string;
  agentReply: string;
  fitGapRow: FitGapItem;
  diagramNodeLabel: string;
  ddlTitle?: string;
  ddlSql?: string;
  createdAt: string;
}

export interface PipelineStep {
  id: string;
  order: string;
  name: string;
  detail: string;
  durationMs: number;
  status: 'idle' | 'running' | 'passed';
  badgeText: string;
}

export interface SandboxWeighLog {
  id: string;
  orderNo: string;
  skuName: string;
  batchNo: string;
  theoreticalKg: number;
  actualKg: number;
  diffPercent: number;
  status: 'PASSED' | 'INTERCEPTED_WEIGHT' | 'INTERCEPTED_EXPIRY';
  message: string;
  timestamp: string;
}

export interface GateCheckItem {
  id: string;
  title: string;
  detail: string;
  status: 'verified' | 'checking';
}

export interface GateRecord {
  id: 'GATE_1' | 'GATE_3' | 'GATE_4';
  code: string;
  name: string;
  subtitle: string;
  status: 'PENDING' | 'APPROVED' | 'LOCKED';
  approvedAt?: string;
  approver?: string;
  jwtToken?: string;
}

export interface AiOpsIncident {
  id: string;
  title: string;
  endpoint: string;
  status: 'NORMAL' | 'ALERT_ACTIVE' | 'PATCHING' | 'RESOLVED';
  detectedAt?: string;
  resolvedAt?: string;
  rootCause: string;
  sqlPatch: string;
  p99BeforeMs: number;
  p99AfterMs: number;
}

export interface DemoState {
  projectName: string;
  baseSystem: string;
  stage: LifecycleStage;
  pendingQuickPrompt: string | null;
  reservedBases: string[];
  chips: BusinessChip[];
  customRequirements: CustomRequirement[];
  messages: ChatMessage[];
  pipelineSteps: PipelineStep[];
  pipelineSelfHealNote: string;
  sandboxLogs: SandboxWeighLog[];
  gates: Record<'GATE_1' | 'GATE_3' | 'GATE_4', GateRecord>;
  aiopsIncident: AiOpsIncident;
  aiopsAuditHistory: Array<{
    id: string;
    time: string;
    event: string;
    action: string;
    result: string;
  }>;
}
