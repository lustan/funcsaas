import { DemoState, FitGapItem } from '../types/funcsaas';

export interface OpenSourceBaseItem {
  id: string;
  name: string;
  category: string;
  status: 'AVAILABLE' | 'COMING_SOON';
  summary: string;
  highlights: string[];
  governanceLevel: string;
  hookCount?: number;
  avgDelivery?: string;
  releaseQuarter?: string;
}

export const OPEN_SOURCE_BASES: OpenSourceBaseItem[] = [
  {
    id: 'jeewms',
    name: 'JeeWMS 智能仓储底座',
    category: '仓储物流 WMS · Java / SpringBoot',
    status: 'AVAILABLE',
    summary:
      '面向冷链、快消与制造业的多货主 WMS 核心底座，已完成全量 AST 代码图谱测绘与 Protected Core 核心库存事务保护锁隔离。',
    highlights: [
      '官方试点标杆',
      'AI 治理等级 L4 - 全量 AST 图谱',
      '12 个标准扩展 Hook',
      '平均交付 3-5 天',
    ],
    governanceLevel: 'L4 AST 图谱就绪',
    hookCount: 12,
    avgDelivery: '3-5 天',
  },
  {
    id: 'ruoyi-vue-pro',
    name: 'RuoYi-Vue-Pro 企业中台',
    category: '企业权限与流程中台 · Java / Vue3',
    status: 'COMING_SOON',
    summary:
      '集成 RBAC 权限、BPM 工作流与多租户能力的高热度开源企业中台，正在完成 AST 血缘切片与门禁规则适配。',
    highlights: ['即将上线', 'AI 治理等级 L3 测绘中', '预计开放 18 个扩展点'],
    governanceLevel: 'L3 测绘中',
    releaseQuarter: '即将上线 · 支持预约',
  },
  {
    id: 'odoo',
    name: 'Odoo 开源 ERP',
    category: '业财一体 ERP · Python / PostgreSQL',
    status: 'COMING_SOON',
    summary:
      '覆盖采购、生产 MRP、总账与销售订单的全栈开源 ERP，支持通过 Hook 机制编排中国本土化税控与仓储联动。',
    highlights: ['即将上线', '财务总账事务保护中', '支持多组织架构'],
    governanceLevel: 'L3 测绘中',
    releaseQuarter: '即将上线 · 支持预约',
  },
  {
    id: 'chatwoot',
    name: 'Chatwoot 智能客服',
    category: '全渠道客服工作台 · Ruby / React',
    status: 'COMING_SOON',
    summary:
      '企业级全渠道客户服务与工单系统，支持企微、邮件与 Web SDK 对接，即将纳入 funcsaas 沙箱交付矩阵。',
    highlights: ['即将上线', '工单路由 Hook 适配中', 'SaaS / 私有化双形态'],
    governanceLevel: 'L2 评估中',
    releaseQuarter: '即将上线 · 支持预约',
  },
];

export const BASE_OUT_OF_BOX_ITEMS: FitGapItem[] = [
  {
    id: 'oob-1',
    module: '基础资料与库位管理',
    requirement: '多温层冷链库区（-18°C 冷冻 / 0-4°C 冷藏）与货位编码建模',
    fitType: 'OUT_OF_BOX',
    targetSymbol: 'MdBinController · BaStoreService',
    points: 0,
    effortLabel: '开箱即用',
  },
  {
    id: 'oob-2',
    module: '入库收货与上架',
    requirement: '采购入库预约、PDA 扫码收货与推荐上架库位指引',
    fitType: 'OUT_OF_BOX',
    targetSymbol: 'WmInQmIController · WmToUpGoodsService',
    points: 0,
    effortLabel: '开箱即用',
  },
  {
    id: 'oob-3',
    module: '核心库存台账事务',
    requirement: '实时库存增减、库位冻结解冻与事务一致性锁（Protected Core）',
    fitType: 'OUT_OF_BOX',
    targetSymbol: 'WmStockService [内核保护锁定]',
    points: 0,
    effortLabel: '内核保护 · 0 改动',
  },
];

