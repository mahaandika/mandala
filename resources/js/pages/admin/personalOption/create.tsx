import { indexPersonalOption } from '@/actions/App/Http/Controllers/PersonalOptionController';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Personal Option',
        href: indexPersonalOption().url,
    },
];

type PersonalisationType = {
    id: number;
    name: string;
};

export default function Index({ types }: { types: PersonalisationType[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        personalization_type_id: number | '';
        is_active: boolean;
    }>({
        name: '',
        personalization_type_id: '',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/personalOption');
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personal Option" />

            <div className="px-4">
                {/* <h1 className="pt-2 pb-3 text-3xl font-semibold">
                    Create Personal Option
                </h1> */}

                <div className="flex space-x-2 text-sm">
                    <Link href={'/admin/personalOption'}>
                        <p className="hover:text-blue-700">Personal Option</p>
                    </Link>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="lucide lucide-chevron-right-icon lucide-chevron-right"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                    <p className="text-slate-700">Create Personal Option</p>
                </div>

                <div className="mt-4 rounded bg-gray-50 px-4 py-5 sm:px-6">
                    <h2 className="mb-5 text-2xl font-semibold md:text-2xl">
                        Create Personal Option Form
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
                                className="w-full rounded-lg border bg-gray-50 p-2.5 text-sm"
                                placeholder="Input personal option name..."
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* TYPE + STATUS */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* TYPE */}
                            <div>
                                <label className="mb-2 block font-medium">
                                    Personalisation Type
                                </label>
                                <select
                                    id="personalisationType"
                                    value={data.personalization_type_id}
                                    onChange={(e) =>
                                        setData(
                                            'personalization_type_id',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
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
                                    className="w-full rounded-lg border bg-gray-50 py-2.5 pl-3 text-sm"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* ACTION */}
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link href="/admin/personalOption">
                                <Button
                                    type="button"
                                    className="border border-black bg-white text-black hover:bg-slate-50"
                                >
                                    Cancel
                                </Button>
                            </Link>

                            <Button type="submit" disabled={processing}>
                                Add Personal Option
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
