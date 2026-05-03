import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import socket from '../socket';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
  RiBarChartLine, RiCheckboxCircleLine, RiCloseCircleLine,
  RiTimeLine, RiAlertLine, RiFileCopyLine, RiRefreshLine,
  RiShieldLine, RiTeamLine, RiUserStarLine, RiPulseLine
} from 'react-icons/ri';

const STATUS_COLORS = ['#10b981', '#f43f5e', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 text-xs shadow-2xl backdrop-blur-md">
        <p className="text-slate-200 font-black mb-2 uppercase tracking-widest">{label}</p>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <p className="text-slate-400 font-medium">
              {p.name}: <span className="text-white font-black">{p.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/moderation/analytics');
      setData(res.data);
    } catch {
      toast.error('Failed to load system intelligence.');
    } finally {
      setLoading(false);
    }
  };

  const [threatLogs, setThreatLogs] = useState([
    { type: 'system', message: 'ReviewGuard AI Intelligence Engine initialized.', timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) },
    { type: 'system', message: 'Socket connection established. Awaiting telemetry...', timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) }
  ]);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleThreatLog = (log) => {
      setThreatLogs(prev => [log, ...prev].slice(0, 50));
    };

    socket.on('system:threat-log', handleThreatLog);
    return () => socket.off('system:threat-log', handleThreatLog);
  }, []);

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { stats, charts, personal, staffPerformance } = data || {};
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-10 flex-wrap gap-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-4">
            {isAdmin ? <RiShieldLine className="text-brand-500" /> : <RiUserStarLine className="text-amber-500" />}
            <span className="gradient-text">
              {isAdmin ? 'System Intelligence Hub' : 'My Performance Portal'}
            </span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            {isAdmin 
              ? 'Real-time telemetry and staff performance oversight' 
              : 'Statistical overview of your individual moderation impact'}
          </p>
        </div>
        <button 
          onClick={fetchAnalytics} 
          className="flex items-center gap-2 px-6 py-3 bg-surface-800 border border-surface-700 rounded-2xl text-slate-300 font-black text-xs uppercase tracking-widest hover:text-white hover:border-brand-500 transition-all shadow-xl active:scale-95"
        >
          <RiRefreshLine className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {isAdmin ? (
        <AdminView stats={stats} charts={charts} staffPerformance={staffPerformance} threatLogs={threatLogs} />
      ) : (
        <ModeratorView stats={stats} charts={charts} personal={personal} />
      )}
    </div>
  );
}

