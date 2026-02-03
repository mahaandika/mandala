import { Table } from '@/types/dashboard';
import { Utensils } from 'lucide-react';

interface TableMapProps {
    tables: Table[];
    pickingMode: boolean;
    selectedTableIds: number[];
    onTableClick: (table: Table) => void;
    getAvailability: (table: Table) => { status: string; until?: string };
}

export default function TableMapDashboard({
    tables,
    pickingMode,
    selectedTableIds,
    onTableClick,
    getAvailability,
}: TableMapProps) {
    return (
        <div className="custom-scrollbar relative w-full overflow-x-auto rounded-xl border border-slate-300 bg-slate-200 p-4 shadow-inner">
            {pickingMode && (
                <div className="sticky top-0 left-0 z-50 mb-4 w-fit animate-in rounded-lg border-2 border-black bg-yellow-400 px-4 py-2 text-black shadow-lg fade-in slide-in-from-top-2">
                    <p className="flex items-center gap-2 text-xs font-black tracking-wide uppercase">
                        <Utensils size={14} /> Mode Pilih Meja
                    </p>
                </div>
            )}

            <div
                className="relative mx-auto rounded-sm border border-slate-300 bg-slate-100 shadow-md transition-all"
                style={{
                    minWidth: '800px',
                    aspectRatio: '16/10',
                    width: '100%',
                }}
            >
                {/* --- ELEMEN DEKORASI --- */}
                <div className="absolute top-[2%] left-[2%] z-10 flex flex-col gap-2">
                    <div className="rounded border-2 border-slate-800 bg-white px-4 py-6 text-[10px] font-bold tracking-tighter text-slate-900 uppercase shadow-sm">
                        Bar & Cashier
                    </div>
                    <div className="vertical-text rounded border-2 border-slate-800 bg-white px-1 py-4 text-center text-[9px] font-bold text-slate-900 shadow-sm">
                        Hand Wash
                    </div>
                </div>
                <div className="absolute top-[65%] left-4 text-[11px] font-black tracking-[0.2em] text-slate-900 uppercase italic">
                    Indoor Area
                </div>
                <div className="absolute top-[70%] left-0 h-[2px] w-[40%] bg-slate-400"></div>
                <div className="absolute top-[70%] left-[50%] h-[2px] w-[25%] bg-slate-400"></div>
                <div className="absolute bottom-[25%] left-4 text-[11px] font-black tracking-[0.2em] text-slate-900 uppercase italic">
                    Outdoor Area
                </div>
                {/* ----------------------- */}

                {tables.map((table) => {
                    const pos = table.position;
                    const bookingCount = table.reservations?.length || 0;

                    const { status, until } = getAvailability(table);
                    const isSelected = selectedTableIds.includes(table.id);
                    const isSmall =
                        pos.shape === 'small_circle' ||
                        pos.shape === 'small_square';

                    let bgColor = 'bg-white';
                    let borderColor = 'border-slate-900';
                    let textColor = 'text-slate-900';

                    if (status === 'occupied') {
                        bgColor = 'bg-red-600';
                        borderColor = 'border-red-800';
                        textColor = 'text-white';
                    } else if (status === 'reserved_soon') {
                        bgColor = 'bg-orange-500';
                        borderColor = 'border-orange-700';
                        textColor = 'text-white';
                    } else if (status === 'available_gap') {
                        bgColor = 'bg-lime-300';
                        borderColor = 'border-lime-600';
                        textColor = 'text-slate-900';
                    }

                    if (isSelected) {
                        bgColor = 'bg-yellow-400';
                        borderColor = 'border-yellow-700';
                        textColor = 'text-black';
                    }

                    return (
                        <div
                            key={table.id}
                            onClick={() => onTableClick(table)}
                            style={{ top: pos.top, left: pos.left }}
                            className={`group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${status !== 'available' ? 'scale-100 hover:scale-110' : 'hover:scale-105'} ${isSelected ? 'z-20 scale-110' : ''}`}
                        >
                            {bookingCount > 0 && (
                                <div className="absolute -top-1 -right-1 z-20 flex h-5 w-5 animate-in items-center justify-center rounded-full border border-white bg-red-600 text-[10px] font-bold text-white shadow-sm zoom-in">
                                    {bookingCount}
                                </div>
                            )}
                            {isSelected && (
                                <div className="absolute -top-3 -left-3 z-30 flex h-6 w-6 animate-bounce items-center justify-center rounded-full border-2 border-black bg-yellow-400 text-black shadow-sm">
                                    ✓
                                </div>
                            )}

                            <div
                                className={`relative flex items-center justify-center border-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] ${bgColor} ${borderColor} ${textColor} ${pos.shape.includes('circle') ? 'h-14 w-14 rounded-full' : pos.shape === 'square' ? 'h-12 w-16 rounded-md' : 'h-11 w-11 rounded-sm'}`}
                            >
                                <div className="flex flex-col items-center leading-none">
                                    <span className="text-[10px] font-bold">
                                        {table.name}
                                    </span>
                                    {status === 'available_gap' &&
                                        !isSelected && (
                                            <span className="mt-0.5 rounded bg-black/10 px-1 font-mono text-[7px]">
                                                -{until}
                                            </span>
                                        )}
                                    {status === 'reserved_soon' &&
                                        !isSelected && (
                                            <span className="mt-0.5 rounded bg-black/20 px-1 font-mono text-[7px] text-white">
                                                SOON
                                            </span>
                                        )}
                                </div>
                                <div
                                    className={`absolute -top-2 left-1/2 h-2 w-4 -translate-x-1/2 rounded-t-sm border-x border-t border-slate-900 ${status === 'occupied' ? 'bg-orange-700' : 'bg-slate-800'}`}
                                />
                                <div
                                    className={`absolute -bottom-2 left-1/2 h-2 w-4 -translate-x-1/2 rounded-b-sm border-x border-b border-slate-900 ${status === 'occupied' ? 'bg-orange-700' : 'bg-slate-800'}`}
                                />
                                {!isSmall && (
                                    <>
                                        <div
                                            className={`absolute top-1/2 -left-2 h-4 w-2 -translate-y-1/2 rounded-l-sm border-y border-l border-slate-900 ${status === 'occupied' ? 'bg-orange-700' : 'bg-slate-800'}`}
                                        />
                                        <div
                                            className={`absolute top-1/2 -right-2 h-4 w-2 -translate-y-1/2 rounded-r-sm border-y border-r border-slate-900 ${status === 'occupied' ? 'bg-orange-700' : 'bg-slate-800'}`}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                <div className="absolute right-[30%] bottom-[5%] flex min-w-[150px] items-center justify-center rounded border-2 border-slate-800 bg-white p-8 text-[11px] font-black text-slate-900 uppercase shadow-md md:bottom-[8%] lg:right-[35%] lg:bottom-[12%]">
                    Receptionist
                </div>
            </div>
        </div>
    );
}
