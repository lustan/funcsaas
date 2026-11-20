import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { StagePipelineBar } from '../components/layout/StagePipelineBar';
import { useDemo } from '../context/DemoContext';
import { GateCheckItem } from '../types/funcsaas';

const HARD_CHECKS: GateCheckItem[] = [
  {
    id: 'chk-core',
    title: 'Protected Core 内核保护锁静态校验',
    detail: 'WmStockService / WmStockEntity 核心账实事务摘要比对一致，0 行越权修改',
    status: 'verified',
  },
  {
    id: 'chk-ddl',
    title: '增量 DDL 无破坏性语句扫描',
    detail: '仅含 CREATE TABLE / ADD INDEX，未发现 DROP、TRUNCATE 或 ALTER DROP COLUMN',
    status: 'verified',
  },
  {
    id: 'chk-sku',
    title: '期初 12,450 条 SKU 账实平衡预演',
    detail: '影子库试迁移完成：期初库存总额、冷链批次库位余额差异 = 0.0000',
    status: 'verified',
  },
  {
    id: 'chk-snap',
    title: '生产快照与一键回滚镜像就绪',
    detail: '快照标识 snap-jeewms-20261113 已冷备校验，支持 15 秒内无缝回退',
    status: 'verified',
  },
];

export function GatesPage() {
  const { state, totalPoints, totalDays, approveGate } = useDemo();
  const navigate = useNavigate();

  const [isScanningChecks, setIsScanningChecks] = useState(false);
  const [signingGate4Modal, setSigningGate4Modal] = useState(false);
  const [approverName, setApproverName] = useState('张敏 (华东冷链交付负责人)');
  const [copiedToken, setCopiedToken] = useState(false);

  const handleRescanChecks = () => {
    setIsScanningChecks(true);
    window.setTimeout(() => setIsScanningChecks(false), 750);
  };

  const handleConfirmGate4 = () => {
    approveGate('GATE_4', approverName.trim() || '交付负责人');
    setSigningGate4Modal(false);
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard?.writeText(token);
    setCopiedToken(true);
    window.setTimeout(() => setCopiedToken(false), 1800);
  };

  const gateList = [state.gates.GATE_1, state.gates.GATE_3, state.gates.GATE_4];
  const gate4Token = state.gates.GATE_4.jwtToken;

  return (
    <div className="min-h-[calc(100vh-57px)] flex flex-col bg-slate-50">
      <StagePipelineBar />

      <div className="mx-auto w-full max-w-[1440px] px-6 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">
              银行级审批门禁与密码学签发中心
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              每一次 AI 代码变更均须通过自动化硬校验与人工授权门禁，签发 EdDSA Gate JWT Token 后方可触达生产环境。
            </p>
          </div>
          {state.stage === 'PRODUCTION_LIVE' && (
            <button
              type="button"
              onClick={() => navigate('/studio/aiops')}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>已上线生产 · 前往 AIOps 运维守护中心</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Pre-flight Automated Hard Checks */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h2 className="font-display text-sm font-semibold text-slate-900">
                  前置自动化硬校验清单
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  全部硬校验通过是 GATE 4 生产放行的强制前置条件
                </p>
              </div>
              <button
                type="button"
                onClick={handleRescanChecks}
                disabled={isScanningChecks}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${isScanningChecks ? 'animate-spin' : ''}`} />
                <span>{isScanningChecks ? '校验中…' : '重新校验'}</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {HARD_CHECKS.map((chk) => (
                <div
                  key={chk.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isScanningChecks ? 'text-amber-500' : 'text-emerald-600'
                        }`}
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{chk.title}</div>
                        <div className="mt-1 text-xs leading-relaxed text-slate-600">
                          {chk.detail}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`font-mono text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                        isScanningChecks ? 'text-amber-600' : 'text-emerald-700'
                      }`}
                    >
                      {isScanningChecks ? 'CHECKING' : 'PASS'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-xs tabular-nums">
              <div>
                <div className="text-slate-500">交付点数</div>
                <div className="mt-0.5 font-mono font-bold text-slate-900">{totalPoints} 点</div>
              </div>
              <div>
                <div className="text-slate-500">交付周期</div>
                <div className="mt-0.5 font-mono font-bold text-slate-900">{totalDays} 天</div>
              </div>
              <div>
                <div className="text-slate-500">核心保护锁</div>
                <div className="mt-0.5 font-mono font-bold text-emerald-700">0 篡改</div>
              </div>
            </div>
          </section>

          {/* Right: Gate Approval Cards & Cryptographic JWT Issuance */}
          <section className="space-y-4 lg:col-span-7">
            {gateList.map((gate) => {
              const isApproved = gate.status === 'APPROVED';
              const isLocked = gate.status === 'LOCKED';
              const isGate4 = gate.id === 'GATE_4';

              return (
                <div
                  key={gate.id}
                  className={`rounded-xl border p-5 transition-colors ${
                    isApproved
                      ? 'border-emerald-200 bg-white'
                      : isGate4 && !isLocked
                      ? 'border-indigo-300 bg-white shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {gate.code}
                        </span>
                        <span className="text-slate-300" aria-hidden="true">·</span>
                        <h3 className="font-display text-base font-semibold text-slate-900">
                          {gate.name}
                        </h3>
                        <span
                          className={`rounded border px-2 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap ${
                            isApproved
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : isLocked
                              ? 'border-slate-200 bg-slate-100 text-slate-500'
                              : 'border-amber-200 bg-amber-50 text-amber-800'
                          }`}
                        >
                          {isApproved ? '已签发放行' : isLocked ? '待前置解锁' : '待人工审批'}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-600">{gate.subtitle}</p>
                      {isApproved && gate.approvedAt && (
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                          <span>签发人：{gate.approver}</span>
                          <span>·</span>
                          <span>签发时间：{gate.approvedAt}</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                          <Check className="h-3.5 w-3.5" />
                          <span>已通过签发</span>
                        </span>
                      ) : isGate4 ? (
                        <button
                          type="button"
                          onClick={() => setSigningGate4Modal(true)}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-600 transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          <span>确认签发并上线</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => approveGate(gate.id, approverName)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>立即签发 {gate.code}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Cryptographic JWT Token Output Panel (Visible once GATE 4 is approved) */}
            {gate4Token && (
              <div className="rounded-xl border border-emerald-300 bg-slate-900 p-5 text-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-emerald-400" />
                    <span className="font-display text-sm font-semibold text-white">
                      GATE 4 生产上线密码学凭证已签发（Gate JWT Token）
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyToken(gate4Token)}
                    className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700 cursor-pointer"
                  >
                    {copiedToken ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>已复制 Token</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>复制 JWT Hash</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 rounded-lg bg-slate-950 p-3.5 font-mono text-xs break-all text-emerald-300 leading-relaxed">
                  {gate4Token}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <span>
                    全局状态已推进至 <strong className="text-emerald-400">PRODUCTION_LIVE（生产运行中）</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/studio/aiops')}
                    className="inline-flex items-center gap-1.5 font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    <span>进入 7×24h AIOps 运维守护中心</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Cryptographic Sign-off Modal for GATE 4 */}
      {signingGate4Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-900" />
                <h2 className="font-display text-base font-bold text-slate-900">
                  GATE 4 生产发布密码学二次确认
                </h2>
              </div>
              <span className="font-mono text-xs text-indigo-700">EdDSA · SHA-256</span>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600">
              <p>
                您正在授权将「<strong>{state.projectName}</strong>」的 SPI 增量插件与 DDL 变更推送至生产集群 <code className="font-mono text-slate-900">prod-cn-east-coldchain</code>。
              </p>

              <div>
                <label
                  htmlFor="approver-input"
                  className="block font-semibold text-slate-700 mb-1.5"
                >
                  签发授权人署名
                </label>
                <input
                  id="approver-input"
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-1.5 font-mono text-[11px] text-slate-700">
                <div>• Protected Core 校验：PASS (WmStockService 字节码未变更)</div>
                <div>• 账实平衡预演：12,450 SKU 借贷平衡差异 = 0.0000</div>
                <div>• 回滚策略：snap-jeewms-20261113 就绪</div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSigningGate4Modal(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmGate4}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-600 cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>签署 Gate JWT Token 并立即上线</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
