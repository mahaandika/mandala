export interface BookingDetail {
    id: number;
    customer_name: string;
    customer_phone?: string;
    booking_code: string;
    booking_date: string;
    booking_time: string;

    status: 'pending' | 'reserve' | 'seated' | 'completed' | 'cancelled' | 'no_show';

    tables: {
        id: number;
        name: string;
        capacity: number;
    }[];

    items: {
        id: number;
        name: string;
        qty: number;
        price: number;
        subtotal: number;
    }[];

    total_price: number;

    checkin_time?: string;
    checkout_time?: string;
}