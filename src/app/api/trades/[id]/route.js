import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT /api/trades/[id] - Update a trade
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const updateData = await request.json();

        // Handle numeric conversions
        const floatFields = ['entry_price', 'exit_price', 'pnl', 'lot_size', 'tp', 'sl'];
        floatFields.forEach(field => {
            if (updateData[field] !== undefined) {
                if (updateData[field] === "" || updateData[field] === null) {
                    if (field === 'entry_price' || field === 'lot_size') {
                        delete updateData[field];
                    } else {
                        updateData[field] = null;
                    }
                } else {
                    const val = parseFloat(updateData[field]);
                    if (!isNaN(val)) updateData[field] = val;
                }
            }
        });

        // Remove images_path from updates if present
        delete updateData.images_path;

        const updatedTrade = await prisma.trade.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        return NextResponse.json(updatedTrade);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/trades/[id] - Delete a trade
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await prisma.trade.delete({ where: { id: parseInt(id) } });
        
        return NextResponse.json({ message: "Trade deleted" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
