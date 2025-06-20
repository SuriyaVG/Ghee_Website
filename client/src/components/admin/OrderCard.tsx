import React from 'react';

interface OrderCardProps {
  order: {
    id: number;
    customerName: string;
    phoneNumber: string;
    paymentMethod: string;
    totalAmount: string;
    createdAt: string;
    items: { name: string; quantity: number }[];
    status: string;
  };
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="border rounded bg-card p-4 mb-4 shadow-sm">
      <div className="flex flex-wrap justify-between items-center mb-2">
        <div className="font-mono text-lg font-bold">Order #{order.id}</div>
        <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</div>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Customer:</span> {order.customerName} <span className="ml-4 font-semibold">Phone:</span> {order.phoneNumber}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Payment:</span> <span className="uppercase">{order.paymentMethod}</span> <span className="ml-4 font-semibold">Total:</span> ₹{order.totalAmount}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Status:</span> <span className="capitalize">{order.status}</span>
      </div>
      <div>
        <span className="font-semibold">Items:</span>
        <ul className="list-disc pl-6">
          {order.items.map((item, idx) => (
            <li key={idx}>{item.name} × {item.quantity}</li>
          ))}
        </ul>
      </div>
    </div>
  );
} 