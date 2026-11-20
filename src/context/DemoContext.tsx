import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  BASE_OUT_OF_BOX_ITEMS,
  INITIAL_DEMO_STATE,
  matchCustomRequirement,
} from '../data/initialDemoState';
import {
  ChatMessage,
  CustomRequirement,
  DemoState,
  FitGapItem,
  LifecycleStage,
  SandboxWeighLog,
} from '../types/funcsaas';

const STORAGE_KEY = 'funcsaas_demo_state_v1';

interface DemoContextValue {
  state: DemoState;
  fitGapItems: FitGapItem[];
  totalPoints: number;
  totalDays: number;
  isAgentThinking: boolean;
  isPipelineRunning: boolean;
  resetDemo: () => void;
  setPendingQuickPrompt: (prompt: string | null) => void;
  reserveUpcomingBase: (baseId: string) => void;
  toggleChip: (chipId: string) => void;
  sendDiscoveryPrompt: (promptText: string) => void;
  submitGate1: () => void;
  runSandboxPipeline: () => void;
  logSandboxWeighCheck: (
    orderNo: string,
    skuName: string,
    batchNo: string,
    theoreticalKg: number,
    actualKg: number,
    isNearExpiry: boolean
  ) => SandboxWeighLog;
  submitGate3: () => void;
  approveGate: (gateId: 'GATE_1' | 'GATE_3' | 'GATE_4', approverName?: string) => string | undefined;
  triggerSlowQueryIncident: () => void;
  executeHotfix: () => void;
  setStageDirect: (stage: LifecycleStage) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function loadPersistedState(): DemoState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_DEMO_STATE;
    const parsed = JSON.parse(raw) as DemoState;
    if (!parsed || !parsed.chips || !parsed.gates) return INITIAL_DEMO_STATE;
    return parsed;
  } catch {
    return INITIAL_DEMO_STATE;
  }
}

