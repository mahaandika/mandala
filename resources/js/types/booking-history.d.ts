export type BookingUser = {
    id: number
    name: string
    email: string
    phone: string
}

export type BookingTable = {
    id: number
    table_name: string
}

export type BookingItem = {
    id: number
    quantity: number
    unit_price: string
    menu: {
        name: string
    }
}


export type Booking = {
    id: number
    booking_date: string
    booking_time: string
    booking_status: 'completed' | 'cancelled' | 'no_show'
    payment_status: string
    total_people: number
    total_price: string
    user: BookingUser
    tables: BookingTable[]
    items: BookingItem[]
}
