import { Loader2, X } from 'lucide-react';

/* =====================================================
| TYPES
===================================================== */
type PersonalizationOption = {
    id: number;
    name: string;
};

type PersonalizationType = {
    id: number;
    name: string;
    label: string;
    selection_mode: 'include' | 'exclude';
    selection_type: 'single' | 'multiple';
    personalization_options: PersonalizationOption[];
};

interface PersonalizationModalProps {
    show: boolean;
    loading: boolean;
    data: PersonalizationType[];
    selectedIds: number[];
    onToggle: (type: PersonalizationType, optionId: number) => void;
    onSave: () => void;
    onClose?: () => void; // Opsional jika ingin bisa ditutup
}

export default function PersonalizationModal({
    show,
    loading,
    data,
    selectedIds,
    onToggle,
    onSave,
    onClose,
}: PersonalizationModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={() => !loading && onClose && onClose()}
            />

            {/* Modal Body */}
            <div className="no-scrollbar relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-white/10 bg-[#0a1219] p-6 shadow-2xl md:p-10">
                {/* Header */}
                <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="space-y-1">
                        <h2 className="font-serif text-2xl tracking-wide text-white md:text-3xl">
                            Tailor Your Taste
                        </h2>
                        <p className="text-xs text-gray-400 italic">
                            Help us curate the perfect dining experience for
                            you.
                        </p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-500 transition-colors hover:text-[#9c6b3b]"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Content Section */}
                <div className="space-y-12">
                    {data.map((type) => (
                        <section key={type.id}>
                            <div className="mb-4 flex items-center gap-3">
                                <span className="text-[#9c6b3b]">
                                    {type.selection_mode === 'exclude'
                                        ? '⚠️'
                                        : '✨'}
                                </span>
                                <h4 className="text-base font-bold tracking-widest text-white uppercase">
                                    {type.name}
                                </h4>
                            </div>
                            <p className="mb-6 text-sm font-light text-gray-300">
                                {type.label}
                            </p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {type.personalization_options.map((opt) => {
                                    const isSelected = selectedIds.includes(
                                        opt.id,
                                    );
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() =>
                                                onToggle(type, opt.id)
                                            }
                                            disabled={loading}
                                            className={`border px-2 py-3 text-[10px] tracking-widest uppercase transition-all duration-300 ${
                                                isSelected
                                                    ? 'border-[#9c6b3b] bg-[#9c6b3b] text-white shadow-[0_0_15px_rgba(156,107,59,0.2)]'
                                                    : 'border-[#9c6b3b]/30 text-gray-400 hover:border-[#9c6b3b] hover:text-white'
                                            }`}
                                        >
                                            {opt.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Footer Action */}
                <div className="mt-16 border-t border-white/10 pt-8">
                    <button
                        onClick={onSave}
                        disabled={loading || selectedIds.length === 0}
                        className="flex w-full items-center justify-center gap-3 bg-[#9c6b3b] py-5 text-[11px] font-bold tracking-[0.3em] text-white uppercase transition-all hover:bg-[#b07a43] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            'Confirm Preferences'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
