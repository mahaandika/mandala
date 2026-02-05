import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { Head, useForm } from '@inertiajs/react';

interface VerifyProps {
    id: string;
    hash: string;
    status?: string;
}

export default function VerifyEmail({ id, hash, status }: VerifyProps) {
    const { post, processing } = useForm();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Menggunakan string template manual ke path Laravel
        post(`/email/verification-notification/${id}`);
    };

    return (
        <AuthLayout
            title="Verify email"
            description="Thanks for signing up! Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded border border-green-200 bg-green-50 p-2 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to your email address.
                </div>
            )}

            <div className="flex flex-col items-center gap-4">
                <form onSubmit={submit} className="w-full">
                    <Button
                        disabled={processing}
                        variant="default"
                        className="w-full"
                    >
                        {processing && <Spinner className="mr-2" />}
                        Resend verification email
                    </Button>
                </form>

                <TextLink
                    href={login()}
                    className="text-sm text-muted-foreground hover:text-primary"
                >
                    Back to Login
                </TextLink>
            </div>
        </AuthLayout>
    );
}
