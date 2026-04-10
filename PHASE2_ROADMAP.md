# Phase 2 Roadmap: Navigation & Flows

## Objective
Improve user journeys and simplify navigation to reduce friction and confusion.

---

## Task 1: Create BreadcrumbNav Component

### Purpose
Show users where they are in the application hierarchy and enable quick navigation.

### Implementation

Create `src/presentation/components/ui/Breadcrumb/Breadcrumb.tsx`:

```tsx
interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="text-gray-400">/</span>}
          {item.path ? (
            <button
              onClick={() => onNavigate?.(item.path!)}
              className="text-iron-red hover:text-red-700 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className={item.isActive ? 'text-iron-900' : 'text-gray-600'}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
```

### Usage in Layout

```tsx
// Add to topbar or above main content
<Breadcrumb
  items={[
    { label: 'HOME', path: '/' },
    { label: 'PROGRAMS', path: '/programs' },
    { label: 'Athlete Name', isActive: true },
  ]}
  onNavigate={(path) => navigate(path)}
/>
```

---

## Task 2: Update Dashboard Component

### Current State
- Uses old button/card styling
- Shows "LOADING_DATA_STREAM..." during loading
- Can be improved with new components

### Changes

1. **Replace loading state:**
```tsx
// Before
if (isLoading) return <div className="p-8 text-iron-red animate-pulse">LOADING_DATA_STREAM...</div>;

// After
if (isLoading) return <Skeleton variant="card" />;
```

2. **Replace buttons:**
```tsx
import { Button } from '@/presentation/components';

// Before
<button className="bg-iron-red text-white...">NEW PROGRAM</button>

// After
<Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
  New Program
</Button>
```

3. **Replace stat cards:**
```tsx
import { Card, Badge } from '@/presentation/components';

// Before
<div className="col-span-12 lg:col-span-3 panel...">

// After
<Card variant="elevated" borderColor="iron-red" padding="spacious">
  <h3 className="text-xs font-mono text-gray-400 mb-8">LIVE PROTOCOLS</h3>
  <div className="text-6xl font-black mb-6">{data.stats.activeCount}</div>
  <Badge variant="success" size="sm">
    +{data.stats.uptimeChange} THIS WEEK
  </Badge>
</Card>
```

---

## Task 3: Simplify Program Builder

### Current Flow
```
Dashboard → Select Athlete → Program Editor
(2 clicks before editing)
```

### New Flow
```
Dashboard (click "Edit") → Program Editor
(1 click!)
```

### Implementation

1. **On Dashboard: Add inline edit button**
```tsx
<Card>
  {/* Program card */}
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-lg font-bold">{program.name}</h4>
      <p className="text-sm text-gray-600">{program.athleteName}</p>
    </div>
    <div className="flex gap-2">
      <Button 
        variant="primary" 
        size="sm"
        onClick={() => navigate(`/program-builder/editor/${program.athleteId}`)}
      >
        Edit
      </Button>
      <Button variant="ghost" size="sm">⋯</Button>
    </div>
  </div>
</Card>
```

2. **Make "Create New Program" a quick modal**
```tsx
const [showCreateModal, setShowCreateModal] = React.useState(false);

<Button 
  onClick={() => setShowCreateModal(true)}
  icon={<Plus className="w-4 h-4" />}
>
  New Program
</Button>

{showCreateModal && (
  <QuickCreateProgramModal
    onClose={() => setShowCreateModal(false)}
    onCreate={(athleteId) => navigate(`/program-builder/editor/${athleteId}`)}
  />
)}
```

---

## Task 4: Build Athlete Management Hub

### New Page: `/athletes`

