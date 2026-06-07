import { LayoutDashboard, Target, Activity, Settings, HelpCircle } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview' },
    { icon: Target, label: 'AI Coach' },
    { icon: Activity, label: 'Analytics' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-slate-950 h-screen fixed left-0 top-0 flex flex-col justify-between p-6 border-r border-slate-900 z-30">
      <div>
        <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-900 mb-8">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-md">
            Ω
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            CP Mentor
          </span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all cursor-pointer group ${
                index === 0 
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/10' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${index === 0 ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-900 pt-4 flex items-center gap-3 text-slate-400 hover:text-white cursor-pointer text-sm font-medium px-2 mb-2 transition-colors">
        <HelpCircle className="w-5 h-5 text-slate-400" />
        <span>Documentation</span>
      </div>
    </aside>
  );
}