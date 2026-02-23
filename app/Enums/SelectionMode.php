<?php

namespace App\Enums;

enum SelectionMode: string
{
    case INCLUDE = 'include';
    case EXCLUDE = 'exclude';
}
