import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileDiff,
  FileText,
  Loader2,
  MonitorCheck,
  Play,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { StagePipelineBar } from '../components/layout/StagePipelineBar';
import { useDemo } from '../context/DemoContext';
import { SandboxWeighLog } from '../types/funcsaas';

type SandboxTab = 'simulator' | 'bizdiff' | 'gitdiff';

interface TestOrderPreset {
  orderNo: string;
  skuName: string;
  batchNo: string;
  theoreticalKg: number;
  isNearExpiry: boolean;
  expiryHint: string;
}

const TEST_ORDERS: TestOrderPreset[] = [
  {
    orderNo: 'CK20261113-0089',
    skuName: '挪威冰鲜三文鱼排 10kg/箱 × 5',
    batchNo: 'LOT-20261110-B1',
    theoreticalKg: 50.0,
    isNearExpiry: false,
    expiryHint: '剩余效期 85%（正常）',
  },
  {
    orderNo: 'CK20261113-0092',
    skuName: '澳洲谷饲冷鲜肥牛卷 5kg/箱 × 6',
    batchNo: 'LOT-20261018-C4',
    theoreticalKg: 30.0,
    isNearExpiry: true,
    expiryHint: '剩余效期 22%（触发近效期锁定 <33%）',
  },
  {
    orderNo: 'CK20261113-0095',
    skuName: '厄瓜多尔冻南美白对虾 10kg/箱 × 8',
    batchNo: 'LOT-20261112-A2',
    theoreticalKg: 80.0,
    isNearExpiry: false,
    expiryHint: '剩余效期 94%（正常）',
  },
];

const GIT_DIFF_LINES: Array<{ type: 'ctx' | 'add' | 'del' | 'hdr'; text: string }> = [
  { type: 'hdr', text: 'diff --git a/jeewms-spi-coldchain/.../ColdChainOutboundWeightCheckHookImpl.java b/...' },
  { type: 'hdr', text: 'new file mode 100644 · Protected Core Lock: PASSED (WmStockService untouched)' },
  { type: 'add', text: '+ @Component("coldChainOutboundWeightCheckHook")' },
  { type: 'add', text: '+ public class ColdChainOutboundWeightCheckHookImpl implements OutboundCheckHook {' },
  { type: 'add', text: '+   private static final BigDecimal MAX_TOLERANCE = new BigDecimal("0.0300");' },
  { type: 'add', text: '+   @Override' },
  { type: 'add', text: '+   public HookResult beforeOutboundConfirm(OutboundContext ctx) {' },
  { type: 'add', text: '+     // 1. 强制校验批次近效期比例 >= 1/3' },
  { type: 'add', text: '+     if (ctx.getRemainingShelfLifeRatio().compareTo(new BigDecimal("0.33")) < 0) {' },
  { type: 'add', text: '+       return HookResult.block("EXPIRY_LOCKED", "批次剩余效期不足 1/3，禁止拣选出库");' },
  { type: 'add', text: '+     }' },
  { type: 'add', text: '+     // 2. 电子秤称重偏差校验 (QA Agent 自愈修正为 BigDecimal.HALF_UP)' },
  { type: 'del', text: '-     double ratio = Math.abs(actual - theory) / theory; // FIXME: 51.50kg 浮点精度漂移' },
  { type: 'add', text: '+     BigDecimal diffRatio = ctx.getActualWeight().subtract(ctx.getTheoreticalWeight())' },
  { type: 'add', text: '+       .abs().divide(ctx.getTheoreticalWeight(), 4, RoundingMode.HALF_UP);' },
  { type: 'add', text: '+     if (diffRatio.compareTo(MAX_TOLERANCE) > 0) {' },
  { type: 'add', text: '+       weightErrorLogMapper.insert(WeightErrorLog.of(ctx, diffRatio));' },
  { type: 'add', text: '+       return HookResult.block("WEIGHT_EXCEEDED", "称重误差超出 ±3% 阈值，已自动拦截");' },
  { type: 'add', text: '+     }' },
  { type: 'add', text: '+     return HookResult.pass();' },
  { type: 'add', text: '+   }' },
  { type: 'add', text: '+ }' },
];

