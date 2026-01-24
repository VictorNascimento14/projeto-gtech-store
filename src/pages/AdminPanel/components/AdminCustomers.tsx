
import React from 'react';
import { Users, ShoppingBag } from 'lucide-react';
import { Customer } from '../../../types';

interface AdminCustomersProps {
    customers: Customer[];
}

const AdminCustomers: React.FC<AdminCustomersProps> = ({ customers }) => {
    return (
        <div className="animate-in fade-in duration-500">
            <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Clientes Cadastrados</h2>
                            <p className="text-xs text-gray-500 mt-1">{customers.length} clientes registrados na plataforma</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-4">Cliente</th>
                                <th className="px-8 py-4">Contato</th>
                                <th className="px-8 py-4">Data Cadastro</th>
                                <th className="px-8 py-4">Total Gasto</th>
                                <th className="px-8 py-4">Pedidos</th>
                                <th className="px-8 py-4">Último Pedido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div>
                                            <div className="font-bold text-gray-800 dark:text-white">{customer.name}</div>
                                            {customer.cpf && (
                                                <div className="text-xs text-gray-400 font-medium mt-1">CPF: {customer.cpf}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm">
                                            <div className="text-gray-600 dark:text-gray-300 font-medium">{customer.email}</div>
                                            {customer.phone && (
                                                <div className="text-xs text-gray-400 mt-1">{customer.phone}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            {new Date(customer.registeredAt).toLocaleDateString('pt-BR')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-green-600">
                                            R$ {customer.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-800 dark:text-white">{customer.totalOrders}</span>
                                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs text-gray-500 font-medium">
                                            {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('pt-BR') : '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {customers.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">Nenhum cliente cadastrado</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCustomers;
