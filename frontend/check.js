import * as icons from 'lucide-react';

const toCheck = [
  'BarChart3', 'UserSquare2', 'LayoutDashboard', 'CalendarDays', 'Users', 'SlidersHorizontal',
  'PlusSquare', 'PlayCircle', 'User', 'Calendar', 'Target', 'Bold', 'Italic', 'Type', 'AlignLeft', 'History', 'X', 'Repeat',
  'ChevronRight', 'Plus', 'TriangleAlert', 'CheckCircle2', 'CloudDownload', 'Filter', 'Bell', 'Monitor', 'UserCircle2', 'Search'
];

toCheck.forEach(name => {
  if (!icons[name]) {
    console.error(`MISSING_ICON: ${name}`);
  }
});
