import { indexPersonalType } from '@/actions/App/Http/Controllers/PersonalTypeController';
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
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Personalisation Type',
        href: indexPersonalType().url,
    },
];

type PersonalType = {
    id: number;
    name: string;
    label: string;
    selection_mode: string;
    selection_type: string;
    is_active: boolean;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedPersonalTypes = {
    data: PersonalType[];
    links: PaginationLink[];
};

export default function Index({
    personalTypes,
    filters,
}: {
    personalTypes: PaginatedPersonalTypes;
    filters: {
        search?: string;
        status?: string;
    };
}) {
    const { flash } = usePage().props as any;
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [hasFlash, setHasFlash] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isFirstRender = useRef(true);

    // 1. Logika Flash Message
    useEffect(() => {
        if (flash?.success) {
            setShowModal(true);
            const timer = setTimeout(() => setShowModal(false), 2500);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    // 2. Logika Sinkronisasi Search & Filter yang Aman
    useEffect(() => {
        // Lewati eksekusi pada saat komponen pertama kali dimuat
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Ambil nilai dari URL untuk pengecekan
        const params = new URLSearchParams(window.location.search);
        const urlSearch = params.get('search') || '';
        const urlStatus = params.get('status') || 'all';

        // Jika nilai input sama dengan URL, jangan lakukan apa-apa (mencegah loop)
        if (search === urlSearch && status === urlStatus) return;

        const timeout = setTimeout(() => {
            router.get(
                '/admin/personalType',
                { search, status, page: 1 },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    // PENTING: Jangan jalankan jika sedang ada request lain (seperti update)
                    onBefore: () => !isDeleting,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, status]);

    const handleDelete = () => {
        if (!deleteId) return;

        setIsDeleting(true);
        router.delete(`/admin/personalType/${deleteId}`, {
            // Pastikan case-sensitive-nya benar
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setOpenDelete(false);
                setDeleteId(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personalisation Type" />

            <div className="px-4">
                <h1 className="pt-2 pb-3 text-2xl font-semibold">
                    Personalisation Type
                </h1>

                <div className="rounded-md shadow-md">
                    <div className="flex w-full flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                        {/* Search */}
                        <div className="relative w-full md:max-w-md">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name..."
                                className="bg-slate-50 pl-9"
                            />
                        </div>

                        {/* Right Action */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            {/* Dropdown */}
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none md:w-40"
                            >
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            {/* Button */}
                            <Link href={'/admin/personalType/create'}>
                                <Button className="cursor-pointer">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Personalisation Type
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <Table className="min-w-[520px] table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[140px] px-4 whitespace-normal">
                                        Status
                                    </TableHead>

                                    <TableHead className="w-[260px] px-4 whitespace-normal">
                                        Personalisation Type Name
                                    </TableHead>

                                    <TableHead className="w-[260px] px-4 whitespace-normal">
                                        Description
                                    </TableHead>

                                    <TableHead className="w-[260px] px-4 whitespace-normal">
                                        Selection Mode
                                    </TableHead>

                                    <TableHead className="w-[260px] px-4 whitespace-normal">
                                        Selection Type
                                    </TableHead>

                                    <TableHead className="w-[120px] px-4 text-center whitespace-normal">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {personalTypes.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-6 text-center text-gray-500"
                                        >
                                            No data available
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    personalTypes.data.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className="transition-colors hover:bg-slate-50"
                                        >
                                            <TableCell className="px-4 py-4 break-words whitespace-normal">
                                                {item.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </TableCell>

                                            <TableCell className="px-4 py-4 break-words whitespace-normal">
                                                {item.name}
                                            </TableCell>

                                            <TableCell className="px-4 py-4 break-words whitespace-normal">
                                                {item.label ?? '-'}
                                            </TableCell>

                                            <TableCell className="px-4 py-4 break-words whitespace-normal">
                                                {item.selection_mode}
                                            </TableCell>

                                            <TableCell className="px-4 py-4 break-words whitespace-normal">
                                                {item.selection_type}
                                            </TableCell>

                                            <TableCell className="px-4 py-4 text-center">
                                                <div className="mr-8 flex justify-center gap-2">
                                                    <Link
                                                        href={`/admin/personalType/${item.id}/edit`}
                                                    >
                                                        <Button
                                                            size="sm"
                                                            className="cursor-pointer border border-black bg-white text-black hover:bg-slate-50"
                                                        >
                                                            Edit
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setDeleteId(
                                                                item.id,
                                                            ); // atau personalizationType.id sesuai variabel map Anda
                                                            setOpenDelete(true); // Buka modal konfirmasi kustom Anda
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
                        {/* Container Pagination */}
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-4 py-4 md:flex-row">
                            {/* Info Data Dinamis */}
                            <div className="text-sm text-muted-foreground">
                                Showing{' '}
                                <span className="font-medium text-black">
                                    {(personalTypes as any).from || 0}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium text-black">
                                    {(personalTypes as any).to || 0}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium text-black">
                                    {(personalTypes as any).total || 0}
                                </span>{' '}
                                results
                            </div>

                            {/* Pagination Buttons */}
                            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
                                {personalTypes.links.map((link, index) => {
                                    const isPrevious =
                                        link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');

                                    return (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            preserveState
                                            preserveScroll
                                            className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all ${!link.url ? 'pointer-events-none opacity-40' : 'cursor-pointer'} ${
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
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Modal Success */}
            {showModal && flash?.success && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md transform animate-in rounded-lg bg-white p-6 shadow-xl duration-200 fade-in zoom-in">
                        <div className="flex flex-col items-center text-center">
                            {/* Icon Success */}
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

            {openDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-[400px] animate-in rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold">Are you sure?</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Do you really want to delete this item?
                            </p>
                        </div>
                        <div className="mt-6 flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setOpenDelete(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete} // Memanggil fungsi dengan preserveState
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
