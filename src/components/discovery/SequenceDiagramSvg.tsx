import React from 'react';
import { BusinessChip, CustomRequirement } from '../../types/funcsaas';

interface SequenceDiagramSvgProps {
  chips: BusinessChip[];
  customRequirements: CustomRequirement[];
}

export function SequenceDiagramSvg({ chips, customRequirements }: SequenceDiagramSvgProps) {
  const batchEnabled = chips.find((c) => c.id === 'chip-batch-expiry')?.enabled ?? false;
  const scaleEnabled = chips.find((c) => c.id === 'chip-scale-check')?.enabled ?? false;
  const qcEnabled = chips.find((c) => c.id === 'chip-return-qc')?.enabled ?? false;

  const extraStepsCount = customRequirements.length + (qcEnabled ? 1 : 0);
  const svgHeight = 460 + extraStepsCount * 58;

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>JeeWMS 出库复核与 SPI 增量拦截时序图（随左侧勾选实时更新）</span>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-indigo-600" />
            <span>已激活 SPI 扩展节点</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-rose-600" />
            <span>内核保护锁 / 拦截异常</span>
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 880 ${svgHeight}`}
        className="w-full min-w-[720px] h-auto select-none"
        role="img"
        aria-label="JeeWMS 出库复核架构时序图"
      >
        <defs>
          <marker
            id="arrow-indigo"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#4F46E5" />
          </marker>
          <marker
            id="arrow-slate"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748B" />
          </marker>
          <marker
            id="arrow-rose"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#E11D48" />
          </marker>
          <marker
            id="arrow-emerald"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#16A34A" />
          </marker>
        </defs>

        {/* Lifelines */}
        {[
          { x: 95, title: 'PDA 复核台', sub: '电子秤硬件流', color: '#0F172A' },
          { x: 280, title: 'WmOmQmIController', sub: 'JeeWMS 接入层', color: '#334155' },
          { x: 475, title: 'OutboundCheckHook', sub: 'SPI 扩展总线', color: '#4F46E5' },
          { x: 665, title: 'Audit & Log DB', sub: '增量 DDL 表', color: '#0F172A' },
          { x: 810, title: 'WmStockService', sub: 'Protected Core', color: '#BE123C' },
        ].map((actor) => (
          <g key={actor.title}>
            <rect
              x={actor.x - 74}
              y={16}
              width={148}
              height={46}
              rx={6}
              fill={actor.color === '#4F46E5' ? '#EEF2FF' : actor.color === '#BE123C' ? '#FFF1F2' : '#F8FAFC'}
              stroke={actor.color === '#4F46E5' ? '#6366F1' : actor.color === '#BE123C' ? '#FB7185' : '#CBD5E1'}
              strokeWidth={1.2}
            />
            <text
              x={actor.x}
              y={35}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill={actor.color === '#4F46E5' ? '#3730A3' : actor.color === '#BE123C' ? '#9F1239' : '#0F172A'}
            >
              {actor.title}
            </text>
            <text x={actor.x} y={51} textAnchor="middle" fontSize={10} fill="#64748B">
              {actor.sub}
            </text>
            <line
              x1={actor.x}
              y1={62}
              x2={actor.x}
              y2={svgHeight - 20}
              stroke={actor.color === '#BE123C' ? '#FDA4AF' : '#CBD5E1'}
              strokeDasharray="4 4"
              strokeWidth={1.2}
            />
          </g>
        ))}

        {/* Step 1: PDA Scan -> Controller */}
        <line
          x1={95}
          y1={96}
          x2={274}
          y2={96}
          stroke="#64748B"
          strokeWidth={1.5}
          markerEnd="url(#arrow-slate)"
        />
        <text x={185} y={89} textAnchor="middle" fontSize={11} fontWeight={500} fill="#1E293B">
          1. 扫码并上报实称重量(kg)
        </text>

        {/* Step 2: Controller -> OutboundCheckHook */}
        <line
          x1={280}
          y1={134}
          x2={469}
          y2={134}
          stroke="#4F46E5"
          strokeWidth={1.8}
          markerEnd="url(#arrow-indigo)"
        />
        <text x={378} y={127} textAnchor="middle" fontSize={11} fontWeight={600} fill="#3730A3">
          2. 触发 OutboundCheckHook.beforeConfirm()
        </text>

        {/* Step 3: Batch Expiry Policy */}
        <g opacity={batchEnabled ? 1 : 0.35}>
          <rect
            x={390}
            y={156}
            width={175}
            height={44}
            rx={6}
            fill={batchEnabled ? '#EEF2FF' : '#F8FAFC'}
            stroke={batchEnabled ? '#4F46E5' : '#CBD5E1'}
            strokeWidth={1.5}
          />
          <text
            x={477}
            y={175}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill={batchEnabled ? '#312E81' : '#64748B'}
          >
            {batchEnabled ? '✔ 批次与近效期校验' : '○ 批次效期校验 (未启用)'}
          </text>
          <text x={477} y={191} textAnchor="middle" fontSize={10} fill="#64748B">
            BatchExpiryPolicyImpl · 剩余效期≥1/3
          </text>
        </g>

        {/* Step 4: Scale Weight Check */}
        <g opacity={scaleEnabled ? 1 : 0.35}>
          <rect
            x={390}
            y={216}
            width={175}
            height={48}
            rx={6}
            fill={scaleEnabled ? '#EEF2FF' : '#F8FAFC'}
            stroke={scaleEnabled ? '#4F46E5' : '#CBD5E1'}
            strokeWidth={1.5}
          />
          <text
            x={477}
            y={236}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill={scaleEnabled ? '#312E81' : '#64748B'}
          >
            {scaleEnabled ? '✔ 电子秤误差比对 (≤3%)' : '○ 称重容差比对 (未启用)'}
          </text>
          <text x={477} y={252} textAnchor="middle" fontSize={10} fill="#64748B">
            |actual - theory| / theory ≤ 0.03
          </text>

          {/* Branch: >3% Intercept -> Audit DB */}
          <line
            x1={565}
            y1={240}
            x2={659}
            y2={240}
            stroke={scaleEnabled ? '#E11D48' : '#CBD5E1'}
            strokeWidth={1.6}
            markerEnd={scaleEnabled ? 'url(#arrow-rose)' : 'url(#arrow-slate)'}
          />
          <text
            x={612}
            y={232}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill={scaleEnabled ? '#BE123C' : '#94A3B8'}
          >
            误差&gt;3% 拦截
          </text>
          <rect
            x={590}
            y={254}
            width={150}
            height={32}
            rx={5}
            fill={scaleEnabled ? '#FFF1F2' : '#F8FAFC'}
            stroke={scaleEnabled ? '#FDA4AF' : '#E2E8F0'}
          />
          <text
            x={665}
            y={274}
            textAnchor="middle"
            fontSize={10}
            fontWeight={500}
            fill={scaleEnabled ? '#9F1239' : '#94A3B8'}
          >
            写 wm_weight_error_log
          </text>
        </g>

        {/* Optional Chip: Return QC */}
        {qcEnabled && (
          <g>
            <rect
              x={390}
              y={296}
              width={175}
              height={42}
              rx={6}
              fill="#ECFDF5"
              stroke="#10B981"
              strokeWidth={1.5}
            />
            <text x={477} y={314} textAnchor="middle" fontSize={11} fontWeight={600} fill="#065F46">
              ✔ 退货质检隔离策略
            </text>
            <text x={477} y={329} textAnchor="middle" fontSize={10} fill="#047857">
              ReturnQuarantinePolicyImpl
            </text>
          </g>
        )}

        {/* Custom Dynamic Requirements added by user */}
        {customRequirements.map((req, idx) => {
          const yOffset = (qcEnabled ? 352 : 296) + idx * 54;
          return (
            <g key={req.id}>
              <rect
                x={390}
                y={yOffset}
                width={175}
                height={42}
                rx={6}
                fill="#EEF2FF"
                stroke="#4F46E5"
                strokeWidth={1.5}
              />
              <text x={477} y={yOffset + 18} textAnchor="middle" fontSize={11} fontWeight={600} fill="#312E81">
                + {req.diagramNodeLabel}
              </text>
              <text x={477} y={yOffset + 33} textAnchor="middle" fontSize={10} fill="#4338CA">
                {req.fitGapRow.module} ({req.fitGapRow.points} 点)
              </text>
            </g>
          );
        })}

        {/* Final Step: Pass -> Protected Core Stock Commit */}
        {(() => {
          const finalY = 330 + extraStepsCount * 54;
          return (
            <g>
              <line
                x1={475}
                y1={finalY}
                x2={804}
                y2={finalY}
                stroke="#16A34A"
                strokeWidth={1.8}
                markerEnd="url(#arrow-emerald)"
              />
              <text x={640} y={finalY - 8} textAnchor="middle" fontSize={11} fontWeight={600} fill="#15803D">
                校验全绿通过 → 调用原生库存事务扣减（只读保护锁零侵入）
              </text>

              <line
                x1={475}
                y1={finalY + 38}
                x2={101}
                y2={finalY + 38}
                stroke="#64748B"
                strokeDasharray="5 3"
                strokeWidth={1.4}
                markerEnd="url(#arrow-slate)"
              />
              <text x={285} y={finalY + 31} textAnchor="middle" fontSize={11} fill="#334155">
                返回复核结果：放行 / 红色阻断提示
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
