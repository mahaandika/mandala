import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Employee {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    role: 'cashier' | 'receptionist';
    status: 'active' | 'inactive';
}

interface Props {
    employees: Employee[];
}

export default function EmployeeManagement({ employees }: Props) {
    const { flash }: any = usePage().props;

    // UI State
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [openToggle, setOpenToggle] = useState(false);
    const [toggleId, setToggleId] = useState<number | null>(null);
    const [isToggling, setIsToggling] = useState(false);

    // Setup Inertia Form
    const { data, setData, post, put, reset, errors, clearErrors, processing } =
        useForm({
            name: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            role: 'receptionist',
            status: 'active',
        });

    // Otomatis munculkan modal jika ada flash success dari Laravel
    useEffect(() => {
        if (flash?.success) {
            setShowSuccessModal(true);
            const timer = setTimeout(() => setShowSuccessModal(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Fungsi untuk mereset dan menutup form modal
    const closeFormModal = () => {
        setShowForm(false);
        setIsEditing(false);
        setEditId(null);
        reset();
        clearErrors();
    };

    const openCreate = () => {
        closeFormModal(); // Pastikan bersih sebelum buka
        setShowForm(true);
    };

    const openEdit = (emp: Employee) => {
        closeFormModal(); // Bersihkan state sebelumnya
        setIsEditing(true);
        setEditId(emp.id);
        setData({
            name: emp.name,
            email: emp.email,
            password: '', // Kosongkan saat edit
            phone: emp.phone || '',
            address: emp.address || '',
            role: emp.role,
            status: emp.status,
        });
        setShowForm(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && editId) {
            put(`/admin/employee/${editId}`, {
                onSuccess: () => closeFormModal(),
            });
        } else {
            post('/admin/employee', {
                onSuccess: () => closeFormModal(),
            });
        }
    };

    // Fungsi konfirmasi Toggle Status
    const handleToggleStatus = () => {
        if (!toggleId) return;

        setIsToggling(true);
        router.delete(`/admin/employee/${toggleId}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setOpenToggle(false);
                setToggleId(null);
                setIsToggling(false);
            },
            onError: () => setIsToggling(false),
            onFinish: () => setIsToggling(false),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Employees', href: '/admin/employee' }]}
        >
            <Head title="Employee Management" />

            <div className="px-4">
                <h1 className="pt-2 pb-3 text-2xl font-semibold">Employees</h1>

                <div className="rounded-md border bg-white p-4 shadow-md">
                    <div className="mb-4 flex w-full items-center justify-between">
                        <h2 className="text-lg font-medium">Employee List</h2>
                        <Button
                            onClick={openCreate}
                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Employee
                        </Button>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map((emp) => (
                                    <TableRow key={emp.id}>
                                        <TableCell>
                                            <div className="font-medium text-gray-900">
                                                {emp.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {emp.email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-700 capitalize">
                                            {emp.role}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                            >
                                                {emp.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="space-x-2 text-center">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEdit(emp)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={
                                                    emp.status === 'active'
                                                        ? 'destructive'
                                                        : 'default'
                                                }
                                                onClick={() => {
                                                    setToggleId(emp.id);
                                                    setOpenToggle(true);
                                                }}
                                            >
                                                {emp.status === 'active'
                                                    ? 'Set Inactive'
                                                    : 'Set Active'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {employees.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center text-gray-500"
                                        >
                                            No employees found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modal Form: Create / Edit */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="max-h-[90vh] w-full max-w-2xl animate-in overflow-y-auto rounded-lg bg-white p-6 shadow-xl duration-200 fade-in zoom-in">
                        <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">
                            {isEditing ? 'Edit Employee' : 'Create Employee'}
                        </h2>
                        <form
                            onSubmit={submit}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2"
                        >
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.name && (
                                    <span className="text-sm text-red-500">
                                        {errors.name}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.email && (
                                    <span className="text-sm text-red-500">
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Password{' '}
                                    {isEditing && (
                                        <span className="text-xs font-normal text-gray-500">
                                            (Leave empty to keep current)
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.password && (
                                    <span className="text-sm text-red-500">
                                        {errors.password}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Phone
                                </label>
                                <input
                                    type="number"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) =>
                                        setData('role', e.target.value as any)
                                    }
                                    className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="receptionist">
                                        Receptionist
                                    </option>
                                    <option value="cashier">Cashier</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) =>
                                        setData('status', e.target.value as any)
                                    }
                                    className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="mt-4 flex justify-end space-x-2 border-t pt-4 md:col-span-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeFormModal} // Menggunakan fungsi close yang membersihkan state
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    {processing ? 'Saving...' : 'Save Employee'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Toggle Status */}
            {openToggle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-[400px] animate-in rounded-lg bg-white p-6 shadow-xl duration-200 fade-in zoom-in">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Confirm Action
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Are you sure you want to change this employee's
                                status?
                            </p>
                        </div>
                        <div className="mt-6 flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (isToggling) return;
                                    setOpenToggle(false);
                                    setToggleId(null);
                                }}
                                className="flex-1"
                                disabled={isToggling}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleToggleStatus}
                                className="flex-1 bg-yellow-600 text-white hover:bg-yellow-700"
                                disabled={isToggling}
                            >
                                {isToggling
                                    ? 'Processing...'
                                    : 'Yes, Change Status'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Success */}
            {showSuccessModal && flash?.success && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md transform animate-in rounded-lg bg-white p-6 shadow-xl duration-200 fade-in zoom-in">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Success!
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                {typeof flash.success === 'object'
                                    ? flash.success.message
                                    : flash.success}
                            </p>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={() => setShowSuccessModal(false)}
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
