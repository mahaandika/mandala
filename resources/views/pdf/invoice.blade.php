<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Struk #{{ $booking->booking_code }}</title>
    <style>
        /* Ukuran Kertas 80mm */
        @page {
            margin: 0;
        }
        
        body {
            font-family: 'Courier', Helvetica, Arial, sans-serif; /* Font Courier lebih cocok untuk struk */
            font-size: 11px;
            line-height: 1.3;
            color: #000;
            margin: 10px auto; /* Margin kecil di dalam kertas */
            width: 70mm; /* Sedikit lebih kecil dari 80mm agar tidak terpotong */
        }

        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .bold { font-weight: bold; }

        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
        }

        .header h1 {
            margin: 0;
            font-size: 16px;
            text-transform: uppercase;
        }

        .header p {
            margin: 2px 0;
            font-size: 10px;
        }

        .info-table {
            width: 100%;
            margin-bottom: 10px;
            font-size: 10px;
        }

        .section-header {
            margin-top: 10px;
            padding: 3px 0;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            font-size: 10px;
        }

        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }

        table.items th {
            border-bottom: 1px dashed #000;
            padding: 5px 0;
        }

        table.items td {
            padding: 5px 0;
            vertical-align: top;
        }

        .line {
            border-top: 1px dashed #000;
            margin: 8px 0;
        }

        /* Karena lebar sempit, summary dibuat Full Width (tidak berdampingan) */
        .summary {
            width: 100%;
            margin-top: 10px;
        }

        .total-row td {
            padding: 2px 0;
        }

        .grand-total {
            font-size: 14px;
            border-top: 1px double #000;
            border-bottom: 1px double #000;
            padding: 5px 0;
            margin-top: 5px;
        }

        .payment-info {
            margin-top: 10px;
            font-size: 10px;
            background: #f9f9f9;
            padding: 5px;
            border: 1px solid #eee;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
        }
    </style>
</head>
<body>

<div class="header">
    <h1>Mandala Restaurant</h1>
    <p>Jalan Pratama. 55X, Tanjung Benoa, Bali</p>
    <p>0813-2550-5561</p>
</div>

{{-- INFO SINGKAT --}}
<table class="info-table">
    <tr>
        <td>No: #{{ $booking->booking_code }}</td>
        <td class="text-right">{{ \Carbon\Carbon::parse($booking->booking_date)->format('d/m/y') }}</td>
    </tr>
    <tr>
        <td>Cust: {{ Str::limit($booking->user->name ?? 'Walk-In', 15) }}</td>
        <td class="text-right">{{ $booking->booking_time }}</td>
    </tr>
    <tr>
        <td>Table: 
            @foreach($booking->tables as $table)
                {{ $table->table_name }}{{ !$loop->last ? ',' : '' }}
            @endforeach
        </td>
        <td class="text-right">Pax: {{ $booking->total_people }}</td>
    </tr>
</table>

{{-- ITEMS --}}
<table class="items">
    <thead>
        <tr class="text-left">
            <th width="50%">Menu</th>
            <th width="15%" class="text-center">Qty</th>
            <th width="35%" class="text-right">Total</th>
        </tr>
    </thead>
    <tbody>
        {{-- Gabungkan Online & Walk-in jika ingin lebih ringkas, atau pisah seperti di bawah --}}
        @foreach($onlineItems as $item)
        <tr>
            <td>{{ $item->menu->name }} (Online)</td>
            <td class="text-center">{{ $item->quantity }}</td>
            <td class="text-right">{{ number_format($item->subtotal,0,',','.') }}</td>
        </tr>
        @endforeach

        @foreach($walkInItems as $item)
        <tr>
            <td>{{ $item->menu->name }}</td>
            <td class="text-center">{{ $item->quantity }}</td>
            <td class="text-right">{{ number_format($item->subtotal,0,',','.') }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<div class="line"></div>

{{-- SUMMARY --}}
<table class="summary">
    @if($totalOnline > 0)
    <tr class="total-row">
        <td>Subtotal Online</td>
        <td class="text-right">Rp {{ number_format($totalOnline,0,',','.') }}</td>
    </tr>
    @endif
    
    @if($totalWalkIn > 0)
    <tr class="total-row">
        <td>Subtotal Walk-In</td>
        <td class="text-right">Rp {{ number_format($totalWalkIn,0,',','.') }}</td>
    </tr>
    @endif

    <tr class="grand-total bold">
        <td>TOTAL</td>
        <td class="text-right">Rp {{ number_format($booking->total_price,0,',','.') }}</td>
    </tr>
</table>

{{-- DETAIL PEMBAYARAN --}}
<div class="payment-info">
    <div class="bold">Payment Status: {{ strtoupper($booking->payment_status) }}</div>
    @if($payment)
        <div>Method: {{ ucfirst($payment->payment_method) }}</div>
        @if($payment->payment_method === 'cash')
            <div>Cash: Rp {{ number_format($payment->amount_tendered,0,',','.') }}</div>
            <div>Change: Rp {{ number_format($payment->change_amount,0,',','.') }}</div>
        @endif
    @endif
</div>

<div class="footer">
    <p>*** THANK YOU ***</p>
    <p>{{ now()->format('d/m/y H:i') }}</p>
</div>

</body>
</html>