/**
 * Component Library Usage Examples
 * 
 * This file demonstrates how to use all the new components created in Phase 1.
 * These are real, production-ready components that can be imported and used immediately.
 * 
 * Location: src/presentation/components/
 * Central Export: src/presentation/components/index.ts
 */

import { Button } from './ui/Button/Button';
import { Input } from './ui/Input/Input';
import { Card } from './ui/Card/Card';
import { Badge } from './ui/Badge/Badge';
import { Skeleton } from './common/Skeleton';
import { EmptyState } from './common/EmptyState';
import { LoadingSpinner } from './common/LoadingSpinner';
import { Plus, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import React from 'react';

/**
 * Example 1: Button Component
 * Shows all 6 variants and 4 sizes
 */
export function ButtonExamples() {
  return (
    <Card padding="spacious">
      <h3 className="text-2xl font-bold mb-6">Button Component</h3>

      {/* Variants */}
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <Button variant="primary" size="md">
            Primary CTA
          </Button>
          <Button variant="secondary" size="md">
            Secondary
          </Button>
          <Button variant="outline" size="md">
            Outline
          </Button>
          <Button variant="ghost" size="md">
            Ghost
          </Button>
          <Button variant="destructive" size="md">
            Destructive
          </Button>
          <Button variant="success" size="md">
            Success
          </Button>
        </div>

        {/* Sizes */}
        <p className="text-sm font-bold text-gray-600 mt-6">Sizes:</p>
        <div className="flex gap-4 items-center">
          <Button variant="primary" size="xs">
            xs (32px)
          </Button>
          <Button variant="primary" size="sm">
            sm (40px)
          </Button>
          <Button variant="primary" size="md">
            md (48px) ← WCAG Standard
          </Button>
          <Button variant="primary" size="lg">
            lg (56px)
          </Button>
        </div>

        {/* With Icon */}
        <p className="text-sm font-bold text-gray-600 mt-6">With Icon:</p>
        <div className="flex gap-4">
          <Button 
            variant="primary" 
            size="md"
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
          >
            Left Icon
          </Button>
          <Button 
            variant="primary" 
            size="md"
            icon={<Plus className="w-4 h-4" />}
            iconPosition="right"
          >
            Right Icon
          </Button>
        </div>

        {/* Loading State */}
        <p className="text-sm font-bold text-gray-600 mt-6">Loading State:</p>
        <Button variant="primary" size="md" isLoading={true}>
          Saving...
        </Button>
      </div>
    </Card>
  );
}

/**
 * Example 2: Input Component
 * Shows labels, errors, hints, and icons
 */
export function InputExamples() {
  const [email, setEmail] = React.useState('');

  return (
    <Card padding="spacious">
      <h3 className="text-2xl font-bold mb-6">Input Component</h3>

      <div className="space-y-6">
        {/* Basic input */}
        <Input
          type="text"
          label="Full Name"
          placeholder="John Doe"
          required
        />

        {/* Email with validation */}
        <Input
          type="email"
          label="Email Address"
          placeholder="coach@example.com"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />

        {/* With hint */}
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          hint="Must be at least 8 characters"
          required
        />

        {/* Disabled state */}
        <Input
          type="text"
          label="Disabled Field"
          placeholder="Cannot edit"
          disabled
        />
      </div>
    </Card>
  );
}

/**
 * Example 3: Card Component
 * Shows variants and border accents
 */
export function CardExamples() {
  return (
    <div className="space-y-6">
      {/* Default card */}
      <Card variant="default" padding="default">
        <h4 className="font-bold mb-2">Default Card</h4>
        <p className="text-sm text-gray-600">
          This is a default card with subtle border and light shadow.
        </p>
      </Card>

      {/* Elevated card */}
      <Card variant="elevated" padding="spacious">
        <h4 className="font-bold mb-2">Elevated Card</h4>
        <p className="text-sm text-gray-600">
          This card has a more pronounced shadow for emphasis.
        </p>
      </Card>

      {/* With border accents */}
      <div className="grid grid-cols-2 gap-4">
        <Card borderColor="success" padding="default">
          <div className="flex gap-2">
            <CheckCircle2 className="w-5 h-5 text-success-green flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Success State</p>
              <p className="text-xs text-gray-600">Green left border</p>
            </div>
          </div>
        </Card>

        <Card borderColor="error" padding="default">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-error-red flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Error State</p>
              <p className="text-xs text-gray-600">Red left border</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Example 4: Badge Component
 * Shows all 5 variants
 */
export function BadgeExamples() {
  return (
    <Card padding="spacious">
      <h3 className="text-2xl font-bold mb-6">Badge Component</h3>

      <div className="flex flex-wrap gap-4">
        <Badge variant="default" size="md">
          Default
        </Badge>
        <Badge variant="success" size="md">
          Active
        </Badge>
        <Badge variant="warning" size="md">
          Pending
        </Badge>
        <Badge variant="error" size="md">
          Critical
        </Badge>
        <Badge variant="info" size="md">
          Information
        </Badge>
      </div>

      <p className="text-sm text-gray-600 mt-6">With icons:</p>
      <div className="flex flex-wrap gap-4 mt-3">
        <Badge variant="success" size="md" icon={<CheckCircle2 className="w-4 h-4" />}>
          Completed
        </Badge>
        <Badge variant="error" size="md" icon={<AlertCircle className="w-4 h-4" />}>
          Failed
        </Badge>
      </div>
    </Card>
  );
}

/**
 * Example 5: Skeleton Component
 * Shows loading placeholder states
 */
export function SkeletonExamples() {
  return (
    <Card padding="spacious">
      <h3 className="text-2xl font-bold mb-6">Skeleton Component</h3>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold text-gray-600 mb-2">Text Skeleton (3 lines):</p>
          <Skeleton variant="text" lines={3} />
        </div>

        <div>
          <p className="text-sm font-bold text-gray-600 mb-2">Card Skeleton:</p>
          <Skeleton variant="card" />
        </div>

        <div className="flex gap-4">
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2">Avatar:</p>
            <Skeleton variant="avatar" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2">Circle:</p>
            <Skeleton variant="circle" width="60px" height="60px" />
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Example 6: EmptyState Component
 * Shows no-data scenarios
 */
export function EmptyStateExample() {
  return (
    <EmptyState
      icon={<Users className="w-16 h-16" />}
      title="No Athletes Yet"
      description="Start by adding your first athlete to the system. They will receive a share code to access the mobile app."
      action={{
        label: '+ Add Athlete',
        onClick: () => console.log('Open add athlete modal'),
      }}
    />
  );
}

/**
 * Example 7: LoadingSpinner Component
 * Shows different sizes
 */
export function LoadingSpinnerExample() {
  return (
    <Card padding="spacious">
      <h3 className="text-2xl font-bold mb-6">Loading Spinner</h3>

      <div className="flex gap-8 items-center">
        <div className="text-center">
          <LoadingSpinner size="sm" className="text-iron-red mx-auto mb-2" />
          <p className="text-xs text-gray-600">Small</p>
        </div>
        <div className="text-center">
          <LoadingSpinner size="md" className="text-iron-red mx-auto mb-2" />
          <p className="text-xs text-gray-600">Medium</p>
        </div>
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-iron-red mx-auto mb-2" />
          <p className="text-xs text-gray-600">Large</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Example 8: Real-world usage - Athlete Card
 */
export function AthleteCardExample() {
  return (
    <Card variant="elevated" padding="default">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">John Doe</h3>
          <p className="text-sm text-gray-600">john.doe@example.com</p>
        </div>
        <Badge variant="success" size="sm">
          Active
        </Badge>
      </div>

      <div className="flex gap-2 mb-6">
        <Badge variant="info" size="sm">
          3 Programs
        </Badge>
        <Badge variant="success" size="sm">
          Last: Today
        </Badge>
      </div>

      <div className="flex gap-2">
        <Button variant="primary" size="sm">
          View Profile
        </Button>
        <Button variant="outline" size="sm">
          Message
        </Button>
        <Button variant="ghost" size="sm">
          More
        </Button>
      </div>
    </Card>
  );
}

/**
 * Example 9: Real-world usage - Program Form
 */
export function ProgramFormExample() {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [athlete, setAthlete] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    console.log({ name, description, athlete });
  };

  return (
    <Card variant="elevated" padding="spacious">
      <h3 className="text-2xl font-bold mb-6">Create Program</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Program Name"
          placeholder="e.g., Powerlifting 12-Week Program"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          required
        />

        <Input
          type="text"
          label="Select Athlete"
          placeholder="Choose athlete..."
          value={athlete}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAthlete(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-iron-red"
            placeholder="Program details and notes..."
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? '' : 'Create Program'}
          </Button>
          <Button type="button" variant="outline" size="md">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

/**
 * Main Demo Page
 * Shows all components in action
 */
export function ComponentDemoPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12">
      <div className="animate-fadeIn">
        <h1 className="text-5xl font-black uppercase mb-2">Component Library Demo</h1>
        <p className="text-gray-600">
          All components below are production-ready and fully accessible (WCAG AA)
        </p>
      </div>

      <section className="animate-slideUp">
        <h2 className="text-3xl font-bold mb-6">Core Components</h2>
        <ButtonExamples />
      </section>

      <section className="animate-slideUp delay-100">
        <h2 className="text-3xl font-bold mb-6">Form Inputs</h2>
        <InputExamples />
      </section>

      <section className="animate-slideUp delay-200">
        <h2 className="text-3xl font-bold mb-6">Cards & Layout</h2>
        <CardExamples />
      </section>

      <section className="animate-slideUp delay-300">
        <h2 className="text-3xl font-bold mb-6">Status Indicators</h2>
        <BadgeExamples />
      </section>

      <section className="animate-slideUp delay-400">
        <h2 className="text-3xl font-bold mb-6">Loading States</h2>
        <SkeletonExamples />
      </section>

      <section className="animate-slideUp delay-500">
        <h2 className="text-3xl font-bold mb-6">Empty States</h2>
        <EmptyStateExample />
      </section>

      <section className="animate-slideUp delay-600">
        <h2 className="text-3xl font-bold mb-6">Spinners</h2>
        <LoadingSpinnerExample />
      </section>

      <section className="animate-slideUp delay-700">
        <h2 className="text-3xl font-bold mb-6">Real-World Examples</h2>
        <div className="space-y-6">
          <AthleteCardExample />
          <ProgramFormExample />
        </div>
      </section>
    </div>
  );
}

export default ComponentDemoPage;
