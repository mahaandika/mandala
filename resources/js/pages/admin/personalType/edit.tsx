import { indexPersonalType } from '@/actions/App/Http/Controllers/PersonalTypeController';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Personalisation Type',
        href: indexPersonalType().url,
    },
];

export default function Edit({ personalType }: any) {
    const { data, setData, put, processing, errors } = useForm({
        // Tambahkan || '' agar TypeScript yakin ini adalah string
        name: personalType?.name || '',
        label: personalType?.label || '',
        selection_mode: personalType?.selection_mode || 'include',
        selection_type: personalType?.selection_type || 'single',
        is_active: personalType?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/personalType/${personalType.id}`, {
            // Memaksa Inertia tidak menyimpan state halaman edit
            // agar saat kembali ke index, data benar-benar fresh
            preserveState: false,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Personalisation Type" />

            <div className="px-4">
                {/* breadcrumb manual */}
                <div className="flex items-center space-x-2 text-sm">
                    <Link
                        href="/admin/personalType"
                        className="hover:text-blue-700"
                    >
                        Personalisation Type
                    </Link>
                    <span>/</span>
                    <span className="text-slate-700">Edit</span>
                </div>

                <div className="mt-4 rounded bg-gray-50 px-4 py-5 sm:px-6">
                    <h2 className="mb-5 text-2xl font-semibold">
                        Edit Personalisation Type Form
                    </h2>

                    <form onSubmit={submit} className="space-y-4">
                        {/* ROW 1 */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* NAME */}
                            <div>
                                <label className="mb-2 block font-medium">
                                    Personalisation Type Name
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-lg border bg-gray-50 p-2.5 text-sm"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* STATUS */}
                            <div>
                                <label className="mb-2 block font-medium">
                                    Status
                                </label>
                                <select
                                    value={
                                        data.is_active ? 'active' : 'inactive'
                                    }
                                    onChange={(e) =>
                                        setData(
                                            'is_active',
                                            e.target.value === 'active',
                                        )
                                    } // Cukup 2 argumen
                                    className="w-full rounded-lg border bg-gray-50 py-2.5 pl-3 text-sm"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* ROW 2 */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* MODE */}
                            <div>
                                <label className="mb-2 block font-medium">
                                    Selection Mode
                                </label>
                                <select
                                    value={data.selection_mode}
                                    onChange={(e) =>
                                        setData(
                                            'selection_mode',
                                            e.target.value,
                                        )
                                    } // Cukup 2 argumen
                                    className="w-full rounded-lg border bg-gray-50 py-2.5 pl-3 text-sm"
                                >
                                    <option value="include">Include</option>
                                    <option value="exclude">Exclude</option>
                                </select>
                            </div>

                            {/* TYPE */}
                            <div>
                                <label className="mb-2 block font-medium">
                                    Selection Type
                                </label>
                                <select
                                    value={data.selection_type}
                                    onChange={(e) =>
                                        setData(
                                            'selection_type',
                                            e.target.value,
                                        )
                                    } // Cukup 2 argumen
                                    className="w-full rounded-lg border bg-gray-50 py-2.5 pl-3 text-sm"
                                >
                                    <option value="single">Single</option>
                                    <option value="multiple">Multiple</option>
                                </select>
                            </div>
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="mb-2 block font-medium">
                                Description
                            </label>
                            <textarea
                                rows={4}
                                value={data.label}
                                onChange={(e) =>
                                    setData('label', e.target.value)
                                }
                                className="w-full resize-none rounded-lg border bg-gray-50 p-3 text-sm"
                            />
                            {errors.label && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.label}
                                </p>
                            )}
                        </div>

                        {/* ACTION */}
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link href="/admin/personalType">
                                <Button
                                    type="button"
                                    className="w-full border border-black bg-white text-black hover:bg-slate-50 sm:w-auto"
                                >
                                    Cancel
                                </Button>
                            </Link>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto"
                            >
                                Update Personalisation Type
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
