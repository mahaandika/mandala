<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TabelController extends Controller
{
    public function index(){
        return Inertia::render('admin/tabel/index', []);
    }
}
