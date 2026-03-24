import { Analytics } from "@vercel/analytics/react";
import React, { useState, useMemo, useEffect } from 'react';
import { calculateData, formatCurrency, formatDecimal, CalculatedSchool, SchoolData, initialSchools, DecisionMode, normalCDF, downloadToExcel, downloadToCSV, Region } from './data';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Award,
  ShieldAlert,
  Scale,
  ArrowUpDown,
  Info,
  CheckCircle2,
  XCircle,
  Swords,
  Settings,
  Plus,
  Trash2,
  Save,
  Zap,
  Briefcase,
  SlidersHorizontal,
  LineChart as LineChartIcon,
  Download,
  ArrowRightLeft,
  Globe,
  ChevronDown,
  Github,
  MapPin
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { sounds } from './utils/sounds';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getScoreBg(score: number) {
  if (score >= 8.5) return '#059669'; // Emerald 600
  if (score >= 7.0) return '#10b981'; // Emerald 500
  if (score >= 5.5) return '#f59e0b'; // Amber 500
  if (score >= 4.0) return '#f97316'; // Orange 500
  return '#ef4444'; // Red 500
}

function getRankBadge(rank: number) {
  if (rank === 1) return { bg: '#fbbf24', text: '#78350f' }; // Gold
  if (rank === 2) return { bg: '#94a3b8', text: '#0f172a' }; // Silver
  if (rank === 3) return { bg: '#b45309', text: '#fffbeb' }; // Bronze
  return { bg: '#f1f5f9', text: '#475569' };
}

function getCostBarColor(total: number, condType: string) {
  if (condType === 'hard') return '#ef4444';
  if (condType === 'soft') return '#8b5cf6';
  if (total < 150000) return '#10b981';
  if (total <= 250000) return '#3b82f6';
  return '#f59e0b';
}

function ScorePill({ score }: { score: number }) {
  return (
    <span
      className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm"
      style={{ backgroundColor: getScoreBg(score), color: '#fff' }}
    >
      {formatDecimal(score)}
    </span>
  );
}

type SortConfig<T> = {
  key: keyof T;
  direction: 'asc' | 'desc';
} | null;

const SCATTER_VIEWS = {
  cost_vs_outcomes: {
    xKey: 'totalCOA', xName: 'Total COA', xFormat: (val: number) => `$${(val/1000).toFixed(0)}k`, xDomain: ['dataMin - 10000', 'dataMax + 10000'], xReversed: false,
    yKey: 'prestige', yName: 'Outcomes (0-10)', yFormat: (val: number) => val.toFixed(1), yDomain: [0, 10],
  },
  cost_vs_composite: {
    xKey: 'totalCOA', xName: 'Total COA', xFormat: (val: number) => `$${(val/1000).toFixed(0)}k`, xDomain: ['dataMin - 10000', 'dataMax + 10000'], xReversed: false,
    yKey: 'composite', yName: 'Composite Score', yFormat: (val: number) => val.toFixed(1), yDomain: [0, 10],
  },
  rank_vs_biglaw: {
    xKey: 'rank', xName: 'US News Rank', xFormat: (val: number) => `#${val}`, xDomain: ['dataMax + 10', 'dataMin - 10'], xReversed: true,
    yKey: 'biglaw', yName: 'BigLaw %', yFormat: (val: number) => `${val}%`, yDomain: [0, 'dataMax + 5'],
  },
  lsat_vs_cost: {
    xKey: 'lsat', xName: 'Median LSAT', xFormat: (val: number) => val.toString(), xDomain: ['dataMin - 2', 'dataMax + 2'], xReversed: false,
    yKey: 'totalCOA', yName: 'Total COA', yFormat: (val: number) => `$${(val/1000).toFixed(0)}k`, yDomain: ['dataMin - 10000', 'dataMax + 10000'],
  },
  value_vs_risk: {
    xKey: 'steal', xName: 'Value Score', xFormat: (val: number) => val.toFixed(1), xDomain: [0, 10], xReversed: false,
    yKey: 'riskScore', yName: 'Risk Score', yFormat: (val: number) => val.toFixed(1), yDomain: [0, 10],
  },
  biglaw_vs_cost: {
    xKey: 'biglaw', xName: 'BigLaw %', xFormat: (val: number) => `${val}%`, xDomain: [0, 'dataMax + 5'], xReversed: false,
    yKey: 'totalCOA', yName: 'Total COA', yFormat: (val: number) => `$${(val/1000).toFixed(0)}k`, yDomain: ['dataMin - 10000', 'dataMax + 10000'],
  },
  prestige_vs_value: {
    xKey: 'prestige', xName: 'Outcomes Score', xFormat: (val: number) => val.toFixed(1), xDomain: [0, 10], xReversed: false,
    yKey: 'steal', yName: 'Value Score', yFormat: (val: number) => val.toFixed(1), yDomain: [0, 10],
  }
};

// --- NEW COMPONENTS ---

