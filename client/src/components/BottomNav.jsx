import { Home, Lightbulb, BarChart3, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'Home', icon: <Home size={22} />, label: 'Home' },
  { id: 'Ideas', icon: <Lightbulb size={22} />, label: 'Ideas' },
  { id: 'Stats', icon: <BarChart3 size={22} />, label: 'Stats' },
  { id: 'Settings', icon: <Settings size={22} />, label: 'Settings' },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          aria-label={item.label}
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}