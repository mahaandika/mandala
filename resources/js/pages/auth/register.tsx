import { login } from '@/routes';
import { store } from '@/routes/register';
import { Head, useForm } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function Register() {
    const { data, setData, post, processing, errors, reset, setError } =
        useForm({
            name: '',
            email: '',
            phone: '',
            address: '',
            password: '',
            password_confirmation: '',
        });

    // Di dalam komponen Register
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Reset error phone sebelum validasi ulang
        // agar jika sebelumnya ada error, bisa hilang dulu
        setError('phone', '');

        // 2. Validasi Manual
        if (data.phone && !isValidPhoneNumber(data.phone)) {
            setError(
                'phone',
                'Nomor telepon tidak valid untuk negara yang dipilih',
            );
            return; // Berhenti di sini jika tidak valid
        }

        // 3. Kirim ke Backend jika valid
        post(store().url, {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    {/* Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Phone */}
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <PhoneInput
                            international
                            defaultCountry="ID"
                            value={data.phone}
                            onChange={(value) => setData('phone', value || '')}
                            placeholder="Enter phone number"
                            required
                            // Gunakan containerComponent untuk kontrol penuh atau styling class di bawah
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:ring-1 focus-within:ring-ring focus-within:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    {/* Address */}
                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            type="text"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            required
                            placeholder="Your address"
                        />
                        <InputError message={errors.address} />
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required
                            autoComplete="new-password"
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                            autoComplete="new-password"
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Create account
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={login()}>Log in</TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
