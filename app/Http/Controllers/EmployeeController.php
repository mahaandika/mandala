<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Enums\Role;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Enum;

use function Symfony\Component\Clock\now;

class EmployeeController extends Controller
{
    /**
     * Menampilkan halaman dan data karyawan.
     */
    public function index()
    {
        $employees = User::whereIn('role', [Role::CASHIER->value, Role::RECEPTIONIST->value])
            ->latest()
            ->get();

        // Sesuaikan path ini dengan letak file TSX Anda (tanpa ekstensi)
        return Inertia::render('admin/employee/EmployeeManagement', [
            'employees' => $employees
        ]);
    }

    /**
     * Store (Create) Karyawan Baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone'    => 'nullable|string|max:20',
            'role'     => ['required', new Enum(Role::class)],
            'status'   => 'required|in:active,inactive',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['address'] = 'Mandala Restaurant'; 
        $validated['email_verified_at'] = Carbon::now(); 
        User::create($validated);

        return redirect()->back()->with('success', 'Employee created successfully.');
    }

    /**
     * Update Data Karyawan.
     */
    public function update(Request $request, string $id)
    {
        $employee = User::findOrFail($id);

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($employee->id)],
            'phone'    => 'nullable|string|max:20',
            'role'     => ['required', new Enum(Role::class)],
            'status'   => 'required|in:active,inactive',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        } else {
            unset($validated['password']);
        }

        $employee->update($validated);

        return redirect()->back()->with('success', 'Employee updated successfully.');
    }

    /**
     * Destroy dialihfungsikan untuk Toggle Status (Active/Inactive)
     */
    public function destroy(string $id)
    {
        $employee = User::findOrFail($id);
        
        $newStatus = $employee->status === 'active' ? 'inactive' : 'active';
        $employee->update(['status' => $newStatus]);

        return redirect()->back()->with('success', "Employee status changed to {$newStatus}.");
    }
}