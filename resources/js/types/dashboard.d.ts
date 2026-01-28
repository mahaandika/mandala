

export type TableStatus = 'available' | 'reserved';

export interface Reservation {
    booking_id: number;
    customer: string;
    time: string;
    status: string;
    pax: number;
    note?: string;
}

export interface Table {
    id: number;
    name: string;
    capacity: number;
    status: TableStatus;
    position: {
        top: string;
        left: string;
        shape: 'square' | 'circle' | 'small_square' | 'small_circle';
    };
    reservations?: Reservation[];
}

export interface Category {
    id: number;
    name: string;
}

export interface Menu {
    id: number;
    name: string;
    price: number;
    category_id: number;
    image?: string;
    category?: Category;
}

export interface CartItem extends Menu {
    quantity: number;
}