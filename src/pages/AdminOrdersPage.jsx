import React, { useState, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    MoreVertical,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Edit,
    Trash2,
    ShoppingBag,
    Calendar,
    User,
    MapPin,
    Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminLayout } from '../components/AdminLayout';
import { Link } from 'react-router-dom';

export function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Todos");

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const orderToUpdate = orders.find(o => o.id === id);

            // 1. Atualizar o status do pedido
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (updateError) throw updateError;

            // 2. Se for Aprovado, remover do estoque
            if (newStatus === 'Aprovado' && orderToUpdate.status !== 'Aprovado') {
                for (const item of (orderToUpdate.items || [])) {
                    const { data: productData } = await supabase
                        .from('products')
                        .select('stock_quantity')
                        .eq('id', item.id)
                        .single();

                    if (productData) {
                        const newQty = Math.max(0, (productData.stock_quantity || 0) - (item.qty || 0));
                        await supabase.from('products').update({ stock_quantity: newQty }).eq('id', item.id);
                    }
                }
            }

            // 3. Se era Aprovado e foi Cancelado, devolver ao estoque
            if (newStatus === 'Cancelado' && orderToUpdate.status === 'Aprovado') {
                for (const item of (orderToUpdate.items || [])) {
                    const { data: productData } = await supabase
                        .from('products')
                        .select('stock_quantity')
                        .eq('id', item.id)
                        .single();

                    if (productData) {
                        const newQty = (productData.stock_quantity || 0) + (item.qty || 0);
                        await supabase.from('products').update({ stock_quantity: newQty }).eq('id', item.id);
                    }
                }
            }

            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (error) {
            alert('Erro ao atualizar status: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Deseja realmente excluir este pedido?')) return;
        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setOrders(orders.filter(o => o.id !== id));
        } catch (error) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.id.toString().includes(searchTerm);
        const matchesStatus = statusFilter === "Todos" || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pendente': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Aprovado': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelado': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <AdminLayout title="Gerenciar Pedidos">
            <div className="erp-list-container">
                {/* Header / Filtros */}
                <div className="erp-list-header">
                    <div className="flex gap-4 flex-1">
                        <div className="erp-search-box max-w-sm">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por cliente ou Nº pedido..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="erp-select max-w-[200px]"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="Todos">Todos os Status</option>
                            <option value="Pendente">Pendentes</option>
                            <option value="Aprovado">Aprovados</option>
                            <option value="Cancelado">Cancelados</option>
                        </select>
                    </div>
                    <div className="erp-actions-link">
                        <Calendar size={16} />
                        <span>Hoje, {new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>

                {/* Tabela de Pedidos */}
                <div className="erp-table-wrapper">
                    <table className="erp-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th>Cliente</th>
                                <th>Bairro</th>
                                <th>Tipo</th>
                                <th>Total</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12">
                                        <Loader2 key="loader" className="animate-spin text-primary inline" size={32} />
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-20 text-gray-400">
                                        <ShoppingBag size={48} className="mx-auto mb-2 opacity-20" />
                                        <p>Nenhum pedido encontrado.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="font-bold text-gray-400">#{order.id}</td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700">{order.customer_name}</span>
                                                <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString('pt-BR')}</span>
                                            </div>
                                        </td>
                                        <td className="text-gray-600">{order.customer_neighborhood}</td>
                                        <td className="text-gray-600">{order.delivery_type}</td>
                                        <td className="font-bold text-primary">R$ {Number(order.total_amount).toFixed(2)}</td>
                                        <td className="text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(order.status)} uppercase`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'Aprovado')}
                                                    className="erp-action-btn"
                                                    style={{ backgroundColor: '#2ecc71' }}
                                                    title="Aprovar Pedido"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'Cancelado')}
                                                    className="erp-action-btn delete"
                                                    title="Cancelar Pedido"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                                <Link to={`/admin/pedido/${order.id}`} className="erp-action-btn edit" title="Ver Detalhes / Editar">
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(order.id)}
                                                    className="erp-action-btn delete bg-red-600 hover:bg-red-700"
                                                    title="Excluir Definitivamente"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