function nowTimeStr(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

function generateMockJwt(gateCode: string, projectName: string): string {
  const header = btoa(JSON.stringify({ alg: 'EdDSA', typ: 'JWT', kid: 'funcsaas-k1' })).replace(/=/g, '');
  const payload = btoa(
    unescape(
      encodeURIComponent(
        JSON.stringify({
          iss: 'funcsaas-gatekeeper',
          sub: projectName,
          gate: gateCode,
          core_lock: 'sha256:8f4e91c0a3d7b21e',
          iat: Math.floor(Date.now() / 1000),
        })
      )
    )
  ).replace(/=/g, '');
  const sigSeed = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
  const signature = btoa(sigSeed).replace(/=/g, '').slice(0, 32);
  return `${header}.${payload}.${signature}`;
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(() => loadPersistedState());
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors in private browsing
    }
  }, [state]);

  const fitGapItems = useMemo<FitGapItem[]>(() => {
    const enabledChipRows = state.chips.filter((c) => c.enabled).map((c) => c.fitGapRow);
    const customRows = state.customRequirements.map((r) => r.fitGapRow);
    return [...BASE_OUT_OF_BOX_ITEMS, ...enabledChipRows, ...customRows];
  }, [state.chips, state.customRequirements]);

  const totalPoints = useMemo(() => {
    return fitGapItems.reduce((acc, item) => acc + item.points, 0);
  }, [fitGapItems]);

  const totalDays = useMemo(() => {
    const chipDays = state.chips.filter((c) => c.enabled).reduce((acc, c) => acc + c.days, 0);
    const customDays = state.customRequirements.length * 1;
    return Math.max(1, chipDays + customDays);
  }, [state.chips, state.customRequirements]);

  const resetDemo = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsAgentThinking(false);
    setIsPipelineRunning(false);
    setState(INITIAL_DEMO_STATE);
  };

  const setPendingQuickPrompt = (prompt: string | null) => {
    setState((prev) => ({ ...prev, pendingQuickPrompt: prompt }));
  };

  const reserveUpcomingBase = (baseId: string) => {
    setState((prev) => {
      if (prev.reservedBases.includes(baseId)) return prev;
      return { ...prev, reservedBases: [...prev.reservedBases, baseId] };
    });
  };

  const toggleChip = (chipId: string) => {
    setState((prev) => ({
      ...prev,
      chips: prev.chips.map((c) => (c.id === chipId ? { ...c, enabled: !c.enabled } : c)),
    }));
  };

  const sendDiscoveryPrompt = (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: nowTimeStr(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg],
    }));

    setIsAgentThinking(true);
    window.setTimeout(() => {
      const matched = matchCustomRequirement(trimmed);
      const customItem: CustomRequirement = {
        id: `custom-${Date.now()}`,
        prompt: trimmed,
        agentReply: matched.reply,
        fitGapRow: matched.fitGapRow,
        diagramNodeLabel: matched.diagramNodeLabel,
        ddlTitle: matched.ddlTitle,
        ddlSql: matched.ddlSql,
        createdAt: nowTimeStr(),
      };

      const agentMsg: ChatMessage = {
        id: `msg-a-${Date.now() + 1}`,
        role: 'agent',
        title: `已同步蓝图：新增「${matched.fitGapRow.module}」(${matched.fitGapRow.points} 点)`,
        content: matched.reply,
        timestamp: nowTimeStr(),
        highlights: [
          `映射扩展点：${matched.fitGapRow.targetSymbol}`,
          `已更新 Fit-Gap 矩阵、时序图节点及增量 DDL`,
        ],
      };

      setState((prev) => ({
        ...prev,
        customRequirements: [...prev.customRequirements, customItem],
        messages: [...prev.messages, agentMsg],
      }));
      setIsAgentThinking(false);
    }, 850);
  };

  const submitGate1 = () => {
    setState((prev) => ({
      ...prev,
      stage: prev.stage === 'DISCOVERY' ? 'BLUEPRINT_FROZEN' : prev.stage,
      gates: {
        ...prev.gates,
        GATE_1: {
          ...prev.gates.GATE_1,
          status: 'APPROVED',
          approvedAt: nowTimeStr(),
          approver: '架构评审委员会 (GATE 1)',
          jwtToken: generateMockJwt('GATE_1_BLUEPRINT', prev.projectName),
        },
        GATE_3:
          prev.gates.GATE_3.status === 'LOCKED'
            ? { ...prev.gates.GATE_3, status: 'PENDING' }
            : prev.gates.GATE_3,
      },
    }));
  };

  const runSandboxPipeline = () => {
    if (isPipelineRunning) return;
    setIsPipelineRunning(true);

    setState((prev) => ({
      ...prev,
      pipelineSteps: prev.pipelineSteps.map((step, idx) => ({
        ...step,
        status: idx === 0 ? 'running' : 'idle',
      })),
    }));

    const stepIds = ['step-ast', 'step-spi', 'step-core', 'step-qa'];
    stepIds.forEach((stepId, index) => {
      window.setTimeout(() => {
        setState((prev) => ({
          ...prev,
          pipelineSteps: prev.pipelineSteps.map((s, sIdx) => {
            if (s.id === stepId) return { ...s, status: 'passed' };
            if (sIdx === index + 1) return { ...s, status: 'running' };
            return s;
          }),
        }));

        if (index === stepIds.length - 1) {
          setIsPipelineRunning(false);
        }
      }, (index + 1) * 550);
    });
  };

  const logSandboxWeighCheck = (
    orderNo: string,
    skuName: string,
    batchNo: string,
    theoreticalKg: number,
    actualKg: number,
    isNearExpiry: boolean
  ): SandboxWeighLog => {
    const batchChipEnabled = state.chips.find((c) => c.id === 'chip-batch-expiry')?.enabled ?? true;
    const scaleChipEnabled = state.chips.find((c) => c.id === 'chip-scale-check')?.enabled ?? true;

    const rawDiff = ((actualKg - theoreticalKg) / theoreticalKg) * 100;
    const diffPercent = Number(rawDiff.toFixed(2));
    const absDiff = Math.abs(diffPercent);

    let status: SandboxWeighLog['status'] = 'PASSED';
    let message = `实称 ${actualKg.toFixed(2)} kg，误差 ${diffPercent >= 0 ? '+' : ''}${diffPercent.toFixed(1)}% 在 ±3.0% 容差范围内，复核通过并放行。`;

    if (batchChipEnabled && isNearExpiry) {
      status = 'INTERCEPTED_EXPIRY';
      message = `批次 ${batchNo} 剩余保质期不足 1/3（近效期锁定规则触发），系统已阻断出库并锁定拣货波次。`;
    } else if (scaleChipEnabled && absDiff > 3.0) {
      status = 'INTERCEPTED_WEIGHT';
      message = `称重误差 ${absDiff.toFixed(1)}% 超出 3% 阈值，已拦截出库并自动写入异常日志 wm_weight_error_log。`;
    }

    const newLog: SandboxWeighLog = {
      id: `log-${Date.now()}`,
      orderNo,
      skuName,
      batchNo,
      theoreticalKg,
      actualKg,
      diffPercent,
      status,
      message,
      timestamp: nowTimeStr(),
    };

    setState((prev) => ({
      ...prev,
      sandboxLogs: [newLog, ...prev.sandboxLogs],
    }));

    return newLog;
  };

  const submitGate3 = () => {
    setState((prev) => ({
      ...prev,
      stage:
        prev.stage === 'DISCOVERY' || prev.stage === 'BLUEPRINT_FROZEN'
          ? 'SANDBOX_VERIFIED'
          : prev.stage,
      gates: {
        ...prev.gates,
        GATE_1:
          prev.gates.GATE_1.status === 'PENDING'
            ? {
                ...prev.gates.GATE_1,
                status: 'APPROVED',
                approvedAt: nowTimeStr(),
                approver: '自动补签确认',
                jwtToken: generateMockJwt('GATE_1_BLUEPRINT', prev.projectName),
              }
            : prev.gates.GATE_1,
        GATE_3:
          prev.gates.GATE_3.status === 'LOCKED'
            ? { ...prev.gates.GATE_3, status: 'PENDING' }
            : prev.gates.GATE_3,
      },
    }));
  };

  const approveGate = (gateId: 'GATE_1' | 'GATE_3' | 'GATE_4', approverName = '张敏 (交付负责人)') => {
    const token = generateMockJwt(gateId, state.projectName);
    setState((prev) => {
      const nextGates = { ...prev.gates };
      nextGates[gateId] = {
        ...nextGates[gateId],
        status: 'APPROVED',
        approvedAt: nowTimeStr(),
        approver: approverName,
        jwtToken: token,
      };

      let nextStage: LifecycleStage = prev.stage;
      if (gateId === 'GATE_1') {
        if (nextGates.GATE_3.status === 'LOCKED') {
          nextGates.GATE_3 = { ...nextGates.GATE_3, status: 'PENDING' };
        }
        if (prev.stage === 'DISCOVERY') nextStage = 'BLUEPRINT_FROZEN';
      } else if (gateId === 'GATE_3') {
        if (nextGates.GATE_1.status !== 'APPROVED') {
          nextGates.GATE_1 = {
            ...nextGates.GATE_1,
            status: 'APPROVED',
            approvedAt: nowTimeStr(),
            approver: approverName,
            jwtToken: generateMockJwt('GATE_1', prev.projectName),
          };
        }
        if (nextGates.GATE_4.status === 'LOCKED') {
          nextGates.GATE_4 = { ...nextGates.GATE_4, status: 'PENDING' };
        }
        nextStage = 'GATE3_APPROVED';
      } else if (gateId === 'GATE_4') {
        if (nextGates.GATE_1.status !== 'APPROVED') {
          nextGates.GATE_1 = {
            ...nextGates.GATE_1,
            status: 'APPROVED',
            approvedAt: nowTimeStr(),
            approver: approverName,
            jwtToken: generateMockJwt('GATE_1', prev.projectName),
          };
        }
        if (nextGates.GATE_3.status !== 'APPROVED') {
          nextGates.GATE_3 = {
            ...nextGates.GATE_3,
            status: 'APPROVED',
            approvedAt: nowTimeStr(),
            approver: approverName,
            jwtToken: generateMockJwt('GATE_3', prev.projectName),
          };
        }
        nextStage = 'PRODUCTION_LIVE';
      }

      return {
        ...prev,
        stage: nextStage,
        gates: nextGates,
      };
    });
    return token;
  };

  const triggerSlowQueryIncident = () => {
    setState((prev) => ({
      ...prev,
      aiopsIncident: {
        ...prev.aiopsIncident,
        status: 'ALERT_ACTIVE',
        detectedAt: nowTimeStr(),
        resolvedAt: undefined,
      },
    }));
  };

  const executeHotfix = () => {
    setState((prev) => ({
      ...prev,
      aiopsIncident: {
        ...prev.aiopsIncident,
        status: 'PATCHING',
      },
    }));

    window.setTimeout(() => {
      const resolvedTime = nowTimeStr();
      setState((prev) => ({
        ...prev,
        aiopsIncident: {
          ...prev.aiopsIncident,
          status: 'RESOLVED',
          resolvedAt: resolvedTime,
        },
        aiopsAuditHistory: [
          {
            id: `his-${Date.now()}`,
            time: resolvedTime,
            event: 'PDA 扫码慢查询自愈完成',
            action: '在线执行 ALTER TABLE wm_weight_error_log ADD INDEX (INPLACE, LOCK=NONE)',
            result: 'P99 耗时从 2,840ms 降至 38ms，零中断恢复',
          },
          ...prev.aiopsAuditHistory,
        ],
      }));
    }, 900);
  };

  const setStageDirect = (stage: LifecycleStage) => {
    setState((prev) => ({ ...prev, stage }));
  };

  return (
    <DemoContext.Provider
      value={{
        state,
        fitGapItems,
        totalPoints,
        totalDays,
        isAgentThinking,
        isPipelineRunning,
        resetDemo,
        setPendingQuickPrompt,
        reserveUpcomingBase,
        toggleChip,
        sendDiscoveryPrompt,
        submitGate1,
        runSandboxPipeline,
        logSandboxWeighCheck,
        submitGate3,
        approveGate,
        triggerSlowQueryIncident,
        executeHotfix,
        setStageDirect,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error('useDemo must be used inside DemoProvider');
  }
  return ctx;
}
