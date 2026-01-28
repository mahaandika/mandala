import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Menu',
        href: '/admin/menu', // Langsung arahkan ke path jika route bermasalah
    },
];

type Menu = {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
    is_active: boolean;
    category: {
        name: string;
    };
};

// Definisi tipe flash yang lebih detail agar tidak merah
type FlashMessage = {
    success?: string | { type: string; message: string };
};

type PageProps = {
    menus: {
        data: Menu[];
        links: any[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        page?: string | number; // Tambahkan ini agar tidak error saat destructuring
    };
    flash: FlashMessage;
};

export default function Index() {
    const { props } = usePage<PageProps>();
    const { menus, filters, flash } = props;

    // State
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [showModal, setShowModal] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 1. Otomatis munculkan modal & hilang dalam 2.5 detik
    useEffect(() => {
        if (flash?.success) {
            setShowModal(true);
            const timer = setTimeout(() => {
                setShowModal(false);
            }, 2500); // 2.5 Detik
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    // 2. Fungsi utama navigasi/filter (Meniru handleFilter Category)
    const handleFilter = (newFilters: any) => {
        router.get(
            '/admin/menu',
            { ...filters, ...newFilters },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    // 3. useEffect untuk Search & Status (Debounce 500ms)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Cek jika ada perubahan pada search atau status dibanding filters di URL
            const isSearchChanged = search !== (filters.search || '');
            const isStatusChanged = status !== (filters.status || 'all');

            if (isSearchChanged || isStatusChanged) {
                // Reset ke page 1 saat filter berubah
                const { page, ...restFilters } = filters;
                handleFilter({
                    ...restFilters,
                    search: search || null,
                    status: status,
                });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, status]);

    // 4. Handle Delete (Meniru Category)
    const handleDelete = () => {
        if (!deleteId) return;

        setIsDeleting(true);
        router.delete(`/admin/menu/${deleteId}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setOpenDelete(false);
                setDeleteId(null);
                setIsDeleting(false);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu" />

            <div className="px-4">
                <h1 className="pt-2 pb-3 text-2xl font-semibold">Menu</h1>

                <div className="rounded-md bg-white shadow-md">
                    <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative w-full md:max-w-md">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)} // Hanya set state
                                placeholder="Search by name..."
                                className="bg-slate-50 pl-9"
                            />
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)} // Hanya set state
                                className="w-full rounded-md border bg-slate-50 px-3 py-2 text-sm md:w-40"
                            >
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <Link href="/admin/menu/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Menu
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <Table className="min-w-[1200px] table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">
                                        Status
                                    </TableHead>
                                    <TableHead>Menu Name</TableHead>
                                    <TableHead className="w-[300px]">
                                        Description
                                    </TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="w-[150px] text-center">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {menus.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-10 text-center"
                                        >
                                            No menu found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    menus.data.map((m) => (
                                        <TableRow key={m.id}>
                                            <TableCell>
                                                <span
                                                    className={`rounded px-2 py-1 text-xs font-medium ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                                >
                                                    {m.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {m.name}
                                            </TableCell>
                                            <TableCell className="truncate">
                                                {m.description}
                                            </TableCell>
                                            <TableCell>
                                                <img
                                                    src={`/storage/menus/${m.image}`}
                                                    alt={m.name}
                                                    className="h-12 w-12 rounded-md border object-cover"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                Rp{' '}
                                                {Number(m.price).toLocaleString(
                                                    'id-ID',
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {m.category.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-2">
                                                    <Link
                                                        href={`/admin/menu/${m.id}/edit`}
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setDeleteId(m.id);
                                                            setOpenDelete(true);
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PAGINATION */}
                    <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-4 md:flex-row">
                        <div className="text-sm text-muted-foreground">
                            Showing{' '}
                            <span className="font-medium text-foreground">
                                {menus.from || 0}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium text-foreground">
                                {menus.to || 0}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium text-foreground">
                                {menus.total || 0}
                            </span>{' '}
                            results
                        </div>
                        <div className="flex gap-2">
                            {menus.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    preserveState
                                    className={`rounded-md border px-3 py-1 text-sm ${link.active ? 'bg-blue-600 text-white shadow-sm' : 'bg-white hover:bg-gray-50'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. Modal Konfirmasi Delete */}
            {openDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-[400px] rounded-xl bg-white p-6 shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <AlertTriangle className="h-7 w-7" />
                            </div>
                            <h2 className="text-xl font-bold">Are you sure?</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Do you really want to delete this menu? This
                                cannot be undone.
                            </p>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setOpenDelete(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Modal Success */}
            {showModal && flash?.success && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                            <h2 className="text-xl font-bold">
                                {typeof flash.success === 'object'
                                    ? flash.success.type === 'create'
                                        ? 'Created Successfully'
                                        : flash.success.type === 'update'
                                          ? 'Updated Successfully'
                                          : 'Deleted Successfully'
                                    : 'Success!'}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                {typeof flash.success === 'object'
                                    ? flash.success.message
                                    : flash.success}
                            </p>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={() => setShowModal(false)}
                                className="w-32 bg-green-600 text-white hover:bg-green-700"
                            >
                                OK
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
