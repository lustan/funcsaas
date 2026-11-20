import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Lock, ArrowRight } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { LifecycleStage } from '../../types/funcsaas';

interface StageDef {
  id: string;
  stepNum: number;
  label: string;
  route: string;
  activeWhen: LifecycleStage[];
  doneWhen: LifecycleStage[];
}

const STAGES: StageDef[] = [
  {
    id: 's1',
    stepNum: 1,
    label: '1. 需求评估',
    route: '/studio/discovery',
    activeWhen: ['DISCOVERY'],
    doneWhen: ['BLUEPRINT_FROZEN', 'SANDBOX_VERIFIED', 'GATE3_APPROVED', 'PRODUCTION_LIVE'],
  },
  {
    id: 's2',
    stepNum: 2,
    label: '2. 蓝图冻结',
    route: '/studio/discovery',
    activeWhen: ['BLUEPRINT_FROZEN'],
    doneWhen: ['SANDBOX_VERIFIED', 'GATE3_APPROVED', 'PRODUCTION_LIVE'],
  },
  {
    id: 's3',
    stepNum: 3,
    label: '3. 沙箱增量二开',
    route: '/studio/sandbox',
    activeWhen: ['SANDBOX_VERIFIED'],
    doneWhen: ['GATE3_APPROVED', 'PRODUCTION_LIVE'],
  },
  {
    id: 's4',
    stepNum: 4,
    label: '4. 生产发布',
    route: '/studio/gates',
    activeWhen: ['GATE3_APPROVED'],
    doneWhen: ['PRODUCTION_LIVE'],
  },
  {
    id: 's5',
    stepNum: 5,
    label: '5. AIOps 运维',
    route: '/studio/aiops',
    activeWhen: ['PRODUCTION_LIVE'],
    doneWhen: [],
  },
];

const STAGE_LABEL_MAP: Record<LifecycleStage, { text: string; tone: string }> = {
  DISCOVERY: { text: 'DISCOVERY · 需求访谈中', tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  BLUEPRINT_FROZEN: { text: 'BLUEPRINT_FROZEN · 蓝图已冻结', tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  SANDBOX_VERIFIED: { text: 'SANDBOX_VERIFIED · 沙箱待签发', tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  GATE3_APPROVED: { text: 'GATE3_APPROVED · 待生产授权', tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  PRODUCTION_LIVE: { text: 'PRODUCTION_LIVE · 生产运行中', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
};

export function StagePipelineBar() {
  const { state, totalPoints, totalDays } = useDemo();
  const navigate = useNavigate();
  const stageMeta = STAGE_LABEL_MAP[state.stage];

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-3">
        {/* Project Context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>当前交付项目</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{state.baseSystem}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="font-display text-sm font-semibold text-slate-900 truncate">
                {state.projectName}
              </span>
              <span
                className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap shrink-0 ${stageMeta.tone}`}
              >
                {stageMeta.text}
              </span>
            </div>
          </div>
        </div>

        {/* 5-Stage State Machine Stepper */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {STAGES.map((s, idx) => {
            const isDone = s.doneWhen.includes(state.stage);
            const isCurrent = s.activeWhen.includes(state.stage);

            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  onClick={() => navigate(s.route)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : isDone
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {isDone ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : !isCurrent && s.stepNum >= 4 && state.stage === 'DISCOVERY' ? (
                    <Lock className="h-3 w-3 text-slate-400" />
                  ) : null}
                  <span>{s.label}</span>
                </button>
                {idx < STAGES.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Live Effort Summary */}
        <div className="hidden xl:flex items-center gap-4 text-xs text-slate-600 tabular-nums shrink-0">
          <div>
            <span className="text-slate-400">评估工作量</span>{' '}
            <span className="font-mono font-semibold text-slate-900">{totalPoints} 点</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            <span className="text-slate-400">预估周期</span>{' '}
            <span className="font-mono font-semibold text-slate-900">{totalDays} 天</span>
          </div>
        </div>
      </div>
    </div>
  );
}
