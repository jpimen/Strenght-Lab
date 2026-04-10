# Strength Lab Component Library

Complete guide to using the reusable UI components in the Strength Lab frontend.

## Installation & Setup

All components are automatically available through the centralized component exports:

```typescript
// src/presentation/components/index.ts
import {
  Button,
  Input,
  Card,
  Badge,
  Skeleton,
  EmptyState,
  LoadingSpinner,
} from '@/presentation/components';
```

---

## UI Components

### Button

Versatile button component with multiple variants and sizes.

**Variants:**
- `primary` - Main CTA, red background
- `secondary` - Gray background for secondary actions
- `outline` - Transparent with border
- `ghost` - Transparent without border
- `destructive` - Red background for destructive actions
- `success` - Green background for success actions

**Sizes:**
- `xs` - 32px height (13px text) - Small, tight actions
- `sm` - 40px height (15px text) - Secondary actions
- `md` - 48px height (18px text) - **Primary CTA** ✓ (Accessible)
- `lg` - 56px height (20px text) - Hero/large actions

**Usage:**

```tsx
import { Button } from '@/presentation/components';

export function MyComponent() {
  return (
    <>
      {/* Primary button */}
      <Button variant="primary" size="md">
        Create Program
      </Button>

      {/* With icon */}
      <Button 
        variant="secondary" 
        size="md"
        icon={<Plus className="w-4 h-4" />}
        iconPosition="left"
      >
        Add Athlete
      </Button>

      {/* Loading state */}
      <Button 
        variant="primary" 
        size="md"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? '' : 'Save'}
      </Button>

      {/* Full width */}
      <Button variant="outline" size="md" fullWidth>
        Cancel
      </Button>

      {/* Destructive action */}
      <Button variant="destructive" size="sm">
        Delete
      </Button>
    </>
  );
}
```

---

### Input

Text input field with optional label, error, and hint text support.

**Variants:**
- All standard input types: `text`, `email`, `password`, `number`, `date`

**Features:**
- Label with required indicator
- Error message display
- Hint text support
- Icon support (left-aligned)
- Accessibility: aria-labels, proper nesting

**Usage:**

```tsx
import { Input } from '@/presentation/components';
import { Mail } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  return (
    <form>
      {/* Basic email input */}
      <Input
        type="email"
        label="Email Address"
        placeholder="coach@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* With error */}
      <Input
        type="email"
        label="Email"
        placeholder="Enter email"
        error={error ? 'Invalid email format' : undefined}
        containerClassName="mt-4"
      />

      {/* With icon */}
      <Input
        type="email"
        label="Work Email"
        placeholder="you@company.com"
        icon={<Mail className="w-4 h-4" />}
        containerClassName="mt-4"
      />

      {/* With hint */}
      <Input
        type="password"
        label="Password"
        placeholder="••••••••"
        hint="Must be at least 8 characters"
        containerClassName="mt-4"
        required
      />
    </form>
  );
}
```

---

### Card

Container component with visual variants for grouping related content.

**Variants:**
- `default` - White bg, subtle border, light shadow
- `elevated` - White bg, pronounced shadow (elevation 2)
- `bordered` - Minimal borders, no shadow
- `outlined` - Double border (more pronounced)

**Padding:**
- `compact` - 16px (for tight layouts)
- `default` - 24px (standard)
- `spacious` - 32px (for breathing room)

**Border Accents:**
- `iron-red` - Red left border (errors, alerts)
- `success` - Green left border (positive states)
- `warning` - Yellow left border (warnings)
- `error` - Red left border (errors)
- `info` - Blue left border (info)
- `none` - No border accent

**Usage:**

