import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ImageIcon, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Menu', href: '/admin/menu' },
    { title: 'Edit Menu', href: '#' },
];

type Category = {
    id: number;
    name: string;
};

type Menu = {
    id: number;
    name: string;
    category_id: number;
    price: string;
    description: string;
    is_active: boolean;
    image: string | null;
};

type PageProps = {
    menu: Menu;
    categories: Category[];
    errors: Record<string, string>;
};

export default function EditMenu() {
    const { menu, categories, errors } = usePage<PageProps>().props;
    const [fileName, setFileName] = useState('Tidak ada file yang dipilih');

    const [form, setForm] = useState({
        name: menu.name,
        category_id: menu.category_id.toString(),
        price: menu.price,
        description: menu.description,
        is_active: menu.is_active,
        image: null as File | null,
    });

    const [preview, setPreview] = useState<string | null>(
        menu.image ? `/storage/menus/${menu.image}` : null,
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(`/admin/menu/${menu.id}`, {
            _method: 'put',
            ...form,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Menu" />

            <div className="px-4">
                <div className="mt-4 rounded bg-gray-50 px-4 py-5">
                    <h2 className="mb-5 text-2xl font-semibold">
                        Edit Menu Form
                    </h2>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* NAME */}
                            <div>
                                <label className="mb-2 block text-base font-medium">
                                    Menu Name
                                </label>
                                <input
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border bg-gray-50 p-2.5 text-sm"
                                    placeholder="Type a menu name..."
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* CATEGORY */}
                            <div>
                                <label className="mb-2 block text-base font-medium">
                                    Category
                                </label>
                                <select
                                    value={form.category_id}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            category_id: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border bg-gray-50 py-2.5 pl-3 text-sm"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.category_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* PRICE */}
                            <div className="relative">
                                <label className="mb-2 block text-base font-medium">
                                    Price
                                </label>
                                <div className="relative mt-1">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">
                                            Rp
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                            form.price === ''
                                                ? ''
                                                : Number(
                                                      form.price,
                                                  ).toLocaleString('id-ID')
                                        }
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(
                                                /\D/g,
                                                '',
                                            );
                                            setForm({ ...form, price: raw });
                                        }}
                                        className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-9 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                {errors.price && (
                                    <p className="mt-1 text-sm font-medium text-red-600">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            {/* STATUS */}
                            <div>
                                <label className="mb-2 block text-base font-medium">
                                    Status
                                </label>
                                <select
                                    value={form.is_active ? '1' : '0'}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            is_active: e.target.value === '1',
                                        })
                                    }
                                    className="w-full rounded-lg border bg-gray-50 py-2.5 pl-3 text-sm"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                                {errors.is_active && (
                                    <p className="mt-1 text-sm font-medium text-red-600">
                                        {errors.is_active}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="mb-2 block text-base font-medium">
                                Description
                            </label>
                            <textarea
                                rows={4}
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full resize-none rounded-lg border bg-gray-50 p-3 text-sm"
                                placeholder="Menu description..."
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm font-medium text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* IMAGE UPLOAD & PREVIEW */}
                        <div>
                            <label className="mb-2 block text-base font-medium">
                                Upload Image
                            </label>

                            {/* File Input Style */}
                            <div className="mb-3 flex items-center rounded-lg border bg-gray-50 p-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="image-edit"
                                    onChange={(e) => {
                                        const file =
                                            e.target.files?.[0] || null;
                                        setForm({ ...form, image: file });
                                        if (file) {
                                            setFileName(file.name); // Pastikan state setFileName ada
                                            setPreview(
                                                URL.createObjectURL(file),
                                            );
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="image-edit"
                                    className="cursor-pointer rounded bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
                                >
                                    Pilih File
                                </label>
                                <span className="ml-3 truncate text-sm text-gray-500">
                                    {fileName || 'No file chosen'}
                                </span>
                            </div>

                            {errors.image && (
                                <p className="mt-2 text-sm font-medium text-red-600">
                                    {errors.image}
                                </p>
                            )}

                            {/* Image Preview Style 100% Like Create */}
                            <div className="space-y-2">
                                <label className="mt-5 text-base font-medium text-gray-700">
                                    Menu Image Preview
                                </label>

                                <div className="group relative mt-3 w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all duration-300 hover:border-primary/50 hover:bg-gray-100/50">
                                    {preview ? (
                                        <div className="relative aspect-video w-full sm:aspect-[21/9]">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="h-full w-full object-contain p-2"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPreview(null);
                                                        setForm({
                                                            ...form,
                                                            image: null,
                                                        });
                                                        setFileName('');
                                                    }}
                                                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-xl hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Remove Image
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                                <ImageIcon className="h-8 w-8" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-medium text-gray-700">
                                                    Upload menu photo
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    Click or drag and drop
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="mt-6 flex gap-4">
                            <Link href="/admin/menu">
                                <Button variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit">Update Menu</Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
