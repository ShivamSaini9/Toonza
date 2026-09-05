const StatCard = ({ icon: Icon, label, value, hint }) => (
  <div className="rounded-2xl border border-amber-500/15 bg-white/[0.03] p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-slate-400">{label}</span>
      {Icon && <Icon className="w-4 h-4 text-amber-400" />}
    </div>
    <div className="text-2xl font-semibold text-white">{value}</div>
    {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
  </div>
);

export default StatCard;