```tsx
import { Card } from '@/presentation/components';

export function ProgramCard() {
  return (
    <>
      {/* Default card */}
      <Card>
        <h3 className="text-xl font-bold mb-2">Program Name</h3>
        <p className="text-gray-600">Description of the program</p>
      </Card>

      {/* Elevated card (prominent) */}
      <Card variant="elevated" padding="spacious" className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Stats</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Stats content */}
        </div>
      </Card>

      {/* With left border accent (error/alert) */}
      <Card 
        variant="default" 
        borderColor="error"
        padding="default"
        className="mt-6"
      >
        <div className="flex gap-3">
          <AlertCircle className="text-error-red flex-shrink-0" />
          <div>
            <h4 className="font-bold">Warning</h4>
            <p className="text-sm text-gray-600">Program needs attention</p>
          </div>
        </div>
      </Card>

      {/* Success indicator card */}
      <Card borderColor="success" padding="compact" className="mt-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-success-green" />
          <span className="font-bold">Saved successfully</span>
        </div>
      </Card>
    </>
  );
}
```

---

### Badge

Small label/tag component for status, category, or metadata display.

**Variants:**
- `default` - Gray (neutral)
- `success` - Green (positive)
- `warning` - Yellow (caution)
- `error` - Red (critical)
- `info` - Blue (information)

**Sizes:**
- `sm` - 12px text, tight padding (compact display)
- `md` - 14px text, regular padding (standard)

**Usage:**

```tsx
import { Badge } from '@/presentation/components';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function AthleteCard() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">John Doe</h3>
        <div className="flex gap-2">
          {/* Status badges */}
          <Badge variant="success" size="sm">
            Active
          </Badge>
          <Badge variant="info" size="sm">
            Running Program
          </Badge>
        </div>
      </div>

      {/* With icon */}
      <div className="flex gap-2 mt-4">
        <Badge 
          variant="success" 
          size="md"
          icon={<CheckCircle2 className="w-4 h-4" />}
        >
          Last Workout: Today
        </Badge>
      </div>

      {/* Warning status */}
      <Badge variant="warning" size="sm" className="mt-4">
        Incomplete Session
      </Badge>
    </Card>
  );
}
```

---

## Common Components

### Skeleton

Loading placeholder animations for data fetching states.

**Variants:**
- `text` - Multiple lines of shimmer (default)
- `avatar` - Circular loading placeholder
- `circle` - Circle (customizable size)
- `card` - Full card placeholder with multiple elements
- `line` - Single line placeholder

**Usage:**

```tsx
import { Skeleton } from '@/presentation/components';

export function AthleteListView() {
  const { data, isLoading } = useQuery(['athletes']);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton for athlete cards */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} padding="default">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton variant="avatar" />
              <Skeleton variant="text" lines={2} />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Render actual data
  return (
    <>
      {/* Athlete cards */}
    </>
  );
}
```

---

### EmptyState

Placeholder for empty lists or no-data scenarios.

**Props:**
- `icon` - Icon component (optional)
- `title` - Main heading (required)
- `description` - Explanation text (optional)
- `action` - Button action { label, onClick } (optional)

**Usage:**

```tsx
import { EmptyState } from '@/presentation/components';
import { Plus, Users } from 'lucide-react';

export function AthletesPage() {
  const { data } = useQuery(['athletes']);

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-16 h-16" />}
        title="No Athletes Yet"
        description="Start by adding your first athlete to the system."
        action={{
          label: '+ Add Athlete',
          onClick: () => {
            // Open add athlete modal
          },
        }}
      />
    );
  }

  return (
    <>
      {/* Athlete list */}
    </>
  );
}
```

---

### LoadingSpinner

Animated loading indicator.

**Sizes:**
- `sm` - 16px (inline loading)
- `md` - 32px (standard)
- `lg` - 48px (large/hero loading)

**Usage:**

```tsx
import { LoadingSpinner } from '@/presentation/components';

export function AsyncOperation() {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <>
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <LoadingSpinner size="lg" className="text-iron-red mx-auto mb-4" />
            <p className="text-gray-600">Loading programs...</p>
          </div>
        </div>
      )}

      {/* Or inline with text */}
      <Button isLoading={isLoading}>
        {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
        Save Program
      </Button>
    </>
  );
}
```

---

## Layout Components (Existing)

### Toast

Non-blocking notification system.

