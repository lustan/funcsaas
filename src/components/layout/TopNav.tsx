import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { RotateCcw, Check } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

const NAV_ITEMS = [
  { to: '/hub', label: '开源底座大厅' },
  { to: '/studio/discovery', label: '需求评估蓝图' },
  { to: '/studio/sandbox', label: '沙箱二开控制台' },
  { to: '/studio/gates', label: '审批门禁中心' },
  { to: '/studio/aiops', label: 'AIOps 运维守护' },
];

export function TopNav() {
  const { resetDemo } = useDemo();
  const navigate = useNavigate();
  const [justReset, setJustReset] = useState(false);

  const handleReset = () => {
    resetDemo();
    setJustReset(true);
    navigate('/hub');
    window.setTimeout(() => setJustReset(false), 1800);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single-line Brand Wordmark */}
        <NavLink
          to="/hub"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors"
        >
          funcsaas
        </NavLink>

        {/* Zone 2: Clean Typography Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-[15px] h-0.5 bg-indigo-600" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Primary Utility Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              justReset
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {justReset ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>已恢复初始状态</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                <span>重置演示状态</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile horizontal sub-nav */}
      <nav className="flex md:hidden items-center gap-5 overflow-x-auto border-t border-slate-100 px-6 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `text-xs font-medium whitespace-nowrap shrink-0 ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
