import { Head } from '@inertiajs/react'
import { Check, Receipt } from 'lucide-react'
import AppLayout from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const included = ['Unlimited users', 'Role-based access', 'Password resets by email', 'Light and dark themes']

export default function Billing() {
  return (
    <>
      <Head title="Billing" />
      <PageHeader title="Billing" description="Manage your plan and view invoices." />

      <div className="grid max-w-3xl gap-6">
        <Card>
          <CardHeader>
            <CardDescription>Current plan</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              Free
              <span className="text-muted-foreground text-base font-normal"> / forever</span>
            </CardTitle>
            <CardAction>
              <Badge variant="secondary">Active</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {included.map(feature => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="text-muted-foreground size-4" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="justify-between gap-4 border-t">
            <p className="text-muted-foreground text-sm">Paid plans aren&apos;t set up for this application yet.</p>
            <Button disabled>Upgrade</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Your billing history.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
              <div className="bg-muted flex size-10 items-center justify-center rounded-full">
                <Receipt className="text-muted-foreground size-5" />
              </div>
              <p className="font-medium">No invoices yet</p>
              <p className="text-muted-foreground text-sm">Invoices will appear here once you&apos;re on a paid plan.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

Billing.layout = page => <AppLayout breadcrumbs={[{ title: 'Account' }, { title: 'Billing' }]}>{page}</AppLayout>
