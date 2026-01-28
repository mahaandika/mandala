import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

type PersonalisationType = {
    id: number;
    name: string;
};

type PersonalOption = {
    id: number;
    name: string;
    personalization_type_id: number;
    is_active: boolean;
};

export default function Edit({
    personalOption,
    types,
}: {
    personalOption: PersonalOption;
    types: PersonalisationType[];
}) {
    // 1. Masukkan data lama (personalOption) ke dalam form state
    const { data, setData, put, processing, errors } = useForm({
        name: personalOption.name || '',
        personalization_type_id: personalOption.personalization_type_id || '',
        is_active: personalOption.is_active,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Personalisation Option', href: '/admin/personalOption' },
        { title: 'Edit Personal Option', href: '#' },
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // 2. Gunakan method PUT untuk update
        put(`/admin/personalOption/${personalOption.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Personal Option" />
            <div className="px-4">
                <div className="flex space-x-2 text-sm">
                    <Link href={'/admin/personalOption'}>
                        <p className="hover:text-blue-700">Personal Option</p>
                    </Link>
                    <span className="text-gray-400">/</span>
                    <p className="text-slate-700">Edit Personal Option</p>
                </div>

                <div className="mt-4 rounded bg-gray-50 px-4 py-5 sm:px-6">
                    <h2 className="mb-5 text-2xl font-semibold">
                        Edit Personal Option Form
                    </h2>

                    <form onSubmit={submit} className="space-y-4">
                        {/* NAME */}
                        <div>
                            <label className="mb-2 block font-medium">
                                Personal Option Name
                            </label>
                            <input
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="w-full rounded-lg border bg-white p-2.5 text-sm"
                                placeholder="Input name..."
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* TYPE */}
                            <div>
                                <label className="mb-2 block font-medium">
                                    Personalisation Type
                                </label>
                                <select
                                    value={data.personalization_type_id}
                                    onChange={(e) =>
                                        setData(
                                            'personalization_type_id',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 text-sm"
                                >
                                    <option value="">Select type</option>
                                    {types.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.personalization_type_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.personalization_type_id}
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
                                    }
                                    className="w-full rounded-lg border bg-white py-2.5 pl-3 text-sm"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link href="/admin/personalOption">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Updating...'
                                    : 'Update Personal Option'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