export const INITIAL_DEMO_STATE: DemoState = {
  projectName: '华东生鲜冷链仓 - JeeWMS',
  baseSystem: 'JeeWMS v5.2 (AST-L4)',
  stage: 'DISCOVERY',
  pendingQuickPrompt: null,
  reservedBases: [],
  chips: [
    {
      id: 'chip-batch-expiry',
      label: '强制校验批次与近效期锁定',
      description:
        '生鲜品类出库严格按 FEFO 先到期先出，剩余保质期低于 1/3 自动拦截出库并触发预警锁定。',
      points: 18,
      days: 1,
      enabled: true,
      diagramNodeId: 'node-batch-expiry',
      fitGapRow: {
        id: 'fg-batch-expiry',
        module: '批次与效期风控',
        requirement: '强制校验批次属性，剩余效期低于阈值自动锁定禁止拣选出库',
        fitType: 'SPI_EXTENSION',
        targetSymbol: 'OutboundCheckHook -> BatchExpiryPolicyImpl',
        points: 18,
        effortLabel: '1 天 · SPI 扩展',
        sourceChipId: 'chip-batch-expiry',
      },
      ddlTitle: '批次近效期锁定规则表 (wm_batch_lock_rule)',
      ddlSql: `CREATE TABLE wm_batch_lock_rule (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  goods_id VARCHAR(32) NOT NULL COMMENT '商品SKU编码',
  min_shelf_life_ratio DECIMAL(5,2) NOT NULL DEFAULT 0.33 COMMENT '最小剩余效期比例',
  lock_mode VARCHAR(16) NOT NULL DEFAULT 'HARD_BLOCK' COMMENT '拦截模式',
  create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_goods_id (goods_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生鲜冷链批次近效期拦截策略表';`,
    },
    {
      id: 'chip-scale-check',
      label: '出库复核对接电子秤，误差超3%拦截',
      description:
        '出库打包复核台读取串口/蓝牙电子秤实称重量，与订单理论重量比对，绝对误差超 ±3% 硬拦截并写异常审计日志。',
      points: 27,
      days: 2,
      enabled: true,
      diagramNodeId: 'node-scale-check',
      fitGapRow: {
        id: 'fg-scale-check',
        module: '出库称重防呆复核',
        requirement: '出库复核对接电子秤，误差 > 3% 实时阻断放行并记录称重异常日志',
        fitType: 'SPI_EXTENSION',
        targetSymbol: 'OutboundCheckHook -> ColdChainWeightCheckImpl',
        points: 27,
        effortLabel: '2 天 · SPI 扩展',
        sourceChipId: 'chip-scale-check',
      },
      ddlTitle: '出库称重异常拦截日志表 (wm_weight_error_log)',
      ddlSql: `CREATE TABLE wm_weight_error_log (
  id VARCHAR(36) PRIMARY KEY COMMENT '异常流水ID',
  om_notice_id VARCHAR(36) NOT NULL COMMENT '出库通知单号',
  goods_id VARCHAR(32) NOT NULL COMMENT '商品编码',
  goods_batch VARCHAR(64) NOT NULL COMMENT '生鲜批次号',
  theoretical_weight DECIMAL(12,4) NOT NULL COMMENT '理论出库重量(kg)',
  actual_weight DECIMAL(12,4) NOT NULL COMMENT '电子秤实称重量(kg)',
  diff_percent DECIMAL(6,2) NOT NULL COMMENT '称重偏差百分比(%)',
  block_reason VARCHAR(255) NOT NULL COMMENT '拦截原因描述',
  operator_id VARCHAR(32) NOT NULL COMMENT '复核员ID',
  create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_om_notice_date (om_notice_id, create_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库复核称重超差拦截审计日志';`,
    },
    {
      id: 'chip-return-qc',
      label: '退货入库自动质检隔离',
      description:
        '门店退货入冷链仓时默认进入待检隔离区（QUARANTINE），质检合格后方可通过标准上架接口转入良品区。',
      points: 15,
      days: 1,
      enabled: false,
      diagramNodeId: 'node-return-qc',
      fitGapRow: {
        id: 'fg-return-qc',
        module: '退货质检隔离流',
        requirement: '生鲜退货入库自动分配隔离库位，未完成品控签字禁止回流可售库存',
        fitType: 'SPI_EXTENSION',
        targetSymbol: 'InboundQcHook -> ReturnQuarantinePolicyImpl',
        points: 15,
        effortLabel: '1 天 · SPI 扩展',
        sourceChipId: 'chip-return-qc',
      },
      ddlTitle: '退货质检隔离单据表 (wm_qc_quarantine_order)',
      ddlSql: `CREATE TABLE wm_qc_quarantine_order (
  id VARCHAR(36) PRIMARY KEY COMMENT '质检隔离单ID',
  im_notice_id VARCHAR(36) NOT NULL COMMENT '退货入库单号',
  quarantine_bin VARCHAR(32) NOT NULL COMMENT '隔离库位编码',
  temp_celsius DECIMAL(5,2) COMMENT '入库抽检车厢温度(°C)',
  qc_status VARCHAR(16) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/PASS/SCRAP',
  create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_im_notice (im_notice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='冷链退货自动质检隔离台账';`,
    },
  ],
  customRequirements: [],
  messages: [
    {
      id: 'msg-1',
      role: 'agent',
      title: '已载入 JeeWMS L4 全量 AST 知识图谱',
      content:
        '您好，我是 funcsaas Discovery Agent。已完成「华东生鲜冷链仓」底座对齐：JeeWMS 原生覆盖了多温层库位建模、入库上架与核心库存台账（3 个模块 0 点数开箱可用）。请问您在生鲜冷链出库与批次管控方面有哪些强约束需求？',
      timestamp: '09:30:12',
    },
    {
      id: 'msg-2',
      role: 'user',
      content:
        '生鲜商品保质期短且经常出现拣货错拿批次或少发漏发，出库环节必须严格卡控批次效期，并且在复核台接电子秤核验重量。',
      timestamp: '09:31:04',
    },
    {
      id: 'msg-3',
      role: 'agent',
      title: '识别到 2 项 SPI 增量扩展需求，已自动映射至 OutboundCheckHook',
      content:
        '收到。分析 JeeWMS AST 血缘图谱后，我们无需改动核心库存事务类 WmStockService，仅通过标准扩展点 OutboundCheckHook 即可实现增量挂载：\n1) 强制校验批次与近效期锁定（18 点 · 1 天）\n2) 出库复核对接电子秤，误差超 ±3% 自动拦截并留痕（27 点 · 2 天）\n您可以在下方切换业务策略芯片，或直接输入补充需求。',
      timestamp: '09:31:18',
      highlights: ['未触碰 Protected Core 核心库存事务', '已自动生成 wm_weight_error_log 增量 DDL'],
    },
  ],
  pipelineSteps: [
    {
      id: 'step-ast',
      order: '01',
      name: 'AST 代码血缘子图召回',
      detail: '精准锁定 WmOmQmIController、WmOmQmIServiceI、WmToDownGoodsEntity 3 个关联类及调用链路',
      durationMs: 650,
      status: 'passed',
      badgeText: '3 个类已锁定',
    },
    {
      id: 'step-spi',
      order: '02',
      name: 'SPI 扩展点代码生成',
      detail: '生成 ColdChainOutboundWeightCheckHookImpl，通过 Spring SPI 注入，未触碰核心库存事务',
      durationMs: 800,
      status: 'passed',
      badgeText: 'SPI 零侵入',
    },
    {
      id: 'step-core',
      order: '03',
      name: 'Protected Core 内核保护锁静态扫描',
      detail: '校验 WmStockService / WmStockEntity 核心账实事务签名，确认 0 行越权篡改',
      durationMs: 550,
      status: 'passed',
      badgeText: 'PASS · 0 篡改',
    },
    {
      id: 'step-qa',
      order: '04',
      name: '沙箱自动化回归测试',
      detail: '14/14 用例全绿通过（含 1 次自愈修复：边界值 51.50kg 浮点精度偏差由 BigDecimal.HALF_UP 自动修正）',
      durationMs: 950,
      status: 'passed',
      badgeText: '14/14 通过 · 1 次自愈',
    },
  ],
  pipelineSelfHealNote:
    'Case #09 边界测试（理论 50.00kg / 实称 51.50kg 刚好 3.00% 边界）首次运行因 double 精度误差 0.03000000000000025 误判拦截，QA Agent 自动定位后重写为 BigDecimal.setScale(4, RoundingMode.HALF_UP) 并二次回归全绿通过。',
  sandboxLogs: [
    {
      id: 'log-init-1',
      orderNo: 'CK20261113-0088',
      skuName: '智利冰鲜三文鱼排 5kg/箱',
      batchNo: 'LOT-20261111-A',
      theoreticalKg: 40.0,
      actualKg: 40.4,
      diffPercent: 1.0,
      status: 'PASSED',
      message: '实称 40.40 kg，误差 +1.00% 在 ±3.0% 容差内，允许装车放行。',
      timestamp: '09:42:10',
    },
  ],
  gates: {
    GATE_1: {
      id: 'GATE_1',
      code: 'GATE 1',
      name: '方案蓝图与点数冻结审批',
      subtitle: '确认 Fit-Gap 边界、增量 DDL 结构与 Protected Core 隔离范围',
      status: 'PENDING',
    },
    GATE_3: {
      id: 'GATE_3',
      code: 'GATE 3',
      name: '隔离沙箱业务验收签发',
      subtitle: '确认沙箱实称拦截交互、Business Diff 语义及 14/14 自动化回归结果',
      status: 'LOCKED',
    },
    GATE_4: {
      id: 'GATE_4',
      code: 'GATE 4',
      name: '生产上线与迁移授权签发',
      subtitle: '签署密码学 Gate JWT Token，执行零停机灰度发布与期初台账校验',
      status: 'LOCKED',
    },
  },
  aiopsIncident: {
    id: 'inc-pda-slow',
    title: 'PDA 出库扫码复核接口慢查询告警',
    endpoint: 'POST /api/jeewms/wmOmQm/scanBarcode',
    status: 'NORMAL',
    rootCause:
      'AIOps Agent 分析慢 SQL 审计日志：wm_weight_error_log 新增联合查询按 (om_notice_id, goods_batch) 过滤时发生全表扫描（扫描行数 482,190 行），引发行锁等待与 P99 延迟飙升至 2,840 ms。',
    sqlPatch: `-- AIOps Agent 生成零停机热修复补丁 (MySQL 8.0 Online DDL)
ALTER TABLE wm_weight_error_log
  ADD INDEX idx_notice_batch_created (om_notice_id, goods_batch, create_date),
  ALGORITHM=INPLACE,
  LOCK=NONE;`,
    p99BeforeMs: 2840,
    p99AfterMs: 38,
  },
  aiopsAuditHistory: [
    {
      id: 'his-1',
      time: '08:00:00',
      event: '生产基线巡检与库存账实比对',
      action: '自动核对 12,450 条冷链 SKU 账面库存与库位余额',
      result: '账实完全一致（差异 0.0000）',
    },
    {
      id: 'his-2',
      time: '09:15:22',
      event: 'Protected Core 完整性心跳校验',
      action: '校验 WmStockService 字节码 SHA-256 摘要',
      result: '内核签名匹配，无未授权变更',
    },
  ],
};