export function SandboxPage() {
  const {
    state,
    isPipelineRunning,
    runSandboxPipeline,
    logSandboxWeighCheck,
    submitGate3,
  } = useDemo();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SandboxTab>('simulator');
  const [selectedOrderIdx, setSelectedOrderIdx] = useState(0);
  const [actualWeightInput, setActualWeightInput] = useState('52.5');
  const [latestResult, setLatestResult] = useState<SandboxWeighLog | null>(null);

  const selectedOrder = TEST_ORDERS[selectedOrderIdx];

  const handleSelectOrder = (idx: number) => {
    setSelectedOrderIdx(idx);
    const ord = TEST_ORDERS[idx];
    setActualWeightInput(String(ord.theoreticalKg === 50 ? 52.5 : ord.theoreticalKg));
    setLatestResult(null);
  };

  const handleConfirmWeighCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const numericWeight = parseFloat(actualWeightInput);
    if (Number.isNaN(numericWeight) || numericWeight <= 0) return;

    const result = logSandboxWeighCheck(
      selectedOrder.orderNo,
      selectedOrder.skuName,
      selectedOrder.batchNo,
      selectedOrder.theoreticalKg,
      numericWeight,
      selectedOrder.isNearExpiry
    );
    setLatestResult(result);
  };

  const handleSubmitToGate3 = () => {
    submitGate3();
    navigate('/studio/gates');
  };

  return (
    <div className="min-h-[calc(100vh-57px)] flex flex-col bg-slate-50">
      <StagePipelineBar />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:grid lg:grid-cols-12 gap-6 px-6 py-6">
        {/* Left Panel: TDD Automated Self-Healing Pipeline Monitor */}
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:col-span-5">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
            <div>
              <h1 className="font-display text-sm font-semibold text-slate-900">
                TDD 自动化自愈流水线监控
              </h1>
              <p className="text-xs text-slate-500">
                Coding & QA Agent 隔离沙箱构建与内核保护锁扫描
              </p>
            </div>
            <button
              type="button"
              onClick={runSandboxPipeline}
              disabled={isPipelineRunning}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isPipelineRunning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                  <span>流水线执行中…</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>重新触发模拟执行</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 space-y-3 p-5">
            {state.pipelineSteps.map((step) => {
              const isPassed = step.status === 'passed';
              const isRunning = step.status === 'running';

              return (
                <div
                  key={step.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    isRunning
                      ? 'border-indigo-300 bg-indigo-50/50'
                      : isPassed
                      ? 'border-slate-200 bg-white'
                      : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        {step.order}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{step.name}</span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap shrink-0 ${
                        isRunning
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                          : isPassed
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isRunning ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isPassed ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : null}
                      <span>{isRunning ? '执行中' : isPassed ? step.badgeText : '等待中'}</span>
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{step.detail}</p>
                </div>
              );
            })}

            {/* Self-Healing Record */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                <span>QA Agent 自动修复自愈记录（1 次）</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-amber-800">
                {state.pipelineSelfHealNote}
              </p>
            </div>
          </div>
        </section>

        {/* Right Panel: Multi-dimensional Acceptance & Code Review */}
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:col-span-7">
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('simulator')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  activeTab === 'simulator'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MonitorCheck className="h-3.5 w-3.5" />
                <span>JeeWMS 实操沙箱模拟器</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bizdiff')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  activeTab === 'bizdiff'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>业务变更语义翻译 (Business Diff)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gitdiff')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  activeTab === 'gitdiff'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileDiff className="h-3.5 w-3.5" />
                <span>底层 Git Diff 对比</span>
              </button>
            </div>

            <span className="font-mono text-xs text-slate-500">sandbox-jeewms-east-01</span>
          </div>

          <div className="flex-1 p-5 space-y-5">
            {activeTab === 'simulator' && (
              <div className="space-y-5">
                {/* Embedded JeeWMS Mock Console Frame */}
                <div className="rounded-xl border border-slate-300 bg-slate-50 overflow-hidden">
                  {/* Simulated JeeWMS Sub-header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-900 px-4 py-2.5 text-white">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Scale className="h-4 w-4 text-indigo-400" />
                      <span>JeeWMS 沙箱操作台 · 出库复核称重防呆模块</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-300">
                      SPI Hook: OutboundCheckHook [已挂载]
                    </span>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Select Order Preset */}
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-2">
                        1. 选择待复核出库任务单：
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {TEST_ORDERS.map((ord, idx) => (
                          <button
                            key={ord.orderNo}
                            type="button"
                            onClick={() => handleSelectOrder(idx)}
                            className={`rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                              selectedOrderIdx === idx
                                ? 'border-indigo-600 bg-white ring-2 ring-indigo-600/15'
                                : 'border-slate-200 bg-white/70 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-xs font-semibold text-slate-900">
                                {ord.orderNo}
                              </span>
                              <span className="font-mono text-xs font-bold text-indigo-700 tabular-nums">
                                {ord.theoreticalKg.toFixed(1)} kg
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-slate-700 truncate">{ord.skuName}</div>
                            <div
                              className={`mt-1 text-[11px] ${
                                ord.isNearExpiry ? 'text-rose-600 font-medium' : 'text-slate-500'
                              }`}
                            >
                              {ord.expiryHint}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Order Details & Real Weight Input */}
                    <form
                      onSubmit={handleConfirmWeighCheck}
                      className="rounded-lg border border-slate-200 bg-white p-4 space-y-4"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums border-b border-slate-100 pb-3">
                        <div>
                          <div className="text-slate-500">出库通知单</div>
                          <div className="mt-0.5 font-mono font-semibold text-slate-900">
                            {selectedOrder.orderNo}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">生鲜批次号</div>
                          <div className="mt-0.5 font-mono font-semibold text-slate-900">
                            {selectedOrder.batchNo}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">理论出库重量</div>
                          <div className="mt-0.5 font-mono text-sm font-bold text-slate-900">
                            {selectedOrder.theoreticalKg.toFixed(2)} kg
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">允许容差范围</div>
                          <div className="mt-0.5 font-mono font-semibold text-indigo-700">
                            ±3.0% ({(selectedOrder.theoreticalKg * 0.97).toFixed(2)} ~{' '}
                            {(selectedOrder.theoreticalKg * 1.03).toFixed(2)} kg)
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                        <div className="flex-1">
                          <label
                            htmlFor="actual-weight-input"
                            className="block text-xs font-semibold text-slate-700 mb-1.5"
                          >
                            2. 电子秤实称重量读数 (kg) — 演示者可自由输入任意数值
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id="actual-weight-input"
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={actualWeightInput}
                              onChange={(e) => setActualWeightInput(e.target.value)}
                              className="w-40 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 font-mono text-base font-bold text-slate-900 tabular-nums focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                            />
                            <span className="text-xs font-mono text-slate-500">kg</span>
                            <div className="flex flex-wrap gap-1.5 ml-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setActualWeightInput(
                                    (selectedOrder.theoreticalKg * 1.05).toFixed(1)
                                  )
                                }
                                className="rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 cursor-pointer"
                              >
                                填入 {(selectedOrder.theoreticalKg * 1.05).toFixed(1)} (+5% 超差)
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setActualWeightInput(
                                    (selectedOrder.theoreticalKg * 1.016).toFixed(1)
                                  )
                                }
                                className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                              >
                                填入 {(selectedOrder.theoreticalKg * 1.016).toFixed(1)} (+1.6% 正常)
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>确认复核</span>
                        </button>
                      </div>

                      {/* Real-time Interception or Pass Alert Box */}
                      {latestResult && (
                        <div
                          role="alert"
                          className={`rounded-lg border p-3.5 text-xs ${
                            latestResult.status === 'PASSED'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                              : 'border-rose-300 bg-rose-50 text-rose-900'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {latestResult.status === 'PASSED' ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                            ) : (
                              <ShieldAlert className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                            )}
                            <div>
                              <div className="font-semibold">
                                {latestResult.status === 'PASSED'
                                  ? '复核校验通过 · 准予放行出库'
                                  : latestResult.status === 'INTERCEPTED_EXPIRY'
                                  ? '硬拦截触发 · 近效期风控锁定'
                                  : '硬拦截触发 · 称重误差越限告警'}
                              </div>
                              <div className="mt-1">{latestResult.message}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* Live Sandbox Execution Audit Log */}
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      沙箱异常拦截与放行实时审计台账 (wm_weight_error_log)
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      共 {state.sandboxLogs.length} 条记录
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-3 py-2 font-semibold">时间</th>
                          <th className="px-3 py-2 font-semibold">出库单号</th>
                          <th className="px-3 py-2 text-right font-semibold">理论 / 实称(kg)</th>
                          <th className="px-3 py-2 text-right font-semibold">误差</th>
                          <th className="px-3 py-2 font-semibold">拦截结果</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 tabular-nums">
                        {state.sandboxLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap">
                              {log.timestamp}
                            </td>
                            <td className="px-3 py-2 font-mono text-slate-900 whitespace-nowrap">
                              {log.orderNo}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-700 whitespace-nowrap">
                              {log.theoreticalKg.toFixed(1)} / {log.actualKg.toFixed(1)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-medium whitespace-nowrap">
                              {log.diffPercent >= 0 ? '+' : ''}
                              {log.diffPercent.toFixed(1)}%
                            </td>
                            <td className="px-3 py-2">
                              {log.status === 'PASSED' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                  <span>复核通过放行</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                  <span>
                                    {log.status === 'INTERCEPTED_EXPIRY'
                                      ? '近效期拦截'
                                      : '超差拦截已记日志'}
                                  </span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bizdiff' && (
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  以下为 AI 根据本次代码改动自动翻译的<strong>业务语义清单</strong>，供仓配业务负责人与企业管理者直接核对规则是否符合现场要求。
                </div>

                <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                  {[
                    {
                      title: '新增规则 01：出库复核称重 ±3% 硬拦截',
                      before: '原 JeeWMS 仅支持人工填写复核数量，缺乏电子秤实称自动比对与超差阻断机制。',
                      after:
                        '复核台确认时自动计算 |实称重量 - 理论重量| / 理论重量；偏差 ≤ 3% 自动放行，偏差 > 3% 弹窗阻断出库并写入 wm_weight_error_log 审计表。',
                      boundary: '未修改原生库存扣减事务，拦截发生时库存账面不产生任何脏数据。',
                    },
                    {
                      title: '新增规则 02：生鲜批次近效期 1/3 锁定保护',
                      before: '拣货员可跨批次混拣近效期商品，导致冷链门店退货损耗率偏高。',
                      after:
                        '出库复核前置检查批次剩余保质期比例，低于 33% 自动触发硬拦截并提示品控复检。',
                      boundary: '可通过配置表 wm_batch_lock_rule 按 SKU 精细化调整比例阈值。',
                    },
                    {
                      title: '安全边界：Protected Core 原生财务与库存零改动',
                      before: '传统二开常直接修改 WmStockService 导致后续升级冲突或账实不平。',
                      after:
                        '本次 100% 通过 OutboundCheckHook SPI 接口外挂实现，原生核心代码保持 0 行篡改。',
                      boundary: '已通过静态 AST 扫描与 14 条沙箱自动化回归用例验证。',
                    },
                  ].map((item) => (
                    <div key={item.title} className="p-4 space-y-2">
                      <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-md bg-slate-50 p-2.5 text-slate-600">
                          <span className="font-semibold text-slate-700">改造前：</span>
                          {item.before}
                        </div>
                        <div className="rounded-md bg-indigo-50/70 p-2.5 text-indigo-950">
                          <span className="font-semibold text-indigo-800">改造后：</span>
                          {item.after}
                        </div>
                      </div>
                      <div className="text-xs text-emerald-700 font-medium">
                        隔离保证：{item.boundary}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'gitdiff' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span>
                    分支：<code className="font-mono text-slate-900">feat/jeewms-coldchain-outbound-spi</code>
                  </span>
                  <span className="font-mono text-emerald-700">+20 additions · -1 deletion (0 core files touched)</span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed">
                  {GIT_DIFF_LINES.map((line, idx) => (
                    <div
                      key={idx}
                      className={`px-2 py-0.5 whitespace-pre ${
                        line.type === 'hdr'
                          ? 'text-slate-400 font-semibold border-b border-slate-800 pb-1 mb-1'
                          : line.type === 'add'
                          ? 'bg-emerald-950/60 text-emerald-300'
                          : line.type === 'del'
                          ? 'bg-rose-950/60 text-rose-300'
                          : 'text-slate-300'
                      }`}
                    >
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/90 px-5 py-3.5">
            <div className="text-xs text-slate-600">
              沙箱交互测试与静态代码扫描均已就绪，提交后进入银行级人工门禁签发流程。
            </div>
            <button
              type="button"
              onClick={handleSubmitToGate3}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>沙箱验收通过，提交至 GATE 3 签发</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
