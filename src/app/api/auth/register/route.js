import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/auth/register - Register with email only (no password)
export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Create user with empty password hash (email-only auth)
        const newUser = await prisma.user.create({
            data: {
                email,
                password_hash: '' // No password needed
            }
        });

        return NextResponse.json({ 
            message: "User registered successfully", 
            userId: newUser.id 
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
