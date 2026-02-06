<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $booking->booking_code }}</title>

    <style>
        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.4;
        }

        .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #444;
            padding-bottom: 15px;
        }

        .header h1 {
            margin: 0;
            font-size: 22px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .header p {
            margin: 2px 0;
            font-size: 11px;
            color: #666;
        }

        .info-table {
            width: 100%;
            margin-bottom: 25px;
            border-collapse: collapse;
        }

        .info-table td {
            padding: 4px 0;
        }

        .label {
            font-weight: bold;
            width: 90px;
            color: #555;
        }

        .section-header {
            margin-top: 20px;
            padding: 6px 10px;
            background: #f0f0f0;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            border-top: 1px solid #ccc;
            border-bottom: 1px solid #ccc;
        }

        .section-tag {
            float: right;
            font-size: 10px;
            font-weight: normal;
            color: #666;
            text-transform: none;
        }

        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 11px;
            table-layout: fixed; /* Menjaga lebar kolom tetap konsisten */
        }

        table.items th {
            padding: 8px 5px;
            border-bottom: 1px solid #999;
        }

        table.items td {
            padding: 6px 5px;
            border-bottom: 1px solid #eee;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }

        .summary-container {
            margin-top: 30px;
            width: 100%;
            display: table;
        }

        .summary-left {
            display: table-cell;
            width: 55%;
            vertical-align: top;
            padding-right: 20px;
        }

        .summary-right {
            display: table-cell;
            width: 45%;
            vertical-align: top;
        }

        .payment-box {
            border: 1px dashed #aaa;
            padding: 10px;
            background: #fafafa;
            font-size: 10px;
        }

        .payment-title {
            font-weight: bold;
            border-bottom: 1px dashed #ccc;
            padding-bottom: 5px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .payment-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }

        .total-table {
            width: 100%;
            border-collapse: collapse;
        }

        .total-table td {
            padding: 4px 0;
            text-align: right;
        }

        .total-label {
            color: #666;
        }

        .total-val {
            font-weight: bold;
        }

        .grand-total-row td {
            border-top: 2px solid #333;
            padding-top: 10px;
            font-size: 14px;
            font-weight: bold;
        }

        .status-badge {
            display: inline-block;
            margin-top: 8px;
            padding: 4px 8px;
            font-size: 10px;
            font-weight: bold;
            border-radius: 4px;
            color: #fff;
            background: #22c55e;
        }

        .status-pending {
            background: #f97316;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 9px;
            color: #aaa;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }
    </style>
</head>
<body>

{{-- HEADER --}}
<div class="header">
    <h1>Mandala Restaurant</h1>
    <p>Jalan Raya Contoh No.123, Bali</p>
    <p>Phone: (0361) 123-4567</p>
</div>

{{-- BOOKING INFO --}}
<table class="info-table">
    <tr>
        <td class="label">Customer</td>
        <td>{{ $booking->user->name ?? 'Walk-In Customer' }}</td>

        <td class="label">Invoice</td>
        <td>#{{ $booking->booking_code }}</td>
    </tr>
    <tr>
        <td class="label">Date</td>
        <td>{{ \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') }}</td>

        <td class="label">Time</td>
        <td>{{ $booking->booking_time }}</td>
    </tr>
    <tr>
        <td class="label">Table</td>
        <td>
            @foreach($booking->tables as $table)
                {{ $table->table_name }}@if(!$loop->last), @endif
            @endforeach
        </td>

        <td class="label">Pax</td>
        <td>{{ $booking->total_people }} Persons</td>
    </tr>
</table>

{{-- ONLINE ORDERS --}}
@if($onlineItems->isNotEmpty())
<div class="section-header">
    Online Orders
    <span class="section-tag">(Paid via App)</span>
</div>

<table class="items">
    <thead>
        <tr>
            <th width="45%" class="text-left">Item</th>
            <th width="20%" class="text-right">Price</th>
            <th width="10%" class="text-center">Qty</th>
            <th width="25%" class="text-right">Amount</th>
        </tr>
    </thead>
    <tbody>
        @foreach($onlineItems as $item)
        <tr>
            <td class="text-left">{{ $item->menu->name }}</td>
            <td class="text-right">{{ number_format($item->unit_price,0,',','.') }}</td>
            <td class="text-center">{{ $item->quantity }}</td>
            <td class="text-right">{{ number_format($item->subtotal,0,',','.') }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

{{-- WALK-IN ORDERS --}}
@if($walkInItems->isNotEmpty())
<div class="section-header">
    Walk-In Orders
    <span class="section-tag">(Additional Orders)</span>
</div>

<table class="items">
    <thead>
        <tr>
            <th width="45%" class="text-left">Item</th>
            <th width="20%" class="text-right">Price</th>
            <th width="10%" class="text-center">Qty</th>
            <th width="25%" class="text-right">Amount</th>
        </tr>
    </thead>
    <tbody>
        @foreach($walkInItems as $item)
        <tr>
            <td class="text-left">{{ $item->menu->name }}</td>
            <td class="text-right">{{ number_format($item->unit_price,0,',','.') }}</td>
            <td class="text-center">{{ $item->quantity }}</td>
            <td class="text-right">{{ number_format($item->subtotal,0,',','.') }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

{{-- SUMMARY --}}
<div class="summary-container">
    <div class="summary-left">
        <div class="payment-box">
            <div class="payment-title">Payment Details</div>

            @if($totalOnline > 0)
            <div class="payment-row">
                <span>Online Payment</span>
                <strong>Rp {{ number_format($totalOnline,0,',','.') }}</strong>
            </div>
            @endif

            @if($payment)
            <div class="payment-row">
                <span>Walk-In ({{ ucfirst($payment->payment_method) }})</span>
                <strong>Rp {{ number_format($payment->total_amount,0,',','.') }}</strong>
            </div>

            @if($payment->payment_method === 'cash')
            <div style="font-size:9px;text-align:right;color:#666;">
                Cash: {{ number_format($payment->amount_tendered,0,',','.') }} |
                Change: {{ number_format($payment->change_amount,0,',','.') }}
            </div>
            @endif
            @endif
        </div>
    </div>

    <div class="summary-right">
        <table class="total-table">
            @if($totalOnline > 0)
            <tr>
                <td class="total-label">Subtotal Online</td>
                <td class="total-val">Rp {{ number_format($totalOnline,0,',','.') }}</td>
            </tr>
            @endif

            @if($totalWalkIn > 0)
            <tr>
                <td class="total-label">Subtotal Walk-In</td>
                <td class="total-val">Rp {{ number_format($totalWalkIn,0,',','.') }}</td>
            </tr>
            @endif

            <tr class="grand-total-row">
                <td>GRAND TOTAL</td>
                <td>Rp {{ number_format($booking->total_price,0,',','.') }}</td>
            </tr>

            <tr>
                <td colspan="2">
                    @if($booking->payment_status === 'success')
                        <span class="status-badge">PAID IN FULL</span>
                    @else
                        <span class="status-badge status-pending">PAYMENT PENDING</span>
                    @endif
                </td>
            </tr>
        </table>
    </div>
</div>

<div class="footer">
    <p>Thank you for your visit</p>
    <p>Printed on {{ now()->format('d F Y H:i') }}</p>
</div>

</body>
</html>