function AdminView({ stats, charts, staffPerformance, threatLogs }) {
  return (
    <div className="space-y-8">
      {/* Global Performance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Global Decisions', value: stats.total, color: 'text-brand-400', bg: 'bg-brand-500/10', icon: RiPulseLine },
          { label: 'Approval Rate', value: `${stats.approvalRate}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: RiCheckboxCircleLine },
          { label: 'Pending Load', value: stats.pending, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: RiTimeLine },
          { label: 'Avg Toxicity', value: stats.avgToxicity, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: RiAlertLine },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-800 border border-surface-700 p-6 rounded-3xl relative overflow-hidden group">
            <stat.icon className="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] group-hover:scale-110 transition-transform" />
            <p className={`text-3xl font-black ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Team Performance Table */}
        <div className="lg:col-span-2 bg-surface-800 border border-surface-700 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <RiTeamLine className="text-brand-500" />
              Staff Benchmarking
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-1 bg-surface-900 rounded-full border border-surface-700">Top 10 Nodes</span>
          </div>
          
          <div className="space-y-6">
            {staffPerformance?.map((staff, i) => (
              <div key={staff.name} className="flex items-center gap-6 group">
                <span className="text-sm font-black text-slate-600 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <p className="font-black text-white text-sm">{staff.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {staff.totalActions} Decisions <span className="text-slate-600 mx-1">/</span> 
                      <span className="text-emerald-400">{staff.approvals} Approvals</span> 
                      <span className="text-rose-400 ml-2">{staff.rejections} Rejections</span>
                    </p>
                  </div>
                  <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 transition-all duration-1000"
                      style={{ width: `${(staff.totalActions / (staffPerformance[0]?.totalActions || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!staffPerformance || staffPerformance.length === 0) && (
              <p className="text-center py-10 text-slate-500 font-bold uppercase tracking-widest text-xs italic">No comparative data acquired.</p>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-surface-800 border border-surface-700 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-black text-white mb-8">System Balance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={charts?.reviewsByStatus || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
              >
                {charts?.reviewsByStatus?.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-4">
            {charts?.reviewsByStatus?.map((s, i) => (
              <div key={s.name} className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.name}</p>
                <div className="w-8 h-1 rounded-full mx-auto" style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live AI Threat Feed */}
      <div className="bg-surface-900 border border-surface-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden mt-8">
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <RiPulseLine className="text-rose-500 animate-pulse" />
            Live AI Threat Feed
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">System Armed</span>
          </div>
        </div>

        {/* Simplified Live Feed List */}
        <div className="relative z-10 h-72 overflow-y-auto custom-scrollbar flex flex-col-reverse">
          <div className="space-y-4 pr-4">
            {threatLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-6 group/log animate-fade-in relative">
                {/* Time & Vertical Connector */}
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <span className="text-[10px] font-black text-slate-500 tabular-nums">
                    {log.timestamp.split(':').slice(0, 2).join(':')}
                  </span>
                  <div className="w-px h-full bg-surface-700 absolute top-6 bottom-[-16px]"></div>
                </div>

                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {log.type === 'scanning' && <span className="text-[9px] font-black text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded uppercase tracking-widest">Scanning</span>}
                    {log.type === 'flagged' && <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest">Threat Detected</span>}
                    {log.type === 'cleared' && <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest">Verified Clear</span>}
                    {log.type === 'duplicate' && <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest">Duplicate</span>}
                    {log.type === 'system' && <span className="text-[9px] font-black text-brand-500 bg-brand-500/10 border border-brand-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest">System</span>}
                  </div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed group-hover/log:text-white transition-colors">
                    {log.message}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Live Indicator */}
            <div className="flex items-start gap-6 relative">
              <div className="flex flex-col items-center shrink-0 pt-1">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
              </div>
              <div className="pb-4">
                <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] animate-pulse">Awaiting Signal...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
}

function ModeratorView({ stats, charts, personal }) {
  return (
    <div className="space-y-8">
      {/* Moderator Personal Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'My Decisions', value: personal.totalHandled, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: RiCheckboxCircleLine },
          { label: 'Team Impact', value: `${personal.impact}%`, color: 'text-brand-400', bg: 'bg-brand-500/10', icon: RiBarChartLine },
          { label: 'My Approvals', value: personal.approved, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: RiCheckLine },
          { label: 'My Rejections', value: personal.rejected, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: RiCloseCircleLine },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-800 border border-surface-700 p-6 rounded-3xl relative overflow-hidden group">
            <stat.icon className="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] group-hover:scale-110 transition-transform" />
            <p className={`text-4xl font-black ${stat.color} mb-1 tracking-tighter`}>{stat.value}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Daily Throughput */}
        <div className="bg-surface-800 border border-surface-700 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <RiBarChartLine className="text-cyan-500" />
              Submission Influx
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-1 bg-surface-900 rounded-full border border-surface-700">Last 7 Cycles</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={(charts?.reviewsPerDay || []).map(d => ({
              date: new Date(d._id + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              count: d.count
            }))}>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34,211,238,0.05)' }} />
              <Bar dataKey="count" name="Reviews" fill="url(#colorMod)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorMod" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hot Content Monitoring */}
        <div className="bg-surface-800 border border-surface-700 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-black text-white mb-2">Targeted Subjects</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8">High Priority Products</p>
          
          <div className="space-y-6">
            {charts?.topProducts?.map((p, i) => (
              <div key={p.name}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-black text-white whitespace-nowrap overflow-hidden text-ellipsis mr-4">
                    <span className="text-slate-600 mr-2">0{i+1}</span>
                    {p.name}
                  </p>
                  <p className="text-[10px] font-black text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">{p.count} ENTRIES</p>
                </div>
                <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${(p.count / (charts.topProducts[0]?.count || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const RiCheckLine = ({className}) => < RiCheckboxCircleLine className={className} />;
