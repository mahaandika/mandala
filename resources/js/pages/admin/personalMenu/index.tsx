import { indexPersonalMenu } from '@/actions/App/Http/Controllers/PersonalMenuController';
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
import { CheckCircle2, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

// --- DEFINE TYPES AT THE TOP ---
type PersonalizationType = {
    id: number;
    name: string;
    label: string;
    selection_mode: string;
};

type PersonalizationOption = {
    id: number;
    personalization_type_id: number;
    name: string;
    personalization_type: PersonalizationType;
};

type Menu = {
    id: number;
    name: string;
    personalization_options: PersonalizationOption[];
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedData<T> = {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Personalisation Menu',
        href: indexPersonalMenu().url,
    },
];

const groupByType = (options: PersonalizationOption[]) => {
    return options.reduce((acc: Record<string, string[]>, opt) => {
        const typeName = opt.personalization_type.name;
        acc[typeName] ??= [];
        acc[typeName].push(opt.name);
        return acc;
    }, {});
};

export default function Index({
    menus,
    filters,
}: {
    menus: PaginatedData<Menu>;
    filters: { search?: string };
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const { flash } = usePage().props as any;

    const [showModal, setShowModal] = useState(false);
    const [hasFlash, setHasFlash] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setShowModal(true);

            // Atur waktu agar modal hilang otomatis (misal: 3000ms = 3 detik)
            const timer = setTimeout(() => {
                setShowModal(false);
            }, 2500);

            // Bersihkan timer jika komponen di-unmount atau flash berubah
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Perbaikan Logika Search & Route
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Gunakan path string langsung atau route() jika menggunakan Ziggy
            router.get(
                '/admin/personalMenu',
                { search: search },
                {
                    preserveState: true,
                    replace: true,
                    only: ['menus'], // Hanya refresh data menus saja (lebih ringan)
                },
            );
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personalisation Menu" />

            <div className="px-4">
                <h1 className="pt-2 pb-3 text-2xl font-semibold">
                    Personalisation Menu
                </h1>

                <div className="rounded-md bg-white shadow-md">
                    <div className="flex w-full flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative w-full md:max-w-md">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name..."
                                className="bg-slate-50 pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <Link href={'/admin/personalMenu/create'}>
                            <Button className="w-full cursor-pointer md:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Personalisation Menu
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <Table className="min-w-[520px] table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[260px] px-4">
                                        Menu Name
                                    </TableHead>
                                    <TableHead className="w-[140px] px-4">
                                        Personalisation Option
                                    </TableHead>
                                    <TableHead className="w-[120px] px-4 text-center">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {menus.data.length > 0 ? (
                                    menus.data.map((menu) => (
                                        <TableRow key={menu.id}>
                                            <TableCell className="font-medium">
                                                {menu.name}
                                            </TableCell>
                                            <TableCell>
                                                {Object.entries(
                                                    groupByType(
                                                        menu.personalization_options,
                                                    ),
                                                ).map(([type, names]) => (
                                                    <div
                                                        key={type}
                                                        className="text-sm"
                                                    >
                                                        <span className="font-semibold">
                                                            {type}:
                                                        </span>{' '}
                                                        {names.join(', ')}
                                                    </div>
                                                ))}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Link
                                                    href={`/admin/personalMenu/${menu.id}/edit`}
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        Edit
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No menus found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-wrap items-center justify-center gap-2 border-t p-4 md:justify-end">
                        {menus.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                preserveState
                                preserveScroll
                                className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all ${!link.url ? 'pointer-events-none opacity-40' : 'cursor-pointer'} ${link.active ? 'bg-blue-600 text-white shadow-sm' : 'border border-input bg-white text-gray-700 hover:bg-gray-50'} ${link.label.includes('Previous') || link.label.includes('Next') ? 'px-4' : 'min-w-[40px]'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
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
                                {/* Cek isi pesan atau properti type untuk menentukan judul */}
                                {flash.success?.type === 'create' ||
                                (typeof flash.success === 'string' &&
                                    flash.success
                                        .toLowerCase()
                                        .includes('created'))
                                    ? 'Created Successfully'
                                    : flash.success?.type === 'update' ||
                                        (typeof flash.success === 'string' &&
                                            flash.success
                                                .toLowerCase()
                                                .includes('updated'))
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
