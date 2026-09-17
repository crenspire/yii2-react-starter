import { Head, Link, router } from '@inertiajs/react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleDashed,
  Columns3,
  EllipsisVertical,
  Eye,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import AppLayout from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/page-header'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatRelative, initials } from '@/lib/format'

const optionalColumns = {
  role: 'Role',
  status: 'Status',
  created_at: 'Joined',
  updated_at: 'Last updated',
}

function SortableHeader({ column, sort, onSort, children, className }) {
  const isSorted = sort.sort_by === column
  const Icon = !isSorted ? ArrowUpDown : sort.sort_order === 'asc' ? ArrowUp : ArrowDown

  return (
    <TableHead className={className}>
      <Button variant="ghost" size="sm" className="data-[sorted=true]:text-foreground -ml-3 h-8" data-sorted={isSorted} onClick={() => onSort(column)}>
        {children}
        <Icon className={isSorted ? undefined : 'text-muted-foreground/60'} />
      </Button>
    </TableHead>
  )
}

export default function UsersIndex({ users, pagination, filters, sort }) {
  const [search, setSearch] = useState(filters.search)
  const [dateRange, setDateRange] = useState({ from: filters.date_from, to: filters.date_to })
  const [visibleColumns, setVisibleColumns] = useState(() => new Set(Object.keys(optionalColumns).filter(c => c !== 'updated_at')))
  const [userToDelete, setUserToDelete] = useState(null)

  const query = {
    search: filters.search,
    email_verified: filters.email_verified,
    date_from: filters.date_from,
    date_to: filters.date_to,
    sort_by: sort.sort_by,
    sort_order: sort.sort_order,
    per_page: pagination.per_page,
    page: pagination.current_page,
  }

  const visit = (changes) => {
    const params = { ...query, page: 1, ...changes }
    // Keep the URL clean: drop empty values and defaults
    Object.keys(params).forEach((key) => {
      if (params[key] === '' || params[key] === null || (key === 'page' && params[key] === 1) || (key === 'per_page' && params[key] === 20))
        delete params[key]
    })
    router.get('/users', params, { preserveState: true, preserveScroll: true, replace: true })
  }

  // Search as you type, after a short pause
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      if (search !== filters.search)
        visit({ search })
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleSort = (column) => {
    const order = sort.sort_by === column && sort.sort_order === 'asc' ? 'desc' : 'asc'
    visit({ sort_by: column, sort_order: order })
  }

  const hasFilters = filters.search || filters.email_verified || filters.date_from || filters.date_to
  const resetFilters = () => {
    setSearch('')
    setDateRange({ from: '', to: '' })
    visit({ search: '', email_verified: '', date_from: '', date_to: '' })
  }

  const toggleColumn = (column, visible) => {
    setVisibleColumns((current) => {
      const next = new Set(current)
      visible ? next.add(column) : next.delete(column)
      return next
    })
  }

  const confirmDelete = () => {
    router.post(`/users/${userToDelete.id}/delete`, {}, {
      preserveScroll: true,
      onFinish: () => setUserToDelete(null),
    })
  }

  const firstItem = pagination.total === 0 ? 0 : (pagination.current_page - 1) * pagination.per_page + 1
  const lastItem = Math.min(pagination.current_page * pagination.per_page, pagination.total)
  const columnCount = 2 + visibleColumns.size

  return (
    <>
      <Head title="Users" />
      <PageHeader title="Users" description="Manage accounts, roles and access to your application.">
        <Button asChild>
          <Link href="/users/create">
            <Plus />
            Add user
          </Link>
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={filters.email_verified || 'all'} onValueChange={value => visit({ email_verified: value === 'all' ? '' : value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-dashed">
                <CalendarRange />
                Joined
                {(filters.date_from || filters.date_to) && (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {filters.date_from || '…'}
                    {' – '}
                    {filters.date_to || '…'}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <form
                className="grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  visit({ date_from: dateRange.from, date_to: dateRange.to })
                }}
              >
                <div className="space-y-1">
                  <h4 className="leading-none font-medium">Joined between</h4>
                  <p className="text-muted-foreground text-sm">Filter users by sign-up date.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="date-from">From</Label>
                    <Input id="date-from" type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="date-to">To</Label>
                    <Input id="date-to" type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" size="sm">Apply</Button>
              </form>
            </PopoverContent>
          </Popover>

          {hasFilters && (
            <Button variant="ghost" onClick={resetFilters}>
              Reset
              <X />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Columns3 />
                <span className="hidden lg:inline">Columns</span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {Object.entries(optionalColumns).map(([column, label]) => (
                <DropdownMenuCheckboxItem
                  key={column}
                  checked={visibleColumns.has(column)}
                  onCheckedChange={checked => toggleColumn(column, checked)}
                  onSelect={e => e.preventDefault()}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <SortableHeader column="name" sort={sort} onSort={handleSort} className="pl-4">User</SortableHeader>
                {visibleColumns.has('role') && <SortableHeader column="role" sort={sort} onSort={handleSort}>Role</SortableHeader>}
                {visibleColumns.has('status') && <SortableHeader column="email_verified_at" sort={sort} onSort={handleSort}>Status</SortableHeader>}
                {visibleColumns.has('created_at') && <SortableHeader column="created_at" sort={sort} onSort={handleSort}>Joined</SortableHeader>}
                {visibleColumns.has('updated_at') && <SortableHeader column="updated_at" sort={sort} onSort={handleSort}>Last updated</SortableHeader>}
                <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={columnCount} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <UserRound className="text-muted-foreground size-8" />
                          <p className="font-medium">No users found</p>
                          <p className="text-muted-foreground text-sm">
                            {hasFilters ? 'Try adjusting your search or filters.' : 'Add a user to get started.'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                : users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="grid min-w-0">
                            <Link href={`/users/${user.id}`} className="truncate font-medium hover:underline">{user.name}</Link>
                            <span className="text-muted-foreground truncate text-sm">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      {visibleColumns.has('role') && (
                        <TableCell>
                          <Badge variant="outline" className="text-muted-foreground px-1.5 capitalize">
                            {user.role === 'admin' ? <ShieldCheck /> : <UserRound />}
                            {user.role}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.has('status') && (
                        <TableCell>
                          <Badge variant="outline" className="text-muted-foreground px-1.5">
                            {user.email_verified_at
                              ? <BadgeCheck className="fill-green-500 text-white dark:fill-green-400 dark:text-background" />
                              : <CircleDashed />}
                            {user.email_verified_at ? 'Verified' : 'Unverified'}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.has('created_at') && (
                        <TableCell className="text-muted-foreground" title={formatRelative(user.created_at)}>
                          {formatDate(user.created_at)}
                        </TableCell>
                      )}
                      {visibleColumns.has('updated_at') && (
                        <TableCell className="text-muted-foreground">{formatRelative(user.updated_at)}</TableCell>
                      )}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground data-[state=open]:bg-muted size-8">
                              <EllipsisVertical />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem asChild>
                              <Link href={`/users/${user.id}`}>
                                <Eye />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/users/${user.id}/edit`}>
                                <Pencil />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => setUserToDelete(user)}>
                              <Trash2 />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col-reverse items-center justify-between gap-4 px-2 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            {pagination.total === 0
              ? 'No results'
              : `Showing ${firstItem}–${lastItem} of ${pagination.total} user${pagination.total === 1 ? '' : 's'}`}
          </p>
          <div className="flex items-center gap-6 lg:gap-8">
            <div className="hidden items-center gap-2 sm:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
              <Select value={`${pagination.per_page}`} onValueChange={value => visit({ per_page: Number(value) })}>
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 50, 100].map(size => (
                    <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm font-medium">
              Page
              {' '}
              {pagination.current_page}
              {' '}
              of
              {' '}
              {pagination.last_page}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="hidden size-8 lg:flex" disabled={pagination.current_page <= 1} onClick={() => visit({ page: 1 })}>
                <span className="sr-only">First page</span>
                <ChevronsLeft />
              </Button>
              <Button variant="outline" size="icon" className="size-8" disabled={pagination.current_page <= 1} onClick={() => visit({ page: pagination.current_page - 1 })}>
                <span className="sr-only">Previous page</span>
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="icon" className="size-8" disabled={pagination.current_page >= pagination.last_page} onClick={() => visit({ page: pagination.current_page + 1 })}>
                <span className="sr-only">Next page</span>
                <ChevronRight />
              </Button>
              <Button variant="outline" size="icon" className="hidden size-8 lg:flex" disabled={pagination.current_page >= pagination.last_page} onClick={() => visit({ page: pagination.last_page })}>
                <span className="sr-only">Last page</span>
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={userToDelete !== null} onOpenChange={open => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete
              {' '}
              {userToDelete?.name}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete?.email}
              {' '}
              will no longer be able to sign in. The account is kept in the database as deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

UsersIndex.layout = page => (
  <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Users' }]}>{page}</AppLayout>
)