export function matchCustomRequirement(promptText: string): {
  reply: string;
  fitGapRow: FitGapItem;
  diagramNodeLabel: string;
  ddlTitle: string;
  ddlSql: string;
} {
  const lower = promptText.toLowerCase();

  if (lower.includes('erp') || lower.includes('金蝶') || lower.includes('用友') || lower.includes('同步') || lower.includes('接口')) {
    return {
      reply:
        '已识别到 ERP 业财单据回传需求。将在出库复核放行后挂载异步事件钩子 OutboundErpSyncHook，通过幂等消息队列推送实发重量与批次明细至外部 ERP，失败自动进入补偿重试队列（预计 16 点 · 1 天）。',
      fitGapRow: {
        id: `fg-custom-${Date.now()}`,
        module: 'ERP 业财异步回传',
        requirement: promptText,
        fitType: 'SPI_EXTENSION',
        targetSymbol: 'OutboundEventHook -> ErpReceiptSyncAdapter',
        points: 16,
        effortLabel: '1 天 · SPI 扩展',
      },
      diagramNodeLabel: 'ERP 实发回传幂等队列',
      ddlTitle: 'ERP 同步幂等流水表 (wm_erp_sync_outbox)',
      ddlSql: `CREATE TABLE wm_erp_sync_outbox (
  id VARCHAR(36) PRIMARY KEY,
  biz_order_no VARCHAR(64) NOT NULL,
  payload_json JSON NOT NULL,
  sync_status VARCHAR(16) NOT NULL DEFAULT 'READY',
  retry_count INT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_biz_order (biz_order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ERP出库单据异步回传发件箱';`,
    };
  }

  if (lower.includes('温度') || lower.includes('温湿度') || lower.includes('冷链') || lower.includes('iot') || lower.includes('传感器')) {
    return {
      reply:
        '已识别到冷链温湿度 IOT 联动需求。将在装车复核环节接入冷库/月台温感探头快照校验，若环境温度超标（如冷藏 > 4°C）自动冻结出库单并推送钉钉/企微告警（预计 14 点 · 1 天）。',
      fitGapRow: {
        id: `fg-custom-${Date.now()}`,
        module: '冷链温湿度 IOT 联动',
        requirement: promptText,
        fitType: 'SPI_EXTENSION',
        targetSymbol: 'OutboundCheckHook -> ColdChainTempGuardImpl',
        points: 14,
        effortLabel: '1 天 · SPI 扩展',
      },
      diagramNodeLabel: '月台温感阈值校验',
      ddlTitle: '出库温控快照记录表 (wm_coldchain_temp_snap)',
      ddlSql: `CREATE TABLE wm_coldchain_temp_snap (
  id VARCHAR(36) PRIMARY KEY,
  om_notice_id VARCHAR(36) NOT NULL,
  sensor_code VARCHAR(32) NOT NULL,
  measured_temp DECIMAL(5,2) NOT NULL,
  threshold_max DECIMAL(5,2) NOT NULL DEFAULT 4.00,
  is_compliant TINYINT(1) NOT NULL DEFAULT 1,
  captured_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库复核冷链温度合规快照';`,
    };
  }

  if (lower.includes('标签') || lower.includes('打印') || lower.includes('面单') || lower.includes('条码') || lower.includes('pda')) {
    return {
      reply:
        '已识别到 PDA 与冷链溯源标签打印需求。将在复核通过后触发 PrintTemplateHook，自动渲染含批次效期、实称净重与溯源二维码的 ZPL 热敏指令直驱车间打印机（预计 12 点 · 0.5 天）。',
      fitGapRow: {
        id: `fg-custom-${Date.now()}`,
        module: '溯源标签 ZPL 打印',
        requirement: promptText,
        fitType: 'SPI_EXTENSION',
        targetSymbol: 'PrintTemplateHook -> ColdTraceLabelRenderer',
        points: 12,
        effortLabel: '0.5 天 · SPI 扩展',
      },
      diagramNodeLabel: 'ZPL 冷链溯源面单打印',
      ddlTitle: '打印任务审计表 (wm_label_print_audit)',
      ddlSql: `CREATE TABLE wm_label_print_audit (
  id VARCHAR(36) PRIMARY KEY,
  om_notice_id VARCHAR(36) NOT NULL,
  printer_ip VARCHAR(45) NOT NULL,
  zpl_checksum VARCHAR(64) NOT NULL,
  printed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='冷链溯源标签打印审计记录';`,
    };
  }

  return {
    reply: `已解析您的定制业务诉求：「${promptText}」。通过 JeeWMS AST 图谱检索，该规则可封装为独立策略插件挂载至 OutboundCheckHook 扩展链路，不触碰核心库存加减锁（预估消耗 15 点 · 1 天）。已同步更新右侧 Fit-Gap 矩阵、时序图节点与增量 DDL。`,
    fitGapRow: {
      id: `fg-custom-${Date.now()}`,
      module: '自定义业务策略插件',
      requirement: promptText,
      fitType: 'SPI_EXTENSION',
      targetSymbol: 'OutboundCheckHook -> CustomRulePolicyImpl',
      points: 15,
      effortLabel: '1 天 · SPI 扩展',
    },
    diagramNodeLabel: promptText.length > 14 ? `${promptText.slice(0, 14)}…` : promptText,
    ddlTitle: '自定义规则审计表 (wm_custom_rule_audit)',
    ddlSql: `CREATE TABLE wm_custom_rule_audit (
  id VARCHAR(36) PRIMARY KEY,
  om_notice_id VARCHAR(36) NOT NULL,
  rule_name VARCHAR(128) NOT NULL,
  eval_result VARCHAR(16) NOT NULL,
  detail_note VARCHAR(500),
  create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='定制业务策略执行审计日志';`,
  };
}
