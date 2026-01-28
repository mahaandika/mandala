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
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Index({ categories, filters }: any) {
    const { flash }: any = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Otomatis munculkan modal jika ada flash success
    useEffect(() => {
        if (flash.success) {
            setShowModal(true);
            const timer = setTimeout(() => setShowModal(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash.success]);

    // Fungsi utama untuk navigasi/filter
    const handleFilter = (newFilters: any) => {
        router.get(
            '/admin/categories',
            { ...filters, ...newFilters },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const handleDelete = () => {
        if (!deleteId) return;

        setIsDeleting(true);
        router.delete(`/admin/categories/${deleteId}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setOpenDelete(false);
                setDeleteId(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    // useEffect untuk Real-time Search (Debounce 500ms)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Cek jika nilai search berbeda dengan yang ada di URL filters
            if (search !== (filters.search || '')) {
                // Saat search, kita hapus param 'page' agar balik ke halaman 1
                const { page, ...restFilters } = filters;
                handleFilter({ ...restFilters, search: search });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Category', href: '/admin/categories' }]}
        >
            <Head title="Category" />

            <div className="px-4">
                <h1 className="pt-2 pb-3 text-2xl font-semibold">Category</h1>
                <div className="rounded-md border bg-white shadow-md">
                    <div className="flex w-full flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                        {/* SEARCH INPUT */}
                        <div className="relative w-full md:max-w-md">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name..."
                                className="bg-slate-50 pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)} // Langsung update state lokal
                            />
                        </div>

                        {/* FILTER STATUS */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <select
                                className="w-full rounded-md border bg-slate-50 px-3 py-2 text-sm md:w-40"
                                value={filters.status || 'all'}
                                onChange={(e) => {
                                    // Untuk filter status, kita ingin langsung eksekusi tanpa debounce
                                    const { page, ...restFilters } = filters;
                                    handleFilter({
                                        ...restFilters,
                                        status: e.target.value,
                                    });
                                }}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            {/* Tombol Add Category tetap sama */}
                            <Link href="/admin/categories/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add
                                    Category
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.map((category: any) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">
                                            {category.name}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                            >
                                                {category.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="space-x-2 text-center">
                                            <Link
                                                href={`/admin/categories/${category.id}/edit`}
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
                                                    setDeleteId(category.id); // Mencatat ID kategori
                                                    setOpenDelete(true); // Memunculkan modal
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PAGINATION */}
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-4 py-4 md:flex-row">
                        {/* Info Data Dinamis */}
                        <div className="text-sm text-muted-foreground">
                            Showing{' '}
                            <span className="font-medium text-black">
                                {categories.from || 0}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium text-black">
                                {categories.to || 0}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium text-black">
                                {categories.total || 0}
                            </span>{' '}
                            results
                        </div>

                        {/* Pagination Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
                            {categories.links.map(
                                (link: any, index: number) => {
                                    const isPrevious =
                                        link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');

                                    return (
                                        <Link
                                            key={index}
                                            // Menghindari error 'toString' dengan memberikan string kosong jika url null
                                            href={link.url || '#'}
                                            preserveState
                                            preserveScroll
                                            className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all ${
                                                !link.url
                                                    ? 'pointer-events-none opacity-40'
                                                    : 'cursor-pointer'
                                            } ${
                                                link.active
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'border border-input bg-white text-gray-700 hover:bg-gray-50'
                                            } ${isPrevious || isNext ? 'px-4' : 'min-w-[40px]'} `}
                                        >
                                            {isPrevious
                                                ? 'Previous'
                                                : isNext
                                                  ? 'Next'
                                                  : link.label}
                                        </Link>
                                    );
                                },
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. Modal Konfirmasi Delete */}
            {openDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-[400px] animate-in rounded-lg bg-white p-6 shadow-xl duration-200 fade-in zoom-in">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Are you sure?
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Do you really want to delete this option? This
                                process cannot be undone.
                            </p>
                        </div>

                        <div className="mt-6 flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (isDeleting) return; // Jangan tutup jika sedang menghapus
                                    setOpenDelete(false);
                                    setDeleteId(null);
                                }}
                                className="flex-1"
                                disabled={isDeleting} // Disable tombol cancel saat hapus
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                disabled={isDeleting} // DISABLE TOMBOL DISINI
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Modal Success */}
            {showModal && flash?.success && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md transform animate-in rounded-lg bg-white p-6 shadow-xl duration-200 fade-in zoom-in">
                        <div className="flex flex-col items-center text-center">
                            {/* Icon Success Tambahan (Opsional, agar lebih visual) */}
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>

                            <h2 className="text-xl font-bold text-gray-900">
                                {flash.success.type === 'create'
                                    ? 'Created Successfully'
                                    : flash.success.type === 'update'
                                      ? 'Updated Successfully'
                                      : 'Deleted Successfully'}
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
                                className="w-full bg-green-600 text-white hover:bg-green-700 sm:w-32"
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
