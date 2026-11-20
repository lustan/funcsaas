import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Check,
  Copy,
  Database,
  FileCode2,
  GitMerge,
  Loader2,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import { StagePipelineBar } from '../components/layout/StagePipelineBar';
import { SequenceDiagramSvg } from '../components/discovery/SequenceDiagramSvg';
import { useDemo } from '../context/DemoContext';

type BlueprintTab = 'fitgap' | 'diagram' | 'ddl';
type FitGapFilter = 'ALL' | 'OUT_OF_BOX' | 'SPI_EXTENSION';

export function DiscoveryPage() {
  const {
    state,
    fitGapItems,
    totalPoints,
    totalDays,
    isAgentThinking,
    setPendingQuickPrompt,
    toggleChip,
    sendDiscoveryPrompt,
    submitGate1,
  } = useDemo();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<BlueprintTab>('fitgap');
  const [fitGapFilter, setFitGapFilter] = useState<FitGapFilter>('ALL');
  const [inputValue, setInputValue] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [showGate1Modal, setShowGate1Modal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-consume quick prompt carried over from HubPage
  useEffect(() => {
    if (state.pendingQuickPrompt) {
      const prompt = state.pendingQuickPrompt;
      setPendingQuickPrompt(null);
      sendDiscoveryPrompt(prompt);
    }
  }, [state.pendingQuickPrompt, setPendingQuickPrompt, sendDiscoveryPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages.length, isAgentThinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isAgentThinking) return;
    sendDiscoveryPrompt(inputValue);
    setInputValue('');
  };

  const filteredFitGap = fitGapItems.filter((item) => {
    if (fitGapFilter === 'ALL') return true;
    return item.fitType === fitGapFilter;
  });

  const enabledChips = state.chips.filter((c) => c.enabled);
  const combinedDdl = [
    ...enabledChips.map((c) => `-- ${c.ddlTitle}\n${c.ddlSql}`),
    ...state.customRequirements
      .filter((r) => r.ddlSql)
      .map((r) => `-- ${r.ddlTitle}\n${r.ddlSql}`),
  ].join('\n\n');

  const handleCopySql = () => {
    if (!combinedDdl) return;
    navigator.clipboard?.writeText(combinedDdl);
    setCopiedSql(true);
    window.setTimeout(() => setCopiedSql(false), 1800);
  };

  const handleConfirmGate1 = () => {
    submitGate1();
    setShowGate1Modal(false);
    navigate('/studio/sandbox');
  };

  return (
    <div className="min-h-[calc(100vh-57px)] flex flex-col bg-slate-50">
      <StagePipelineBar />

      {/* Main Split Workspace: Left Chat / Right Real-time Blueprint Canvas */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:grid lg:grid-cols-12 gap-6 px-6 py-6">
        {/* Left Panel: Discovery Agent Structured Interview */}
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:col-span-5 lg:h-[calc(100vh-205px)] lg:min-h-[580px]">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
            <div>
              <h1 className="font-display text-sm font-semibold text-slate-900">
                Discovery Agent 结构化访谈
              </h1>
              <p className="text-xs text-slate-500">
                勾选业务规则芯片或输入自定义需求，右侧蓝图即时响应
              </p>
            </div>
            <span className="font-mono text-xs text-indigo-600 font-medium whitespace-nowrap">
              AST-L4 对齐中
            </span>
          </div>

          {/* Chat Thread */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {state.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                    msg.role === 'agent'
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-slate-900 text-white'
                  }`}
                >
                  {msg.role === 'agent' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>

                <div
                  className={`max-w-[85%] rounded-lg border px-4 py-3 text-xs leading-relaxed ${
                    msg.role === 'agent'
                      ? 'border-slate-200 bg-slate-50 text-slate-700'
                      : 'border-indigo-600 bg-indigo-600 text-white'
                  }`}
                >
                  {msg.title && (
                    <div className="mb-1 font-semibold text-slate-900">{msg.title}</div>
                  )}
                  <div className="whitespace-pre-line">{msg.content}</div>
                  {msg.highlights && msg.highlights.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2 border-t border-slate-200 pt-2">
                      {msg.highlights.map((hl) => (
                        <span
                          key={hl}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700"
                        >
                          <Check className="h-3 w-3" />
                          <span>{hl}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className={`mt-1.5 font-mono text-[10px] ${
                      msg.role === 'agent' ? 'text-slate-400' : 'text-indigo-200'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isAgentThinking && (
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2">
                  正在检索 JeeWMS AST 代码图谱并生成 SPI 增量方案…
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Interactive Business Option Chips */}
          <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-3.5">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">可点击业务策略芯片（实时联动右侧蓝图）</span>
              <span className="font-mono text-slate-500 tabular-nums">
                已启用 {enabledChips.length}/{state.chips.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {state.chips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => toggleChip(chip.id)}
                  title={chip.description}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    chip.enabled
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-xs border ${
                      chip.enabled
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {chip.enabled && <Check className="h-2.5 w-2.5" />}
                  </span>
                  <span>{chip.label}</span>
                  <span className="font-mono text-[11px] opacity-75">+{chip.points}点</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Requirement Input */}
          <form onSubmit={handleSend} className="border-t border-slate-200 p-4">
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span>快捷追问：</span>
              {[
                '对接金蝶 ERP 回传出库实发重量',
                '冷库月台温度超过 4°C 自动冻结出库',
                '复核通过自动打印 ZPL 溯源面单',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInputValue(preset)}
                  className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入任意定制需求（如：对接 ERP、温湿度探头、打印标签）..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isAgentThinking}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>发送评估</span>
              </button>
            </div>
          </form>
        </section>

        {/* Right Panel: Real-Time Blueprint Canvas (3 Tabs) */}
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:col-span-7 lg:h-[calc(100vh-205px)] lg:min-h-[580px]">
          {/* Tab Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('fitgap')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'fitgap'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode2 className="h-3.5 w-3.5" />
                <span>Fit-Gap 匹配度矩阵</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('diagram')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'diagram'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitMerge className="h-3.5 w-3.5" />
                <span>业务流程与架构时序图</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ddl')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'ddl'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="h-3.5 w-3.5" />
                <span>数据库增量 DDL 预览</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Protected Core 零侵入隔离</span>
            </div>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'fitgap' && (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    共对齐 <span className="font-mono font-semibold text-slate-900">{fitGapItems.length}</span> 项业务能力，其中原生开箱即用{' '}
                    <span className="font-mono font-semibold text-emerald-700">
                      {fitGapItems.filter((i) => i.fitType === 'OUT_OF_BOX').length}
                    </span>{' '}
                    项，SPI 增量二开{' '}
                    <span className="font-mono font-semibold text-indigo-700">
                      {fitGapItems.filter((i) => i.fitType === 'SPI_EXTENSION').length}
                    </span>{' '}
                    项
                  </div>
                  <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs">
                    {[
                      { id: 'ALL', label: '全部' },
                      { id: 'OUT_OF_BOX', label: '开箱即用 (0点)' },
                      { id: 'SPI_EXTENSION', label: 'SPI 增量二开' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFitGapFilter(f.id as FitGapFilter)}
                        className={`rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                          fitGapFilter === f.id
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">业务模块</th>
                        <th className="px-4 py-2.5 font-semibold">需求边界说明</th>
                        <th className="px-4 py-2.5 font-semibold">AST 映射类 / Hook</th>
                        <th className="px-4 py-2.5 font-semibold">交付形态</th>
                        <th className="px-4 py-2.5 text-right font-semibold">点数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredFitGap.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                            {row.module}
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-xs">{row.requirement}</td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-700">
                            {row.targetSymbol}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {row.fitType === 'OUT_OF_BOX' ? (
                              <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                {row.effortLabel}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                                {row.effortLabel}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                            {row.points} 点
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'diagram' && (
              <SequenceDiagramSvg
                chips={state.chips}
                customRequirements={state.customRequirements}
              />
            )}

            {activeTab === 'ddl' && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    仅生成只增不删（Append-Only）的增量业务表结构，已通过无 <code className="font-mono text-rose-700">DROP / TRUNCATE</code> 扫描。
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    disabled={!combinedDdl}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>已复制 SQL</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>复制增量 DDL</span>
                      </>
                    )}
                  </button>
                </div>

                {combinedDdl ? (
                  <pre className="overflow-x-auto rounded-lg bg-slate-900 p-5 font-mono text-xs leading-relaxed text-slate-100">
                    <code>{combinedDdl}</code>
                  </pre>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-xs text-slate-500">
                    当前未启用任何增量扩展芯片，请在左侧勾选至少一项业务规则以生成增量 DDL。
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/90 px-5 py-3.5">
            <div className="flex flex-wrap items-center gap-5 text-xs tabular-nums">
              <div>
                <span className="text-slate-500">总消耗点数：</span>
                <span className="font-mono text-base font-bold text-slate-900">
                  {totalPoints} 点
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="text-slate-500">预估交付周期：</span>
                <span className="font-mono text-base font-bold text-indigo-700">
                  {totalDays} 天
                </span>
              </div>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="hidden sm:inline text-slate-500">
                原生核心改动：<strong className="font-mono text-emerald-700">0 行</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowGate1Modal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>提交至 GATE 1 审批</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      </div>

      {/* GATE 1 Confirmation Modal */}
      {showGate1Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900">
                GATE 1 方案蓝图冻结确认
              </h2>
              <span className="font-mono text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                人工门禁确认
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <p>
                即将冻结「<strong>{state.projectName}</strong>」的需求蓝图，并授权 Coding & QA Agent 在隔离沙箱中启动自动化 SPI 增量代码生成。
              </p>

              <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5 tabular-nums">
                <div>
                  <div className="text-slate-500">SPI 扩展项</div>
                  <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
                    {fitGapItems.filter((i) => i.fitType === 'SPI_EXTENSION').length} 项
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">冻结点数</div>
                  <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
                    {totalPoints} 点
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">预计交付</div>
                  <div className="mt-0.5 font-mono text-sm font-semibold text-indigo-700">
                    {totalDays} 天
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-emerald-800">
                Protected Core 安全承诺：核心库存事务类 <code className="font-mono">WmStockService</code> 已锁定为物理只读，不会进入修改队列。
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowGate1Modal(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                返回继续调整
              </button>
              <button
                type="button"
                onClick={handleConfirmGate1}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>确认冻结并进入沙箱二开</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
