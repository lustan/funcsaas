import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  DatabaseZap,
  Loader2,
  ShieldCheck,
  Terminal,
  Wrench,
} from 'lucide-react';
import { StagePipelineBar } from '../components/layout/StagePipelineBar';
import { useDemo } from '../context/DemoContext';

export function AiOpsPage() {
  const { state, triggerSlowQueryIncident, executeHotfix } = useDemo();
  const inc = state.aiopsIncident;
  const isAlert = inc.status === 'ALERT_ACTIVE';
  const isPatching = inc.status === 'PATCHING';
  const isResolved = inc.status === 'RESOLVED';

  // Latency series for SVG telemetry chart
  const latencySeries = isAlert
    ? [34, 36, 35, 39, 41, 48, 320, 1180, 2140, 2840, 2790]
    : isPatching
    ? [34, 36, 39, 320, 1180, 2840, 2410, 890, 210, 62, 45]
    : [36, 35, 38, 37, 34, 39, 36, 35, 37, 38, 38];

  const p99Ms = isAlert ? 2840 : isPatching ? 450 : 38;
  const pdaSuccessRate = isAlert ? '96.42%' : isPatching ? '98.90%' : '99.98%';
  const containerHealth = isAlert ? '3/3 运行 (DB 负载偏高)' : '3/3 健康运行';

  return (
    <div className="min-h-[calc(100vh-57px)] flex flex-col bg-slate-50">
      <StagePipelineBar />

      <div className="mx-auto w-full max-w-[1440px] px-6 py-6 space-y-6">
        {/* Header with Incident Trigger Control */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">
              7×24h AIOps 智能运维守护中心
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              实时监测生产集群 API 延迟、PDA 终端扫码成功率与数据库慢查询，异常触发后由 AIOps Agent 自动定位根因并生成零停机热修复补丁。
            </p>
          </div>

          <button
            type="button"
            onClick={triggerSlowQueryIncident}
            disabled={isAlert || isPatching}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              isAlert || isPatching
                ? 'border-amber-300 bg-amber-50 text-amber-800 cursor-not-allowed'
                : 'border-amber-500 bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              {isAlert
                ? '告警剧本已激活 · 等待授权热修复'
                : isPatching
                ? '正在执行在线热修复…'
                : '模拟 PDA 扫码慢查询告警'}
            </span>
          </button>
        </div>

        {/* Top 4-Column Operational KPI Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>P99 接口响应耗时</span>
              <Activity className={`h-4 w-4 ${isAlert ? 'text-amber-600' : 'text-emerald-600'}`} />
            </div>
            <div
              className={`mt-2 font-mono text-2xl font-bold tabular-nums ${
                isAlert ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {p99Ms} ms
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {isAlert ? '阈值告警：超出 200ms SLA 上限' : 'SLO 基线 ≤ 200ms（健康）'}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>PDA 扫码复核成功率</span>
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {pdaSuccessRate}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {isAlert ? '部分终端因超时触发重扫重试' : '华东冷链仓 38 台 PDA 终端在线'}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>容器与服务节点健康度</span>
              <Cpu className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 font-display text-lg font-bold text-slate-900">
              {containerHealth}
            </div>
            <div className="mt-1 font-mono text-xs text-slate-500">
              jeewms-spi-pod · CPU 28% / Mem 54%
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>今日出库称重防呆拦截</span>
              <DatabaseZap className="h-4 w-4 text-rose-600" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              14 次 / 1,842 单
            </div>
            <div className="mt-1 text-xs text-slate-500">已累计拦截潜在货损约 ¥28,400</div>
          </div>
        </div>

        {/* Main Split: Telemetry SVG Chart + AIOps Self-Healing Playbook */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Real-time SVG Telemetry Chart */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-display text-sm font-semibold text-slate-900">
                  出库复核接口 P99 延迟实时曲线 (ms)
                </h2>
                <p className="mt-0.5 font-mono text-xs text-slate-500">{inc.endpoint}</p>
              </div>
              <span
                className={`rounded border px-2 py-0.5 font-mono text-[11px] font-medium ${
                  isAlert
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : isPatching
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
              >
                {isAlert ? 'LATENCY SPIKE' : isPatching ? 'HOTFIX APPLYING' : 'NOMINAL 38ms'}
              </span>
            </div>

            <div className="mt-4">
              <svg viewBox="0 0 600 230" className="w-full h-auto">
                {/* Horizontal gridlines */}
                {[0, 750, 1500, 2250, 3000].map((val) => {
                  const y = 195 - (val / 3000) * 165;
                  return (
                    <g key={val}>
                      <line
                        x1={48}
                        y1={y}
                        x2={580}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={40}
                        y={y + 4}
                        textAnchor="end"
                        fontSize={10}
                        fill="#64748B"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* SLA Threshold line at 200ms */}
                <line
                  x1={48}
                  y1={195 - (200 / 3000) * 165}
                  x2={580}
                  y2={195 - (200 / 3000) * 165}
                  stroke="#D97706"
                  strokeDasharray="5 3"
                  strokeWidth={1}
                />
                <text x={578} y={180} textAnchor="end" fontSize={9} fill="#B45309">
                  SLA 200ms
                </text>

                {/* Area + Line path */}
                {(() => {
                  const stepX = (580 - 55) / (latencySeries.length - 1);
                  const pts = latencySeries.map((val, idx) => {
                    const x = 55 + idx * stepX;
                    const y = 195 - (Math.min(val, 3000) / 3000) * 165;
                    return { x, y, val };
                  });
                  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
                  const area = `55,195 ${polyline} ${pts[pts.length - 1].x},195`;
                  const strokeColor = isAlert ? '#D97706' : isPatching ? '#4F46E5' : '#16A34A';
                  const fillColor = isAlert
                    ? 'rgba(217, 119, 6, 0.14)'
                    : isPatching
                    ? 'rgba(79, 70, 229, 0.12)'
                    : 'rgba(22, 163, 74, 0.12)';

                  return (
                    <>
                      <polygon points={area} fill={fillColor} />
                      <polyline
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={2.5}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={polyline}
                      />
                      {pts.map((p, idx) => (
                        <circle
                          key={idx}
                          cx={p.x}
                          cy={p.y}
                          r={idx === pts.length - 1 ? 4.5 : 3}
                          fill="#FFFFFF"
                          stroke={strokeColor}
                          strokeWidth={2}
                        />
                      ))}
                    </>
                  );
                })()}

                {/* X-axis timestamps */}
                {['-50s', '-40s', '-30s', '-20s', '-10s', 'Now'].map((lbl, idx) => (
                  <text
                    key={lbl}
                    x={55 + idx * 105}
                    y={216}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#64748B"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {lbl}
                  </text>
                ))}
              </svg>
            </div>
          </section>

          {/* AIOps Self-Healing Diagnostic & Patch Console */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-indigo-600" />
                  <h2 className="font-display text-sm font-semibold text-slate-900">
                    AIOps Agent 根因分析与热修复引擎
                  </h2>
                </div>
                <span className="font-mono text-xs text-slate-500">
                  {inc.status === 'NORMAL'
                    ? '巡检待命中'
                    : inc.status === 'ALERT_ACTIVE'
                    ? `告警时间 ${inc.detectedAt}`
                    : inc.status === 'PATCHING'
                    ? '热修复执行中'
                    : `已自愈 ${inc.resolvedAt}`}
                </span>
              </div>

              {inc.status === 'NORMAL' && (
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center space-y-3">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600" />
                  <div className="text-sm font-semibold text-slate-900">
                    当前全链路指标正常，无待处理异常告警
                  </div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    点击右上角「模拟 PDA 扫码慢查询告警」按钮，可现场演示从慢 SQL 自动抓包、索引缺失定位到零停机热修复的完整 AIOps 自愈闭环。
                  </p>
                </div>
              )}

              {(isAlert || isPatching) && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                      <span>{inc.title} · P99 飙升至 {inc.p99BeforeMs}ms</span>
                    </div>
                    <p className="mt-1.5 leading-relaxed text-amber-900">{inc.rootCause}</p>
                  </div>

                  <div>
                    <div className="mb-1.5 text-xs font-semibold text-slate-700">
                      AIOps Agent 自动生成零停机 SQL 热修复补丁：
                    </div>
                    <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3.5 font-mono text-xs leading-relaxed text-emerald-300">
                      <code>{inc.sqlPatch}</code>
                    </pre>
                  </div>
                </div>
              )}

              {isResolved && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-950">
                    <div className="flex items-center gap-2 font-semibold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>AI 自愈热修复完成 · 系统指标已恢复基线</span>
                    </div>
                    <p className="mt-1.5 leading-relaxed text-emerald-900">
                      已在线完成 <code className="font-mono">idx_notice_batch_created</code> 联合索引创建（INPLACE 无锁模式），<code className="font-mono">scanBarcode</code> 接口 P99 耗时由{' '}
                      <strong className="font-mono">2,840ms</strong> 降至{' '}
                      <strong className="font-mono">38ms</strong>，全程 0 业务中断。
                    </p>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3.5 font-mono text-xs leading-relaxed text-slate-300">
                    <code>{inc.sqlPatch}</code>
                  </pre>
                </div>
              )}
            </div>

            {(isAlert || isPatching) && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-500">
                  已预校验：无锁在线 DDL，不影响前端 PDA 持续作业
                </span>
                <button
                  type="button"
                  onClick={executeHotfix}
                  disabled={isPatching}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPatching ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>正在下发并验证补丁…</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="h-3.5 w-3.5" />
                      <span>授权执行热修复</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Audit History Table */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              AIOps 巡检与自愈审计记录
            </h2>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              共 {state.aiopsAuditHistory.length} 条
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">时间</th>
                  <th className="px-4 py-2.5 font-semibold">守护事件</th>
                  <th className="px-4 py-2.5 font-semibold">执行动作</th>
                  <th className="px-4 py-2.5 font-semibold">校验结果</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.aiopsAuditHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono text-slate-500 whitespace-nowrap tabular-nums">
                      {row.time}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                      {row.event}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{row.action}</td>
                    <td className="px-4 py-2.5 text-emerald-700 font-medium whitespace-nowrap">
                      {row.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
