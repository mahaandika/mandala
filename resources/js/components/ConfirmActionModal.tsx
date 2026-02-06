import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';

interface Props {
    title: string;
    description: string;
    confirmText: string;
    actionUrl: string;
    confirmColor?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ConfirmActionModal({
    title,
    description,
    confirmText,
    actionUrl,
    confirmColor = 'bg-red-600 hover:bg-red-700',
    onClose,
    onSuccess,
}: Props) {
    const { post, processing } = useForm({});

    const submit = () => {
        post(actionUrl, {
            onSuccess: () => {
                onClose(); // tutup confirm modal
                onSuccess?.(); // 🔥 tutup modal parent
            },
        });
    };

    return (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="mb-4 text-sm text-gray-600">{description}</p>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button
                        disabled={processing}
                        className={confirmColor}
                        onClick={submit}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
