<?php
namespace App\Enums;

enum Role: string
{
    case ADMIN = 'admin';
    case RECEPTIONIST = 'receptionist';
    case CUSTOMER = 'customer';
}