import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Clock,
  Cpu,
  GitBranch,
  Layers,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { OPEN_SOURCE_BASES } from '../data/initialDemoState';
import { useDemo } from '../context/DemoContext';

const QUICK_PROMPT_SAMPLES = [
  '生鲜冷链出库必须接入电子秤复核，误差超3%硬拦截并记录异常日志',
  '出库单放行后自动异步回传实发重量至金蝶 ERP',
  '冷藏车装车月台温度超过 4°C 自动冻结出库波次',
];

export function HubPage() {
  const { state, setPendingQuickPrompt, reserveUpcomingBase } = useDemo();
  const navigate = useNavigate();
  const [quickInput, setQuickInput] = useState(
    '生鲜冷链仓出库需要对接电子秤复核，误差超过3%拦截并校验批次效期'
  );

  const handleQuickEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const text = quickInput.trim();
    if (text) {
      setPendingQuickPrompt(text);
    }
    navigate('/studio/discovery');
  };

  const availableBase = OPEN_SOURCE_BASES.find((b) => b.status === 'AVAILABLE')!;
  const upcomingBases = OPEN_SOURCE_BASES.filter((b) => b.status === 'COMING_SOON');

  return (
    <div className="min-h-[calc(100vh-57px)] bg-slate-50">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-14 lg:py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="mb-4 flex flex-wrap items-center gap-2.5 text-xs font-medium text-indigo-700">
                <span>AI 原生企业软件交付平台</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="text-slate-500">首期标杆试点：JeeWMS 智能仓储底座</span>
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] lg:leading-[1.18] text-balance">
                代码边际成本趋零，AI Agent 驱动开源项目从评估到运维的全生命周期交付
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
                告别传统定制外包的漫长需求扯皮与高昂人天成本。funcsaas 基于全量 AST 代码血缘图谱与
                Protected Core 内核保护锁，将开源软件二开周期从数月压缩至 3–5 天，每一步均经过自动化测试与密码学门禁签发。
              </p>

              {/* One-Sentence Quick Estimate Input */}
              <form onSubmit={handleQuickEstimate} className="mt-8 max-w-2xl">
                <label
                  htmlFor="quick-estimate-input"
                  className="block text-xs font-semibold text-slate-700 mb-2"
                >
                  一句话需求快速试算（自动携带需求进入 AI 评估工作台）
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    id="quick-estimate-input"
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder="输入您的仓储/业务定制诉求，例如：出库复核对接电子秤，误差超3%拦截..."
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>立即 AI 试算评估</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="shrink-0">示例需求：</span>
                  {QUICK_PROMPT_SAMPLES.map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setQuickInput(sample)}
                      className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-left text-xs text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      {sample.length > 26 ? `${sample.slice(0, 26)}…` : sample}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Right Hero Structural Overview */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-slate-100">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-medium text-slate-400">当前演示标杆环境</div>
                    <div className="mt-1 font-display text-base font-semibold text-white">
                      {state.projectName}
                    </div>
                  </div>
                  <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs text-emerald-300 whitespace-nowrap">
                    L4 AST 图谱就绪
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-indigo-400">
                      <GitBranch className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">全量 AST 血缘切片与 SPI 注入</div>
                      <div className="mt-0.5 text-xs leading-relaxed text-slate-400">
                        精准召回目标 Controller 与 Service 链路，增量逻辑外挂于标准 Hook，不破坏原生架构。
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-rose-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Protected Core 内核保护锁</div>
                      <div className="mt-0.5 text-xs leading-relaxed text-slate-400">
                        核心库存账实事务（WmStockService）物理只读锁定，静态扫描与门禁校验双重拦截越权改动。
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-emerald-400">
                      <Terminal className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">隔离沙箱验收 + 密码学 Gate 签发</div>
                      <div className="mt-0.5 text-xs leading-relaxed text-slate-400">
                        客户可在沙箱内直接实操业务拦截场景，确认无误后签发 Gate JWT Token 零停机上线。
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-800 pt-4 tabular-nums">
                  <div>
                    <div className="text-xs text-slate-400">标准扩展 Hook</div>
                    <div className="mt-1 font-mono text-lg font-semibold text-white">12 个</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">内核篡改率</div>
                    <div className="mt-1 font-mono text-lg font-semibold text-emerald-400">0.00%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">平均交付周期</div>
                    <div className="mt-1 font-mono text-lg font-semibold text-white">3–5 天</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Base Catalog Matrix */}
      <section className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              企业级开源软件底座矩阵
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              选择已完成 AST 图谱测绘与 Protected Core 隔离认证的开源底座，开启 AI 辅助需求评估与交付。
            </p>
          </div>
          <div className="text-xs text-slate-500 tabular-nums">
            已认证可用底座 <span className="font-mono font-semibold text-slate-900">1</span> · 测绘适配中{' '}
            <span className="font-mono font-semibold text-slate-900">3</span>
          </div>
        </div>

        {/* Highlighted Available Card: JeeWMS */}
        <div className="rounded-xl border border-indigo-200 bg-white p-6 lg:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-slate-500">
                <span className="font-semibold text-indigo-600">官方试点标杆</span>
                <span aria-hidden="true">·</span>
                <span>{availableBase.category}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium">AI 治理等级 L4 - 全量 AST 图谱</span>
              </div>

              <h3 className="mt-2.5 font-display text-2xl font-bold text-slate-900">
                {availableBase.name}
              </h3>

              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                {availableBase.summary}
              </p>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-5 tabular-nums">
                <div>
                  <div className="text-xs text-slate-500">官方标杆状态</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">生产可交付</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">AI 治理等级</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-indigo-700">L4 全量图谱</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">标准扩展 Hook</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-slate-900">
                    {availableBase.hookCount} 个
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">平均交付周期</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-emerald-700">
                    {availableBase.avgDelivery}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/studio/discovery')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>开启 10 分钟 AI 匹配度评估</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/studio/sandbox')}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>直接体验隔离沙箱实操</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Grayscale Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {upcomingBases.map((base) => {
            const isReserved = state.reservedBases.includes(base.id);
            return (
              <div
                key={base.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-100/70 p-6 text-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>{base.category}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-amber-700 shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                      <span>即将上线</span>
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold text-slate-800">
                    {base.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{base.summary}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                    {base.highlights.map((h, i) => (
                      <React.Fragment key={h}>
                        {i > 0 && <span aria-hidden="true">·</span>}
                        <span>{h}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-200/80 pt-4 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500">{base.governanceLevel}</span>
                  <button
                    type="button"
                    onClick={() => reserveUpcomingBase(base.id)}
                    disabled={isReserved}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                      isReserved
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 cursor-default'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900 cursor-pointer'
                    }`}
                  >
                    {isReserved ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>已预约优先试用</span>
                      </>
                    ) : (
                      <span>预约优先接入</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deterministic 3-Pillar Architecture Strip */}
        <div className="mt-10 grid grid-cols-1 gap-6 border-t border-slate-200 pt-8 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <Cpu className="mt-0.5 h-5 w-5 text-indigo-600 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-slate-900">1. 对话即蓝图（Discovery）</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                业务诉求实时转为 Fit-Gap 矩阵、SPI 架构时序图与增量 DDL，点数与周期透明冻结。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Layers className="mt-0.5 h-5 w-5 text-indigo-600 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-slate-900">2. 沙箱自愈二开（Sandbox）</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                TDD 自动化流水线与真实嵌入式业务操作台，让非技术人员也能直观验证业务边界。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-indigo-600 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-slate-900">3. 门禁签发与自愈（Gate & AIOps）</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                银行级硬校验前置拦截风险，密码学 JWT 授权上线，上线后 7×24h 慢查询自动热修复。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
