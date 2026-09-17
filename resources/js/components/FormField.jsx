import { Label } from '@/components/ui/label'

/**
 * A labelled form control with its validation error.
 */
export function FormField({ id, label, error, labelAction, description, children }) {
  return (
    <div className="grid content-start gap-2">
      <div className="flex min-h-5 items-center">
        <Label htmlFor={id}>{label}</Label>
        {labelAction && <div className="ml-auto">{labelAction}</div>}
      </div>
      {children}
      {description && !error && <p className="text-muted-foreground text-sm">{description}</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}