```tsx
import { useToast } from '@/presentation/components/ToastContext';

export function SaveForm() {
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      await saveProgram();
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Program saved successfully',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save program',
      });
    }
  };

  return <Button onClick={handleSave}>Save</Button>;
}
```

---

## Best Practices

### 1. Accessibility

Always include:

```tsx
// Labels for all inputs
<label htmlFor="email">Email Address</label>
<Input id="email" type="email" />

// ARIA labels for icon-only buttons
<button aria-label="Search" title="Search">
  <Search className="w-5 h-5" />
</button>

// Role attributes where needed
<div role="alert">Important notice</div>
```

### 2. Responsive Sizing

Use appropriate sizes based on context:

```tsx
// Mobile-friendly
<Button size="md" fullWidth className="block md:flex md:w-auto">
  Action
</Button>

// Icon buttons: minimum 44x44px touch target
<button className="min-h-11 min-w-11 flex items-center justify-center">
  <Icon className="w-5 h-5" />
</button>
```

### 3. Loading States

Show proper feedback:

```tsx
// Show loading spinner
<Button isLoading={isSubmitting} disabled={isSubmitting}>
  {isSubmitting ? '' : 'Save'}
</Button>

// Or use skeleton for data loading
{isLoading ? <Skeleton variant="card" /> : <Card>{data}</Card>}
```

### 4. Error Handling

Display errors clearly:

```tsx
<Input
  type="email"
  label="Email"
  error={emailError ? 'Invalid email format' : undefined}
  required
/>

{apiError && (
  <Card borderColor="error" className="mt-4">
    <p className="text-error-red font-bold">{apiError}</p>
  </Card>
)}
```

### 5. State Feedback

Always give users feedback:

```tsx
<Card borderColor={isActive ? 'success' : 'warning'}>
  <Badge variant={isActive ? 'success' : 'warning'}>
    {isActive ? 'Active' : 'Inactive'}
  </Badge>
</Card>
```

---

## Design Tokens

All components use centralized design tokens from `tailwind.config.js`:

### Colors

```typescript
primary: iron-red (#dc2626)
success: success-green (#10b981)
warning: warning-yellow (#f59e0b)
error: error-red (#ef4444)
info: info-blue (#3b82f6)
```

### Spacing

```
1: 4px      5: 20px
2: 8px      6: 24px
3: 12px     7: 28px
4: 16px     8: 32px
10: 40px    12: 48px
16: 64px
```

### Shadows

```
elevate-1: Light shadow (0 2px 4px)
elevate-2: Medium shadow (0 4px 8px)
elevate-3: Strong shadow (0 8px 16px)
depth: Dark shadow (0 12px 24px)
focus-ring: Red focus ring
```

---

## Migration Guide

### Replacing Old Components

**Before:**
```tsx
<button className="bg-iron-red text-white uppercase...">
  Create
</button>
```

**After:**
```tsx
<Button variant="primary" size="md">
  Create
</Button>
```

### Custom Component Usage

```tsx
// Old: Inline className repetition
function MyPage() {
  return (
    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-lg">
      {/* Content */}
    </div>
  );
}

// New: Reusable component
function MyPage() {
  return (
    <Card>
      {/* Content */}
    </Card>
  );
}
```

---

## Testing Components

Example jest/vitest tests:

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/presentation/components';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays error state on input', () => {
    render(<Input error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

**Q: Components not found?**
A: Make sure to import from `@/presentation/components` (centralized export)

**Q: Styling not applying?**
A: Check that `tailwindcss` is properly configured and running in dev mode

**Q: Focus ring not visible?**
A: Add `focus:ring-offset-2` to ensure visibility against all backgrounds

---

## Future Enhancements

- [ ] Modal/Dialog component
- [ ] Dropdown/Select component
- [ ] Tabs component
- [ ] Tooltip component
- [ ] Switch/Toggle component
- [ ] Pagination component
- [ ] Breadcrumb component (high priority)
- [ ] Storybook integration for component showcase

---

**Last Updated:** April 7, 2026
**Component Library Version:** 1.0