function DebtPayoffSimulator({ data }: { data: CalculatedSchool[] }) {
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  // Initialize with top 3 schools by composite score
  useEffect(() => {
    if (data.length > 0 && selectedSchools.length === 0) {
      const top3 = [...data].sort((a, b) => b.composite - a.composite).slice(0, 3).map(s => s.name);
      setSelectedSchools(top3);
    }
  }, [data]);

  const toggleSchool = (name: string) => {
    sounds.playClick();
    if (selectedSchools.includes(name)) {
      setSelectedSchools(selectedSchools.filter(s => s !== name));
    } else {
      if (selectedSchools.length < 5) {
        setSelectedSchools([...selectedSchools, name]);
      } else {
        sounds.playWarning(); // Max 5 schools
      }
    }
  };

  // Generate chart data
  const chartData = useMemo(() => {
    const months = 120; // 10 years
    const dataPoints = [];
    
    for (let m = 0; m <= months; m += 12) { // Yearly data points
      const point: any = { year: m / 12 };
      
      selectedSchools.forEach(schoolName => {
        const school = data.find(s => s.name === schoolName);
        if (school) {
          const borrowRate = school.borrowRate || 0.0805;
          const originationFee = school.originationFee || 0.04228;
          let balance = school.expectedTotalCOA / (1 - originationFee);
          const monthlyRate = borrowRate / 12;
          
          // Standard payment to pay off in 10 years
          const standardPayment = balance * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
          const actualPayment = standardPayment + extraPayment;

          // Simulate m months
          for (let i = 0; i < m; i++) {
            if (balance > 0) {
              const interest = balance * monthlyRate;
              balance = balance + interest - actualPayment;
              if (balance < 0) balance = 0;
            }
          }
          point[schoolName] = Math.round(balance);
        }
      });
      dataPoints.push(point);
    }
    return dataPoints;
  }, [data, selectedSchools, extraPayment]);

  const colors = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LineChartIcon className="w-6 h-6 text-indigo-500" />
              Debt Payoff Simulator
            </h3>
            <p className="text-slate-500 text-sm mt-1">See how extra monthly payments accelerate your path to zero debt.</p>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full md:w-auto">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Extra Monthly Payment: {formatCurrency(extraPayment)}
            </label>
            <input 
              type="range" 
              min="0" 
              max="5000" 
              step="100"
              value={extraPayment} 
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[...data].sort((a, b) => b.composite - a.composite).map(school => {
            const isSelected = selectedSchools.includes(school.name);
            return (
              <button
                key={school.name}
                onClick={() => toggleSchool(school.name)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                  isSelected 
                    ? "bg-indigo-100 text-indigo-700 border-indigo-200" 
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                )}
              >
                <SchoolName school={school} />
              </button>
            );
          })}
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="year" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                label={{ value: 'Years After Graduation', position: 'bottom', fill: '#64748b', fontSize: 12, offset: 0 }}
              />
              <YAxis 
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {selectedSchools.map((schoolName, index) => (
                <Line 
                  key={schoolName}
                  type="monotone" 
                  dataKey={schoolName} 
                  stroke={colors[index % colors.length]} 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ScholarshipSimulator({ data }: { data: CalculatedSchool[] }) {
  const conditionalSchools = data.filter(s => s.condType !== 'none');
  const [selectedSchoolName, setSelectedSchoolName] = useState(conditionalSchools[0]?.name || '');
  const selectedSchool = data.find(s => s.name === selectedSchoolName) || conditionalSchools[0];

  const [curveMedian, setCurveMedian] = useState(selectedSchool?.curveMedian || 3.0);
  const [scholCondition, setScholCondition] = useState(selectedSchool?.scholCondition || 2.8);
  const [curveStdDev, setCurveStdDev] = useState(selectedSchool?.curveStdDev || 0.3);

  useEffect(() => {
    if (selectedSchool) {
      setCurveMedian(selectedSchool.curveMedian || 3.0);
      setScholCondition(selectedSchool.scholCondition || 2.8);
      setCurveStdDev(selectedSchool.curveStdDev || 0.3);
    }
  }, [selectedSchoolName]);

  if (!selectedSchool) {
    return <div className="p-8 text-center text-slate-500">No schools with conditional scholarships found.</div>;
  }

  const condRate = normalCDF(scholCondition, curveMedian, curveStdDev);
  const retentionRate = 1 - condRate;

  const expectedTotalCOA = (retentionRate * selectedSchool.upsideCOA) + (condRate * selectedSchool.downsideCOA);
  const expectedDebt = expectedTotalCOA / (1 - (selectedSchool.originationFee || 0.04228));
  const bestDebt = selectedSchool.upsideCOA / (1 - (selectedSchool.originationFee || 0.04228));
  const worstDebt = selectedSchool.downsideCOA / (1 - (selectedSchool.originationFee || 0.04228));

  const chartData = useMemo(() => {
    const d = [];
    const minX = curveMedian - (3 * curveStdDev);
    const maxX = curveMedian + (3 * curveStdDev);
    const step = (maxX - minX) / 100;
    
    for (let x = minX; x <= maxX; x += step) {
      const z = (x - curveMedian) / curveStdDev;
      const y = (1 / (curveStdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      d.push({
        gpa: x.toFixed(2),
        density: y,
        isLost: x < scholCondition
      });
    }
    return d;
  }, [curveMedian, curveStdDev, scholCondition]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Zap className="w-6 h-6 text-amber-500" />
        Scholarship Retention Simulator
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select School</label>
            <select 
              value={selectedSchoolName}
            onChange={e => { sounds.playClick(); setSelectedSchoolName(e.target.value); }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {conditionalSchools.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Class Curve Median GPA</label>
            <input 
              type="range" min="2.0" max="4.0" step="0.05"
              value={curveMedian} onChange={e => { sounds.playTick(); setCurveMedian(parseFloat(e.target.value)); }}
              className="w-full accent-indigo-600"
            />
            <div className="text-right font-mono font-bold text-indigo-600 mt-1">{curveMedian.toFixed(2)}</div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Scholarship Condition GPA</label>
            <input 
              type="range" min="2.0" max="4.0" step="0.05"
              value={scholCondition} onChange={e => { sounds.playTick(); setScholCondition(parseFloat(e.target.value)); }}
              className="w-full accent-rose-600"
            />
            <div className="text-right font-mono font-bold text-rose-600 mt-1">{scholCondition.toFixed(2)}</div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Curve Spread (Std Dev)</label>
            <input 
              type="range" min="0.1" max="0.6" step="0.05"
              value={curveStdDev} onChange={e => { sounds.playTick(); setCurveStdDev(parseFloat(e.target.value)); }}
              className="w-full accent-amber-500"
            />
            <div className="text-right font-mono font-bold text-amber-600 mt-1">{curveStdDev.toFixed(2)}</div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Risk of Loss</div>
              <div className="text-2xl font-black text-rose-600">{(condRate * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Debt</div>
              <div className="text-2xl font-black text-slate-900">{formatCurrency(expectedDebt)}</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Best Case</div>
              <div className="text-2xl font-black text-emerald-700">{formatCurrency(bestDebt)}</div>
            </div>
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Worst Case</div>
              <div className="text-2xl font-black text-rose-700">{formatCurrency(worstDebt)}</div>
            </div>
          </div>

          <div className="h-[300px] w-full mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <defs>
                  <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorKept" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="gpa" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-100 text-sm">
                          <p className="font-bold text-gray-900 mb-1">GPA: {d.gpa}</p>
                          <p className={d.isLost ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                            {d.isLost ? "Scholarship Lost" : "Scholarship Kept"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="density" 
                  stroke="none" 
                  fill="url(#colorLost)" 
                  activeDot={false}
                  connectNulls
                  data={chartData.map(d => ({ ...d, density: d.isLost ? d.density : null }))}
                />
                <Area 
                  type="monotone" 
                  dataKey="density" 
                  stroke="none" 
                  fill="url(#colorKept)" 
                  activeDot={false}
                  connectNulls
                  data={chartData.map(d => ({ ...d, density: !d.isLost ? d.density : null }))}
                />
                <Area 
                  type="monotone" 
                  dataKey="density" 
                  stroke="#64748b" 
                  strokeWidth={2}
                  fill="none" 
                />
                <ReferenceLine x={scholCondition.toFixed(2)} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Cutoff', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function VersusMode({ data, setMainTab }: { data: CalculatedSchool[], setMainTab: (tab: 'dashboard' | 'editor' | 'versus') => void }) {
  const [p1Name, setP1Name] = useState(data[0]?.name || '');
  const [p2Name, setP2Name] = useState(data[1]?.name || '');
  const [isFighting, setIsFighting] = useState(false);

  useEffect(() => {
    setIsFighting(true);
    sounds.playFight();
    const timer = setTimeout(() => {
      setIsFighting(false);
      sounds.playWinner();
    }, 1000);
    return () => clearTimeout(timer);
  }, [p1Name, p2Name]);

  const p1 = data.find(s => s.name === p1Name) || data[0];
  const p2 = data.find(s => s.name === p2Name) || data[1];

  if (data.length < 2) {
    return (
      <div className="bg-slate-900 rounded-3xl p-6 md:p-12 text-center border-2 border-dashed border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-rose-500/10 opacity-50" />
        <div className="relative z-10 max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-slate-700">
            <Swords className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 uppercase tracking-widest">lawschool.fit Arena</h2>
          <p className="text-slate-400 mb-8">You need at least two offers in your list to enter the arena. Add more in the "My Offers" tab.</p>
          <button 
            onClick={() => { sounds.playClick(); setMainTab('editor'); }}
            className="bg-amber-600 text-white px-8 py-3 rounded-none font-black hover:bg-amber-700 transition-all shadow-lg shadow-amber-900/50 uppercase tracking-widest"
          >
            Recruit Offers
          </button>
        </div>
      </div>
    );
  }

  if (!p1 || !p2) return null;

  const winner = p1.composite > p2.composite ? p1 : p2;
  const loser = p1.composite > p2.composite ? p2 : p1;

  const getRoast = () => {
    if (winner.composite - loser.composite > 15) return "FLAWLESS VICTORY. ABSOLUTE SLAUGHTER.";
    if (winner.totalCOA > 250000) return "YOU WIN, BUT ENJOY THE CRUSHING DEBT!";
    if (winner.rank < 14 && loser.rank >= 14) return "T14 ELITISM WINS AGAIN.";
    if (winner.biglaw > 70) return "BIGLAW SELLOUT SECURED.";
    return "A CLOSE MATCH, BUT MATH DOESN'T LIE.";
  };

  const StatCompare = ({ label, val1, val2, invert = false, format = (v: number) => v.toString() }: any) => {
    const isP1Better = invert ? val1 < val2 : val1 > val2;
    const isP2Better = invert ? val2 < val1 : val2 > val1;
    
    const max = Math.max(val1, val2) * 1.1;
    let w1 = (val1 / max) * 100;
    let w2 = (val2 / max) * 100;
    
    if (invert) {
      const min = Math.min(val1, val2) * 0.9;
      w1 = 100 - ((val1 - min) / (max - min) * 100);
      w2 = 100 - ((val2 - min) / (max - min) * 100);
    }

    return (
      <div className="flex flex-col gap-1 mb-6 group">
        <div className="flex justify-between text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest px-1 sm:px-2">
          <span className={cn("transition-colors", isP1Better ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]" : "")}>{format(val1)}</span>
          <span className="group-hover:text-white transition-colors text-center px-1">{label}</span>
          <span className={cn("transition-colors", isP2Better ? "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]" : "")}>{format(val2)}</span>
        </div>
        <div className="flex h-6 bg-slate-950 rounded-sm overflow-hidden relative border-2 border-slate-800 shadow-inner">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-500/50 z-10 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
          <div className="flex-1 flex justify-end">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${w1}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className={cn("h-full", isP1Better ? "bg-gradient-to-l from-indigo-400 to-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-slate-700")} 
            />
          </div>
          <div className="flex-1 flex justify-start">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${w2}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className={cn("h-full", isP2Better ? "bg-gradient-to-r from-rose-400 to-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.5)]" : "bg-slate-700")} 
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-slate-800 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMGYxNzJhIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxZTI5M2IiPjwvcmVjdD4KPC9zdmc+')] opacity-50 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-900/30 via-transparent to-rose-900/30 pointer-events-none" />
      
      {/* FIGHT Overlay */}
      <AnimatePresence>
        {isFighting && (
          <motion.div 
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm"
          >
            <div className="text-9xl font-black italic text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,1)] uppercase tracking-tighter" style={{ WebkitTextStroke: '4px white' }}>
              FIGHT!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-8 md:mb-12 relative z-10">
        <motion.h2 
          animate={isFighting ? { scale: [1, 1.1, 1], rotate: [0, -2, 2, 0] } : {}}
          transition={{ duration: 0.3, repeat: isFighting ? Infinity : 0 }}
          className="text-4xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
          style={{ WebkitTextStroke: '2px #78350f' }}
        >
          MORTAL KOMBAT
        </motion.h2>
        <p className="text-slate-400 mt-2 font-bold tracking-widest uppercase text-xs md:text-sm">Choose Your Destiny</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
        {/* Player 1 */}
        <motion.div 
          animate={isFighting ? { x: [-5, 5, -5] } : {}}
          transition={{ duration: 0.1, repeat: isFighting ? Infinity : 0 }}
          className="flex-1 w-full bg-slate-800/80 p-6 rounded-none border-l-8 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
        >
          <div className="text-xs font-black text-indigo-400 mb-2 uppercase tracking-widest">Player 1</div>
          <select 
            value={p1Name} 
            onChange={e => { sounds.playHit(); setP1Name(e.target.value); }}
            className="w-full bg-slate-950 border-2 border-indigo-500/50 text-white p-3 rounded-none mb-6 font-black text-xl focus:ring-4 focus:ring-indigo-500/50 outline-none uppercase appearance-none cursor-pointer hover:bg-slate-900 transition-colors"
          >
            {data.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
          <div className="text-center mb-2">
            <motion.div 
              key={p1.composite}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl md:text-7xl font-black text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]"
            >
              {formatDecimal(p1.composite)}
            </motion.div>
            <div className="text-sm text-indigo-200 uppercase tracking-widest font-bold mt-2">Power Level</div>
          </div>
        </motion.div>

        {/* VS Badge */}
        <div className="shrink-0 flex flex-col items-center justify-center relative z-20">
          <motion.div 
            animate={isFighting ? { scale: [1, 1.5, 1], rotate: [0, 180, 360] } : {}}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center border-4 border-white shadow-[0_0_50px_rgba(245,158,11,0.8)]"
          >
            <span className="text-2xl md:text-4xl font-black italic text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">VS</span>
          </motion.div>
        </div>

        {/* Player 2 */}
        <motion.div 
          animate={isFighting ? { x: [5, -5, 5] } : {}}
          transition={{ duration: 0.1, repeat: isFighting ? Infinity : 0 }}
          className="flex-1 w-full bg-slate-800/80 p-6 rounded-none border-r-8 border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.2)]"
        >
          <div className="text-xs font-black text-rose-400 mb-2 uppercase tracking-widest text-right">Player 2</div>
          <select 
            value={p2Name} 
            onChange={e => { sounds.playHit(); setP2Name(e.target.value); }}
            className="w-full bg-slate-950 border-2 border-rose-500/50 text-white p-3 rounded-none mb-6 font-black text-xl focus:ring-4 focus:ring-rose-500/50 outline-none uppercase appearance-none cursor-pointer hover:bg-slate-900 transition-colors text-right"
            dir="rtl"
          >
            {data.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
          <div className="text-center mb-2">
            <motion.div 
              key={p2.composite}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl md:text-7xl font-black text-rose-400 drop-shadow-[0_0_15px_rgba(225,29,72,0.8)]"
            >
              {formatDecimal(p2.composite)}
            </motion.div>
            <div className="text-sm text-rose-200 uppercase tracking-widest font-bold mt-2">Power Level</div>
          </div>
        </motion.div>
      </div>

      {/* Stats Comparison */}
      <div className="mt-12 max-w-3xl mx-auto relative z-10 bg-slate-950/80 p-4 sm:p-8 rounded-none border-2 border-slate-700 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
        <StatCompare label="Financial Ruin (3Yr COA)" val1={p1.totalCOA} val2={p2.totalCOA} invert format={formatCurrency} />
        <StatCompare label="Prestige Level (Rank)" val1={p1.rank} val2={p2.rank} invert format={(v: number) => `#${v}`} />
        <StatCompare label="Sellout Potential (BigLaw %)" val1={p1.biglaw} val2={p2.biglaw} format={(v: number) => `${v}%`} />
        <StatCompare label="Nerd Score (LSAT)" val1={p1.lsat} val2={p2.lsat} />
      </div>

      {/* Winner Announcement */}
      {!isFighting && (
        <motion.div 
          key={winner.name + "winner"}
          initial={{ scale: 0.1, y: 100, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="mt-12 text-center relative z-20"
        >
          <div className="inline-block bg-gradient-to-b from-yellow-300 to-yellow-600 px-6 py-4 md:px-12 md:py-6 rounded-none border-4 border-white shadow-[0_0_60px_rgba(234,179,8,0.6)] transform -skew-x-12">
            <div className="text-3xl md:text-5xl font-black italic text-slate-900 drop-shadow-[0_2px_0_rgba(255,255,255,0.5)] uppercase tracking-tighter">
              {winner.name} WINS
            </div>
            <div className="text-xs md:text-sm font-bold text-red-900 mt-2 tracking-widest uppercase">
              {getRoast()}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function DataEditor({ schools, setSchools }: { schools: SchoolData[], setSchools: React.Dispatch<React.SetStateAction<SchoolData[]>> }) {
  const [expandedSchoolIndex, setExpandedSchoolIndex] = useState<number | null>(null);

  const handleAdd = () => {
    setSchools([{
      name: 'New Law School',
      grossY1: 50000,
      tuitionY1: 50000,
      feesY1: 0,
      scholarship: 0,
      guarantee: false,
      condType: 'none',
      condRate: 0,
      rank: 100,
      lsat: 160,
      biglaw: 10,
      livingCostYearly: 20000,
      region: 'National',
      state: ''
    }, ...schools]);
  };

  const handleAddFromDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    if (!selectedName) return;
    const selectedSchool = initialSchools.find(s => s.name === selectedName);
    if (selectedSchool) {
      sounds.playSuccess();
      setSchools([{ ...selectedSchool }, ...schools]);
    }
    e.target.value = "";
  };

  const handleUpdate = (index: number, field: keyof SchoolData, value: any) => {
    sounds.playTick();
    const newSchools = [...schools];
    newSchools[index] = { ...newSchools[index], [field]: value };
    setSchools(newSchools);
  };

  const handleDelete = (index: number) => {
    const newSchools = [...schools];
    newSchools.splice(index, 1);
    setSchools(newSchools);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Your Offers</h2>
          <p className="text-slate-500 text-sm mt-1">Enter your scholarship and cost details to see which offer provides the best long-term value.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="flex-1 md:flex-none bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={handleAddFromDropdown}
            defaultValue=""
          >
            <option value="" disabled>-- Select an Accepted School --</option>
            {initialSchools.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
          <button 
            onClick={() => { sounds.playSuccess(); handleAdd(); }}
            onMouseEnter={() => sounds.playHover()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Custom Offer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {schools.map((school, i) => {
          const isExpanded = expandedSchoolIndex === i;
          return (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 relative group hover:shadow-md transition-shadow">
            <button 
              onClick={() => { sounds.playWarning(); handleDelete(i); }}
              onMouseEnter={() => sounds.playHover()}
              className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
              title="Delete School"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">School Name</label>
                <input 
                  type="text" 
                  value={school.name} 
                  onChange={e => handleUpdate(i, 'name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">US News Rank</label>
                  <input 
                    type="number" 
                    value={school.rank} 
                    onChange={e => handleUpdate(i, 'rank', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">LSAT Median</label>
                  <input 
                    type="number" 
                    value={school.lsat || 150} 
                    onChange={e => handleUpdate(i, 'lsat', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Region</label>
                  <select 
                    value={school.region || 'National'} 
                    onChange={e => handleUpdate(i, 'region', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="National">National</option>
                    <option value="Northeast">Northeast</option>
                    <option value="South">South</option>
                    <option value="Midwest">Midwest</option>
                    <option value="West">West</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">State (2-Letter)</label>
                  <input 
                    type="text" 
                    maxLength={2}
                    value={school.state || ''} 
                    onChange={e => handleUpdate(i, 'state', e.target.value.toUpperCase())}
                    placeholder="TX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gross Tuition Y1</label>
                  <input 
                    type="number" 
                    value={school.grossY1} 
                    onChange={e => handleUpdate(i, 'grossY1', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Scholarship</label>
                  <input 
                    type="text" 
                    value={school.scholarship} 
                    onChange={e => handleUpdate(i, 'scholarship', isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Est. Rent & Living / Yr</label>
                <input 
                  type="number" 
                  value={school.livingCostYearly || 20000} 
                  onChange={e => handleUpdate(i, 'livingCostYearly', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cond. Type</label>
                  <select 
                    value={school.condType} 
                    onChange={e => { sounds.playClick(); handleUpdate(i, 'condType', e.target.value); }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="none">None</option>
                    <option value="soft">Soft</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Loss Rate (%)</label>
                  <input 
                    type="number" 
                    value={school.condRate * 100} 
                    onChange={e => handleUpdate(i, 'condRate', Number(e.target.value) / 100)}
                    disabled={school.condType === 'none'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  />
                </div>
              </div>
              {school.condType !== 'none' && (
                <div className="text-[10px] text-slate-500 mt-1">
                  {school.condType === 'hard' ? 'Hard condition: entire scholarship is lost if condition is not met.' : 'Soft condition: scholarship is reduced if condition is not met.'}
                </div>
              )}

              {isExpanded && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-4 border-t border-slate-100"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">BigLaw %</label>
                      <input 
                        type="number" 
                        value={school.biglaw} 
                        onChange={e => handleUpdate(i, 'biglaw', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fed Clerk %</label>
                      <input 
                        type="number" 
                        value={school.fc || 0} 
                        onChange={e => handleUpdate(i, 'fc', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bar Pass %</label>
                      <input 
                        type="number" 
                        value={school.barPass || 75} 
                        onChange={e => handleUpdate(i, 'barPass', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Regional Score (1-10)</label>
                      <input 
                        type="number" 
                        value={school.regionalPlacement || 5} 
                        onChange={e => handleUpdate(i, 'regionalPlacement', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Borrow Rate (%)</label>
                      <input 
                        type="number" 
                        value={(school.borrowRate || 0.0805) * 100} 
                        onChange={e => handleUpdate(i, 'borrowRate', Number(e.target.value) / 100)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Origination Fee (%)</label>
                      <input 
                        type="number" 
                        value={(school.originationFee || 0.04228) * 100} 
                        onChange={e => handleUpdate(i, 'originationFee', Number(e.target.value) / 100)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</label>
                    <textarea 
                      value={school.notes || ''} 
                      onChange={e => handleUpdate(i, 'notes', e.target.value)}
                      placeholder="Add any specific notes here..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[60px]"
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={school.attending || false} 
                    onChange={e => { sounds.playClick(); handleUpdate(i, 'attending', e.target.checked); }}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Attending</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={school.withdrawn || false} 
                    onChange={e => { sounds.playWarning(); handleUpdate(i, 'withdrawn', e.target.checked); }}
                    className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-rose-600 transition-colors">Withdrawn</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={school.crossedOff || false} 
                    onChange={e => { sounds.playTick(); handleUpdate(i, 'crossedOff', e.target.checked); }}
                    className="w-4 h-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                  />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Crossed Off</span>
                </label>
              </div>

              <button 
                onClick={() => {
                  sounds.playClick();
                  setExpandedSchoolIndex(isExpanded ? null : i);
                }}
                className="w-full text-center text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors py-2"
              >
                {isExpanded ? 'Hide Advanced Fields' : 'Show Advanced Fields'}
              </button>

            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---

function ExportButton({ data }: { data: CalculatedSchool[] }) {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const isMac = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Mac') !== -1;
  const isPC = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Win') !== -1;
  const canDetect = isMac || isPC;

  const handleExport = () => {
    if (canDetect) {
      sounds.playSuccess();
      if (isMac) {
        downloadToCSV(data);
      } else {
        downloadToExcel(data);
      }
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <div className="relative w-full md:w-auto">
      <button
        onClick={handleExport}
        onMouseEnter={() => sounds.playHover()}
        disabled={data.length === 0}
        className={cn(
          "w-full md:w-auto justify-center px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed",
          !canDetect && "pr-2"
        )}
      >
        <Download className="w-4 h-4" /> 
        Export
        {!canDetect && <ChevronDown className="w-4 h-4 ml-1" />}
      </button>

      {showDropdown && !canDetect && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1">
          <button
            onClick={() => { sounds.playSuccess(); downloadToExcel(data); setShowDropdown(false); }}
            className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            Excel (.xlsx) - PC
          </button>
          <button
            onClick={() => { sounds.playSuccess(); downloadToCSV(data); setShowDropdown(false); }}
            className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            CSV (.csv) - Mac
          </button>
        </div>
      )}
    </div>
  );
}

const ALL_STATES = Array.from(new Set(initialSchools.map(s => s.state).filter(Boolean))).sort() as string[];

function RegionalFitBadge({ score }: { score: number }) {
  if (score < 6) return null;
  
  let label = "Good Fit";
  let color = "bg-blue-50 text-blue-700 border-blue-200";
  
  if (score >= 9) {
    label = "Perfect Fit";
    color = "bg-indigo-100 text-indigo-700 border-indigo-200";
  } else if (score >= 8) {
    label = "Strong Fit";
    color = "bg-blue-100 text-blue-700 border-blue-200";
  }
  
  return (
    <span className={cn("shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", color)}>
      {label}
    </span>
  );
}

function SchoolName({ school }: { school: { name: string; state?: string; regionalFit?: number } }) {
  const isProvisional = school.name.toLowerCase().includes('provisional');
  const displayName = school.name.replace(/\(Provisional\)/i, '').trim();
  
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <span className="truncate" title={displayName}>{displayName}</span>
      {school.state && (
        <span className="shrink-0 bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200">
          {school.state}
        </span>
      )}
      {isProvisional && (
        <span className="shrink-0 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-200">
          Provisional
        </span>
      )}
      {school.regionalFit !== undefined && <RegionalFitBadge score={school.regionalFit} />}
    </div>
  );
}

export default function App() {
  const [rawSchools, setRawSchools] = useState<SchoolData[]>([]);
  const [decisionMode, setDecisionMode] = useState<DecisionMode>('balanced');
  const [targetRegion, setTargetRegion] = useState<Region | 'Any'>('Any');
  const [targetState, setTargetState] = useState<string | 'Any'>('Any');
  const [isDeadset, setIsDeadset] = useState<boolean>(false);
  const data = useMemo(() => calculateData(rawSchools, decisionMode, { targetRegion, targetState, isDeadset }), [rawSchools, decisionMode, targetRegion, targetState, isDeadset]);
  
  const [mainTab, setMainTab] = useState<'dashboard' | 'versus' | 'editor'>('dashboard');
  const [dashTab, setDashTab] = useState<'cost' | 'roi' | 'outcomes' | 'simulator' | 'payoff'>('cost');

  // Sorting state
  const [costSort, setCostSort] = useState<SortConfig<CalculatedSchool>>({ key: 'expectedTotalCOA', direction: 'asc' });
  const [roiSort, setRoiSort] = useState<SortConfig<CalculatedSchool>>({ key: 'composite', direction: 'desc' });
  const [outcomesSort, setOutcomesSort] = useState<SortConfig<CalculatedSchool>>({ key: 'pBigLawMedian', direction: 'desc' });
  const [scatterView, setScatterView] = useState<keyof typeof SCATTER_VIEWS>('cost_vs_outcomes');

  const handleSort = <T extends CalculatedSchool>(
    key: keyof T,
    currentSort: SortConfig<T>,
    setSort: React.Dispatch<React.SetStateAction<SortConfig<T>>>
  ) => {
    sounds.playClick();
    let direction: 'asc' | 'desc' = 'asc';
    if (currentSort && currentSort.key === key && currentSort.direction === 'asc') {
      direction = 'desc';
    }
    setSort({ key, direction });
  };

  const costRanked = useMemo(() => {
    let sortable = [...data];
    if (costSort !== null) {
      sortable.sort((a, b) => {
        if (a[costSort.key] < b[costSort.key]) return costSort.direction === 'asc' ? -1 : 1;
        if (a[costSort.key] > b[costSort.key]) return costSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [data, costSort]);

  const roiRanked = useMemo(() => {
    let sortable = [...data];
    if (roiSort !== null) {
      sortable.sort((a, b) => {
        if (a[roiSort.key] < b[roiSort.key]) return roiSort.direction === 'asc' ? -1 : 1;
        if (a[roiSort.key] > b[roiSort.key]) return roiSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [data, roiSort]);

  const outcomesRanked = useMemo(() => {
    let sortable = [...data];
    if (outcomesSort !== null) {
      sortable.sort((a, b) => {
        if (a[outcomesSort.key] < b[outcomesSort.key]) return outcomesSort.direction === 'asc' ? -1 : 1;
        if (a[outcomesSort.key] > b[outcomesSort.key]) return outcomesSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [data, outcomesSort]);

  const maxCost = data.length > 0 ? Math.max(...data.map((s) => s.expectedTotalCOA)) : 1;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const school = payload[0].payload;
      const currentView = SCATTER_VIEWS[scatterView];
      return (
        <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-100 text-sm">
          <p className="font-bold text-gray-900 mb-1">{school.name}</p>
          <p className="text-gray-600">{currentView.xName}: <span className="font-semibold text-gray-900">{currentView.xFormat(school[currentView.xKey])}</span></p>
          <p className="text-gray-600">{currentView.yName}: <span className="font-semibold text-gray-900">{currentView.yFormat(school[currentView.yKey])}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Main Header & Navigation */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Globe className="w-8 h-8 text-indigo-600" />
              lawschool.fit
            </h1>
            <p className="text-slate-500 mt-2 text-lg">The final step in your journey: Compare your actual offers, calculate true costs, and find your best fit.</p>
          </div>
          
          <div className="flex flex-wrap bg-slate-200/50 p-1.5 rounded-xl self-start md:self-auto gap-1 w-full md:w-auto">
            <button
              onClick={() => { sounds.playClick(); setMainTab('dashboard'); }}
              onMouseEnter={() => sounds.playHover()}
              className={cn("flex-1 md:flex-none justify-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1 sm:gap-2", mainTab === 'dashboard' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50")}
            >
              <TrendingUp className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span><span className="sm:hidden">Dash</span>
            </button>
            <button
              onClick={() => { sounds.playClick(); setMainTab('versus'); }}
              onMouseEnter={() => sounds.playHover()}
              className={cn("flex-1 md:flex-none justify-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1 sm:gap-2", mainTab === 'versus' ? "bg-white text-rose-600 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50")}
            >
              <Swords className="w-4 h-4" /> Versus
            </button>
            <button
              onClick={() => { sounds.playClick(); setMainTab('editor'); }}
              onMouseEnter={() => sounds.playHover()}
              className={cn("flex-1 md:flex-none justify-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1 sm:gap-2", mainTab === 'editor' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50")}
            >
              <Settings className="w-4 h-4" /> <span className="hidden sm:inline">My Offers</span><span className="sm:hidden">Offers</span>
            </button>
            <div className="w-full md:w-auto mt-1 md:mt-0">
              <ExportButton data={data} />
            </div>
          </div>
        </header>

        {mainTab === 'versus' && <VersusMode data={data} setMainTab={setMainTab} />}
        {mainTab === 'editor' && <DataEditor schools={rawSchools} setSchools={setRawSchools} />}

        {mainTab === 'dashboard' && (
          <div className="space-y-8">
            {data.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 md:p-12 text-center border-2 border-dashed border-slate-200 shadow-sm">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Plus className="w-10 h-10 text-indigo-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Got your offers? Let's compare them.</h2>
                  <p className="text-slate-500 mb-8">Add the law schools that accepted you to see a side-by-side ROI analysis, true cost breakdowns, and debt simulations.</p>
                  <button 
                    onClick={() => { sounds.playClick(); setMainTab('editor'); }}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Go to My Offers
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Sub-Tabs for Dashboard */}
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner flex-wrap gap-1">
              {(['cost', 'roi', 'outcomes', 'simulator', 'payoff'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { sounds.playClick(); setDashTab(tab); }}
                  onMouseEnter={() => sounds.playHover()}
                  className={cn(
                    "relative flex-1 sm:flex-none justify-center px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors outline-none",
                    dashTab === tab ? "text-indigo-700" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {dashTab === tab && (
                    <motion.div
                      layoutId="active-dash-tab"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/50"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab === 'cost' && <DollarSign className="w-4 h-4" />}
                    {tab === 'roi' && <TrendingUp className="w-4 h-4" />}
                    {tab === 'outcomes' && <Briefcase className="w-4 h-4" />}
                    {tab === 'simulator' && <Zap className="w-4 h-4" />}
                    {tab === 'payoff' && <LineChartIcon className="w-4 h-4" />}
                    {tab === 'cost' ? 'Cost Breakdown' : tab === 'roi' ? 'ROI & Value' : tab === 'outcomes' ? 'Outcomes & Debt' : tab === 'simulator' ? 'Schol. Simulator' : 'Debt Payoff'}
                  </span>
                </button>
              ))}
            </div>

            {dashTab === 'roi' && (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200/60">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                  Decision Mode:
                </div>
                <div className="flex gap-2">
                  {(['balanced', 'maximizeUpside', 'minimizeRisk'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { sounds.playClick(); setDecisionMode(mode); }}
                      onMouseEnter={() => sounds.playHover()}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-bold transition-all border",
                        decisionMode === mode 
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm" 
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {mode === 'balanced' ? 'Balanced' : mode === 'maximizeUpside' ? 'Maximize Upside' : 'Minimize Risk'}
                    </button>
                  ))}
                </div>

                <div className="h-8 w-px bg-slate-200 hidden md:block mx-2" />

                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Globe className="w-5 h-5 text-emerald-500" />
                  Target Region:
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={targetRegion}
                    onChange={(e) => { sounds.playClick(); setTargetRegion(e.target.value as any); }}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Any">Any Region</option>
                    <option value="Northeast">Northeast</option>
                    <option value="South">South</option>
                    <option value="Midwest">Midwest</option>
                    <option value="West">West</option>
                  </select>
                </div>

                <div className="h-8 w-px bg-slate-200 hidden md:block mx-2" />

                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  Target State:
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={targetState}
                    onChange={(e) => { sounds.playClick(); setTargetState(e.target.value); }}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Any">Any State</option>
                    {ALL_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>

                {(targetRegion !== 'Any' || targetState !== 'Any') && (
                  <label className="flex items-center gap-2 cursor-pointer ml-2 group">
                    <div 
                      className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-all",
                        isDeadset ? "bg-emerald-500 border-emerald-600" : "bg-white border-slate-300 group-hover:border-emerald-400"
                      )}
                      onClick={() => { sounds.playSuccess(); setIsDeadset(!isDeadset); }}
                    >
                      {isDeadset && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-xs font-bold text-slate-600">Deadset on this?</span>
                  </label>
                )}
              </div>
            )}

            <AnimatePresence mode="wait">
              {dashTab === 'cost' && (
                <motion.div
                  key="cost"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Cost Metric Cards */}
                  {costRanked.length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {[
                        { label: "Lowest Expected COA", value: formatCurrency(costRanked[0].expectedTotalCOA), sub: costRanked[0].name, color: "text-emerald-600" },
                        { label: "Median Expected COA", value: formatCurrency(costRanked[Math.floor(costRanked.length / 2)].expectedTotalCOA), sub: "Across all offers", color: "text-slate-900" },
                        { label: "Highest Expected COA", value: formatCurrency(costRanked[costRanked.length - 1].expectedTotalCOA), sub: costRanked[costRanked.length - 1].name, color: "text-rose-600" },
                        { label: "Tuition Escalation", value: "3% / yr", sub: "Applied to non-guaranteed", color: "text-slate-900" },
                      ].map((stat, i) => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          key={stat.label}
                          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow"
                        >
                          <div className="text-sm font-medium text-slate-500 mb-2">{stat.label}</div>
                          <div className={cn("text-3xl font-bold tracking-tight", stat.color)}>{stat.value}</div>
                          <div className="text-sm text-slate-500 mt-2 truncate">{stat.sub}</div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Cost Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs uppercase bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                          <tr>
                            <th className="px-6 py-4">#</th>
                            <th className="px-6 py-4 cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('name', costSort, setCostSort)}>
                              <div className="flex items-center gap-1">School <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4">Scholarship Details</th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('expectedTotalCOA', costSort, setCostSort)}>
                              <div className="flex items-center justify-end gap-1">Expected COA <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('upsideCOA', costSort, setCostSort)}>
                              <div className="flex items-center justify-end gap-1">Upside (Best) <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('downsideCOA', costSort, setCostSort)}>
                              <div className="flex items-center justify-end gap-1">Downside (Worst) <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('monthlyPayment', costSort, setCostSort)}>
                              <div className="flex items-center justify-end gap-1">Monthly Debt <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {costRanked.map((school, i) => {
                            const rank = i + 1;
                            const rankBadge = getRankBadge(rank);
                            
                            return (
                              <motion.tr
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                key={school.name}
                                className={cn(
                                  "transition-colors hover:bg-slate-50/80",
                                  school.condType === 'hard' && "bg-rose-50/30 hover:bg-rose-50/60",
                                  school.condType === 'soft' && "bg-indigo-50/30 hover:bg-indigo-50/60"
                                )}
                              >
                                <td className="px-6 py-4">
                                  <span
                                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-sm"
                                    style={{ backgroundColor: rankBadge.bg, color: rankBadge.text }}
                                  >
                                    {rank}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                  <div className="flex items-center gap-2">
                                    <SchoolName school={school} />
                                    {school.crossedOff && <XCircle className="w-4 h-4 text-slate-400" />}
                                    {school.attending && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-2 items-center">
                                    <span className="font-medium text-slate-700">
                                      {typeof school.scholarship === 'number' ? formatCurrency(school.scholarship) : school.scholarship}
                                    </span>
                                    {school.condType === 'hard' && (
                                      <span className="px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                        Hard Cond. ({(school.condRate * 100).toFixed(1)}% cut)
                                      </span>
                                    )}
                                    {school.condType === 'soft' && (
                                      <span className="px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                        Soft Cond.
                                      </span>
                                    )}
                                    {school.guarantee && (
                                      <span className="px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                        Tuition Locked
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                                  {formatCurrency(school.expectedTotalCOA)}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-emerald-600">{formatCurrency(school.upsideCOA)}</td>
                                <td className="px-6 py-4 text-right font-mono text-rose-600">{formatCurrency(school.downsideCOA)}</td>
                                <td className="px-6 py-4 text-right font-mono text-slate-600">{formatCurrency(school.monthlyPayment)}/mo</td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Cost Bars */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-slate-400" />
                      Expected 3-Year COA Comparison
                    </h3>
                    <div className="space-y-4">
                      {costRanked.map((school, i) => {
                        const width = `${Math.max(1, (school.expectedTotalCOA / maxCost) * 100)}%`;
                        const barColor = getCostBarColor(school.expectedTotalCOA, school.condType);
                        return (
                          <div key={school.name} className="flex items-center text-sm group">
                            <div className="w-48 pr-4 text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                              <SchoolName school={school} />
                            </div>
                            <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width }}
                                transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                                className="h-full relative"
                                style={{ backgroundColor: barColor }}
                              >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </motion.div>
                              <div className="absolute inset-y-0 left-3 flex items-center font-mono font-bold text-slate-900 mix-blend-luminosity">
                                {formatCurrency(school.expectedTotalCOA)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {dashTab === 'roi' && (
                <motion.div
                  key="roi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* ROI Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { label: "Outcomes", weight: "35%", desc: "BigLaw %, Rank, LSAT", icon: Award, color: "text-indigo-600" },
                      { label: "Cost Score", weight: "25%", desc: "Inverse of total cost", icon: DollarSign, color: "text-emerald-600" },
                      { label: "Regional Fit", weight: "Boost", desc: "Based on target state", icon: MapPin, color: "text-blue-600" },
                      { label: "Risk & Stability", weight: "15%", desc: "Penalty for conditionals", icon: ShieldAlert, color: "text-rose-600" },
                    ].map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          key={stat.label}
                          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            <Icon className="w-4 h-4" /> {stat.label}
                          </div>
                          <div className={cn("text-3xl font-extrabold", stat.color)}>{stat.weight}</div>
                          <div className="text-xs text-slate-500 mt-2 font-medium">{stat.desc}</div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Scatter Plot */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 h-[450px] flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-400" />
                        Interactive Value Matrix
                      </h3>
                      <select
                        value={scatterView}
                        onChange={(e) => { sounds.playClick(); setScatterView(e.target.value as keyof typeof SCATTER_VIEWS); }}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none cursor-pointer w-full sm:w-auto"
                      >
                        <option value="cost_vs_outcomes">Total COA vs. Outcomes</option>
                        <option value="cost_vs_composite">Total COA vs. Composite Score</option>
                        <option value="rank_vs_biglaw">US News Rank vs. BigLaw %</option>
                        <option value="lsat_vs_cost">Median LSAT vs. Total COA</option>
                        <option value="value_vs_risk">Value Score vs. Risk Score</option>
                        <option value="biglaw_vs_cost">BigLaw % vs. Total COA</option>
                        <option value="prestige_vs_value">Outcomes Score vs. Value Score</option>
                      </select>
                    </div>
                    <div className="flex-1 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            type="number" 
                            dataKey={SCATTER_VIEWS[scatterView].xKey} 
                            name={SCATTER_VIEWS[scatterView].xName} 
                            tickFormatter={SCATTER_VIEWS[scatterView].xFormat}
                            domain={SCATTER_VIEWS[scatterView].xDomain as any}
                            reversed={SCATTER_VIEWS[scatterView].xReversed}
                            stroke="#64748b"
                          />
                          <YAxis 
                            type="number" 
                            dataKey={SCATTER_VIEWS[scatterView].yKey} 
                            name={SCATTER_VIEWS[scatterView].yName} 
                            tickFormatter={SCATTER_VIEWS[scatterView].yFormat}
                            domain={SCATTER_VIEWS[scatterView].yDomain as any}
                            stroke="#64748b"
                          />
                          <ZAxis type="number" range={[100, 100]} />
                          <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter data={data} name="Schools">
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getScoreBg(entry.composite)} />
                            ))}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ROI Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs uppercase bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                          <tr>
                            <th className="px-6 py-4">#</th>
                            <th className="px-6 py-4 cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('name', roiSort, setRoiSort)}>
                              <div className="flex items-center gap-1">School <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4 text-center cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('prestige', roiSort, setRoiSort)}>
                              <div className="flex items-center justify-center gap-1">Outcomes <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4 text-center cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('costEff', roiSort, setRoiSort)}>
                              <div className="flex items-center justify-center gap-1">Cost Score <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4 text-center cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('steal', roiSort, setRoiSort)}>
                              <div className="flex items-center justify-center gap-1">Value <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4 text-center cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('riskScore', roiSort, setRoiSort)}>
                              <div className="flex items-center justify-center gap-1">Risk <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4 text-center cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('floorScore', roiSort, setRoiSort)}>
                              <div className="flex items-center justify-center gap-1">Floor <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4 text-center cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('ceilingScore', roiSort, setRoiSort)}>
                              <div className="flex items-center justify-center gap-1">Ceiling <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4 text-center cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('regionalFit', roiSort, setRoiSort)}>
                              <div className="flex items-center justify-center gap-1">Regional Fit <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:text-slate-800 transition-colors" onMouseEnter={() => sounds.playHover()} onClick={() => handleSort('composite', roiSort, setRoiSort)}>
                              <div className="flex items-center justify-end gap-1">Composite <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {roiRanked.map((school, i) => {
                            const rank = i + 1;
                            const rankBadge = getRankBadge(rank);
                            const isConditional = school.condType !== 'none';
                            
                            return (
                              <motion.tr
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                key={school.name}
                                className="hover:bg-slate-50/80 transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <span
                                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-sm"
                                    style={{ backgroundColor: rankBadge.bg, color: rankBadge.text }}
                                  >
                                    {rank}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                  <div className="flex items-center gap-2">
                                    <SchoolName school={school} />
                                    {school.crossedOff && <XCircle className="w-4 h-4 text-slate-400" />}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center"><ScorePill score={school.prestige} /></td>
                                <td className="px-6 py-4 text-center"><ScorePill score={school.costEff} /></td>
                                <td className="px-6 py-4 text-center"><ScorePill score={school.steal} /></td>
                                <td className="px-6 py-4 text-center"><ScorePill score={school.floorScore} /></td>
                                <td className="px-6 py-4 text-center"><ScorePill score={school.ceilingScore} /></td>
                                <td className="px-6 py-4 text-center"><ScorePill score={school.regionalFit} /></td>
                                <td className="px-6 py-4 text-center">
                                  <ScorePill score={school.riskScore} />
                                  {isConditional && (
                                    <div className="text-[10px] font-medium text-slate-500 mt-1.5 uppercase tracking-wider">
                                      {school.condType === 'hard' ? 'Hard Cond.' : 'Soft Cond.'}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span
                                    className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-extrabold shadow-sm"
                                    style={{ backgroundColor: getScoreBg(school.composite), color: '#fff' }}
                                  >
                                    {formatDecimal(school.composite)} / 10
                                  </span>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ROI Bars */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Award className="w-5 h-5 text-slate-400" />
                      ROI Composite Scores
                    </h3>
                    <div className="space-y-4">
                      {roiRanked.map((school, i) => {
                        const width = `${(school.composite / 10) * 100}%`;
                        const barColor = getScoreBg(school.composite);
                        return (
                          <div key={school.name} className="flex items-center text-sm group">
                            <div className="w-48 pr-4 text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                              <SchoolName school={school} />
                            </div>
                            <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width }}
                                transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                                className="h-full relative"
                                style={{ backgroundColor: barColor }}
                              >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </motion.div>
                              <div className="absolute inset-y-0 left-3 flex items-center font-mono font-bold text-white drop-shadow-md">
                                {formatDecimal(school.composite)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
              {dashTab === 'outcomes' && (
                <motion.div
                  key="outcomes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="p-6 border-b border-slate-200/60">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-500" />
                        Bimodal Outcome Distribution & Debt Service
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Law school outcomes are bimodal. This models your probability of landing a BigLaw/FC role based on your class rank, and your monthly debt burden.
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs uppercase bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                          <tr>
                            <th className="px-6 py-4">School</th>
                            <th className="px-6 py-4 text-center">P(BigLaw | Top 10%)</th>
                            <th className="px-6 py-4 text-center">P(BigLaw | Median)</th>
                            <th className="px-6 py-4 text-center">P(BigLaw | Bottom 50%)</th>
                            <th className="px-6 py-4 text-center">Distribution Curve</th>
                            <th className="px-6 py-4 text-right">Expected Debt</th>
                            <th className="px-6 py-4 text-right">Monthly Payment (10y)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {outcomesRanked.map((school, i) => (
                            <motion.tr
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              key={school.name}
                              className="hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="px-6 py-4 font-semibold text-slate-900">
                                <SchoolName school={school} />
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-emerald-600 font-bold">{school.pBigLawTop10.toFixed(1)}%</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-amber-600 font-bold">{school.pBigLawMedian.toFixed(1)}%</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-rose-600 font-bold">{school.pBigLawBottom50.toFixed(1)}%</span>
                              </td>
                              <td className="px-6 py-4 w-32">
                                <div className="h-8 w-full bg-slate-100 rounded overflow-hidden flex items-end border border-slate-200">
                                  <div className="bg-emerald-500 hover:bg-emerald-400 transition-colors" style={{ width: '10%', height: `${school.pBigLawTop10}%` }} title={`Top 10%: ${school.pBigLawTop10.toFixed(1)}% chance`} />
                                  <div className="bg-amber-500 hover:bg-amber-400 transition-colors" style={{ width: '40%', height: `${school.pBigLawMedian}%` }} title={`Median: ${school.pBigLawMedian.toFixed(1)}% chance`} />
                                  <div className="bg-rose-500 hover:bg-rose-400 transition-colors" style={{ width: '50%', height: `${school.pBigLawBottom50}%` }} title={`Bottom 50%: ${school.pBigLawBottom50.toFixed(1)}% chance`} />
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right font-mono text-slate-600">
                                {formatCurrency(school.expectedTotalCOA / (1 - (school.originationFee || 0.04228)))}
                              </td>
                              <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                                {formatCurrency(school.monthlyPayment)}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
              {dashTab === 'simulator' && (
                <motion.div
                  key="simulator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ScholarshipSimulator data={data} />
                </motion.div>
              )}
              {dashTab === 'payoff' && (
                <motion.div
                  key="payoff"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <DebtPayoffSimulator data={data} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

            {/* Footer Notes */}
            <div className="bg-slate-100/50 border border-slate-200/60 p-5 rounded-xl flex gap-3 text-sm text-slate-500 leading-relaxed mt-8">
              <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-700">Methodology & Notes:</strong> 
                <br />
                <span className="mt-1 block">
                  <strong>Expected Cost:</strong> Uses Monte Carlo-style expected value based on conditional scholarship retention rates.
                  <br />
                  <strong>Floor Score:</strong> Measures downside protection. Heavily weights downside cost, unconditional scholarships, bar pass rate, and regional placement.
                  <br />
                  <strong>Ceiling Score:</strong> Measures upside potential. Heavily weights upside cost, BigLaw %, FC %, and rank.
                  {dashTab === 'roi' && (
                    <>
                      <br />
                      <strong>Decision Modes:</strong> Dynamically reweights the composite score based on your risk tolerance (Balanced, Maximize Upside, Minimize Risk).
                    </>
                  )}
                </span>
              </div>
            </div>
            
            <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs font-bold uppercase tracking-widest space-y-4">
              <a 
                href="https://github.com/randomsoftwareguy1/Lawschool.fit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-indigo-600 transition-colors"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
              <p>&copy; {new Date().getFullYear()} lawschool.fit &bull; All Rights Reserved</p>
            </footer>
          </div>
        )}
        <Analytics />
      </div>
    </div>
  );
}