```tsx
export function AthleteView() {
  const [athletes, setAthletes] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);

  React.useEffect(() => {
    fetchAthletes();
  }, []);

  if (isLoading) return <Skeleton variant="card" />;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase">ATHLETES</h1>
          <p className="text-xs font-mono text-gray-400">MANAGE PROGRAM RECIPIENTS</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          icon={<Plus className="w-4 h-4" />}
          size="md"
        >
          Add Athlete
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <Input 
          placeholder="Search athletes..."
          className="flex-1"
          icon={<Search className="w-4 h-4" />}
        />
        <Badge variant="info" size="md">
          {athletes.length} Active
        </Badge>
      </div>

      {/* Athletes Grid/List */}
      {athletes.length === 0 ? (
        <EmptyState
          icon={<Users className="w-16 h-16" />}
          title="No Athletes Yet"
          description="Add your first athlete to get started"
          action={{
            label: '+ Add Athlete',
            onClick: () => setShowAddModal(true),
          }}
        />
      ) : (
        <div className="grid gap-4">
          {athletes.map((athlete) => (
            <Card key={athlete.id} variant="elevated">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{athlete.name}</h3>
                  <p className="text-sm text-gray-600">{athlete.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="success" size="sm">
                      {athlete.programCount} Programs
                    </Badge>
                    <Badge variant="info" size="sm">
                      Last: {athlete.lastActivity}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/athletes/${athlete.id}`)}
                  >
                    View
                  </Button>
                  <Button variant="ghost" size="sm">⋯</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddAthleteModal
          onClose={() => setShowAddModal(false)}
          onAdd={(athlete) => {
            setAthletes([...athletes, athlete]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
```

---

## Task 5: Add Notifications Center

### UI: Dropdown in Topbar

```tsx
const [showNotifications, setShowNotifications] = React.useState(false);

<div className="relative">
  <button
    onClick={() => setShowNotifications(!showNotifications)}
    aria-label="Notifications"
    className="relative"
  >
    <Bell className="w-5 h-5" />
    {unreadCount > 0 && (
      <Badge variant="error" size="sm" className="absolute -top-2 -right-2">
        {unreadCount}
      </Badge>
    )}
  </button>

  {showNotifications && (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold uppercase">Notifications</h3>
        <button 
          onClick={() => setShowNotifications(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications.map((notif) => (
          <Card key={notif.id} variant="default" padding="compact">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                {notif.type === 'message' && <MessageCircle className="w-4 h-4" />}
                {notif.type === 'alert' && <AlertCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{notif.title}</p>
                <p className="text-xs text-gray-600">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        fullWidth 
        className="mt-4"
      >
        View All
      </Button>
    </div>
  )}
</div>
```

---

## Implementation Order

1. **Breadcrumb Component** (1-2 hours)
   - Create component
   - Add to Layout above main content
   - Test navigation

2. **Dashboard Update** (2-3 hours)
   - Replace button/card styles
   - Add Skeleton loading
   - Use new Badge component

3. **Program Builder Simplification** (3-4 hours)
   - Create QuickCreateModal
   - Add edit buttons to dashboard
   - Remove RosterSelector step

4. **Athlete Hub** (4-5 hours)
   - Create athlete list page
   - Add/edit athlete forms
   - Search/filter functionality

5. **Notifications Center** (3-4 hours)
   - Create dropdown UI
   - Connect to backend API
   - Mark as read/unread

---

## Estimated Effort

| Task | Hours | Developer |
|------|-------|-----------|
| Breadcrumb | 2 | 1 |
| Dashboard Update | 2 | 1 |
| Program Builder | 3 | 1 |
| Athlete Hub | 5 | 1 |
| Notifications | 3 | 1 |
| **Total** | **15** | **~2 days** |

---

## Success Metrics

- ✅ All pages use new component library
- ✅ Program builder accessible in 1 click from dashboard
- ✅ Breadcrumbs show on all pages
- ✅ Athlete management is centralized
- ✅ Notifications dropdown functional
- ✅ No visual regressions
- ✅ Mobile responsive
- ✅ Keyboard accessible

---

**Ready to start? Pick a task above and begin implementation!**
