import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Loader2,
    User,
    MapPin,
    Truck,
    ShoppingBag,
    Search,
    FileText,
    CheckCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../lib/supabase';
import { AdminLayout } from '../components/AdminLayout';

export function AdminOrderDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState([]);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchOrder();
        fetchProducts();
    }, [id]);

    async function fetchOrder() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setOrder(data);
        } catch (error) {
            console.error('Erro ao buscar pedido:', error);
            navigate('/admin/pedidos');
        } finally {
            setLoading(false);
        }
    }

    async function fetchProducts() {
        const { data } = await supabase.from('products').select('*');
        setProducts(data || []);
    }

    const handleUpdateQty = (productId, delta) => {
        const newItems = order.items.map(item => {
            if (item.id === productId) {
                return { ...item, qty: Math.max(1, item.qty + delta) };
            }
            return item;
        });
        updateOrderItems(newItems);
    };

    const handleRemoveItem = (productId) => {
        const newItems = order.items.filter(item => item.id !== productId);
        updateOrderItems(newItems);
    };

    const handleAddItem = (product) => {
        const existing = order.items.find(item => item.id === product.id);
        let newItems;
        if (existing) {
            newItems = order.items.map(item =>
                item.id === product.id ? { ...item, qty: item.qty + 1 } : item
            );
        } else {
            newItems = [...order.items, { ...product, qty: 1 }];
        }
        updateOrderItems(newItems);
        setShowProductSearch(false);
    };

    const updateOrderItems = (newItems) => {
        const newTotal = newItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
        setOrder({ ...order, items: newItems, total_amount: newTotal });
    };

    const handleApprove = async () => {
        console.log("CLIQUE NO BOTÃO APROVAR - ID:", id);
        if (!confirm('Deseja realmente aprovar este pedido?')) return;

        try {
            setSaving(true);
            console.log("Atualizando status no Supabase...");
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: 'Aprovado' })
                .eq('id', id);

            if (updateError) throw updateError;

            console.log("Status atualizado. Buscando dados novos...");
            const { data: updatedOrder, error: fetchError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            console.log("Dados atualizados com sucesso:", updatedOrder);
            setOrder(updatedOrder);
            setTimeout(() => alert('Pedido aprovado com sucesso! Agora você pode gerar o PDF.'), 200);
        } catch (error) {
            console.error('ERRO NO PROCESSO DE APROVAÇÃO:', error);
            alert('Erro ao aprovar: ' + error.message);
        } finally {
            setSaving(false);
            console.log("Processo finalizado.");
        }
    };

    const generatePDF = () => {
        console.log("Iniciando geração de PDF para o pedido:", order.id);
        try {
            const doc = new jsPDF();

            console.log("Instância jsPDF criada. Adicionando cabeçalho...");
            // Header
            doc.setFontSize(22);
            doc.setTextColor(50, 168, 82); // #32a852 (Primary Verde Ardulimp)
            doc.text("Ardulimp", 105, 20, { align: "center" });

            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text(`Pedido #${order.id}`, 105, 30, { align: "center" });

            doc.setFontSize(10);
            doc.text(`Data: ${new Date(order.created_at).toLocaleDateString('pt-BR')}`, 105, 38, { align: "center" });

            console.log("Adicionando informações do cliente...");
            // Customer Info
            doc.setFontSize(14);
            doc.text("Dados do Cliente", 14, 55);
            doc.setFontSize(10);
            doc.text(`Nome: ${order.customer_name}`, 14, 62);
            doc.text(`Bairro: ${order.customer_neighborhood}`, 14, 67);
            doc.text(`Entrega: ${order.delivery_type}`, 14, 72);
            if (order.observations) {
                doc.text(`Observações: ${order.observations}`, 14, 77);
            }

            console.log("Preparando dados da tabela...");
            // Table
            const tableData = order.items.map(item => [
                item.name,
                item.qty,
                `R$ ${Number(item.price).toFixed(2)}`,
                `R$ ${(Number(item.price) * item.qty).toFixed(2)}`
            ]);

            console.log("Chamando autoTable...");
            autoTable(doc, {
                startY: 85,
                head: [['Produto', 'Qtd', 'Preço Unit.', 'Subtotal']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillStyle: 'solid', fillColor: [50, 168, 82] }, // #32a852
                footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
                foot: [['', '', 'TOTAL:', `R$ ${Number(order.total_amount).toFixed(2)}`]]
            });

            console.log("Salvando arquivo...");
            doc.save(`Pedido_${order.id}_${order.customer_name}.pdf`);
            console.log("PDF Gerado com sucesso!");
        } catch (error) {
            console.error("ERRO AO GERAR PDF:", error);
            alert("Erro ao gerar PDF: " + error.message);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('orders')
                .update({
                    items: order.items,
                    total_amount: order.total_amount,
                    customer_name: order.customer_name,
                    customer_neighborhood: order.customer_neighborhood,
                    observations: order.observations
                })
                .eq('id', id);

            if (error) throw error;
            alert('Pedido atualizado com sucesso!');
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <AdminLayout title="Carregando pedido...">
            <div className="flex justify-center p-20"><Loader2 className="animate-spin" size={48} /></div>
        </AdminLayout>
    );

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title={`Pedido #${order.id}`}>
            <div className="erp-form-card">
                <div className="erp-form-header">
                    <button onClick={() => navigate('/admin/pedidos')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
                        <ArrowLeft size={16} /> Voltar para lista
                    </button>
                    <h2>Detalhes do Pedido</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Informações do Cliente */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-700">
                                <User size={18} className="text-primary" /> Dados do Cliente
                            </h3>
                            <div className="space-y-3">
                                <div className="erp-field">
                                    <label className="erp-label">Nome do Cliente</label>
                                    <input
                                        type="text"
                                        className="erp-input"
                                        value={order.customer_name}
                                        onChange={e => setOrder({ ...order, customer_name: e.target.value })}
                                    />
                                </div>
                                <div className="erp-field">
                                    <label className="erp-label">Bairro</label>
                                    <input
                                        type="text"
                                        className="erp-input"
                                        value={order.customer_neighborhood}
                                        onChange={e => setOrder({ ...order, customer_neighborhood: e.target.value })}
                                    />
                                </div>
                                <div className="erp-field">
                                    <label className="erp-label">Tipo de Entrega</label>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-bold bg-white p-2 border rounded">
                                        <Truck size={16} /> {order.delivery_type}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h3 className="font-bold mb-4 text-gray-700">Observações</h3>
                            <textarea
                                className="erp-textarea h-24"
                                value={order.observations || ''}
                                onChange={e => setOrder({ ...order, observations: e.target.value })}
                            ></textarea>
                        </div>
                    </div>

                    {/* Itens do Pedido */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <ShoppingBag size={18} className="text-primary" /> Itens Solicitados
                            </h3>
                            <button
                                onClick={() => setShowProductSearch(true)}
                                className="flex items-center gap-2 text-xs font-bold bg-primary text-white px-3 py-2 rounded hover:brightness-95"
                            >
                                <Plus size={14} /> Adicionar Item
                            </button>
                        </div>

                        <div className="border rounded-lg overflow-hidden bg-white">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-3 text-left">Produto</th>
                                        <th className="p-3 text-center">Qtd</th>
                                        <th className="p-3 text-right">Preço</th>
                                        <th className="p-3 text-right">Subtotal</th>
                                        <th className="p-3 text-center">#</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item) => (
                                        <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        style={{ width: '48px', height: '48px', minWidth: '48px' }}
                                                        className="rounded-lg border border-gray-200 overflow-hidden bg-white flex items-center justify-center p-1"
                                                    >
                                                        <img
                                                            src={item.image}
                                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-700 leading-tight">{item.name}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleUpdateQty(item.id, -1)} className="w-6 h-6 border rounded hover:bg-gray-100">-</button>
                                                    <span className="w-6 font-bold">{item.qty}</span>
                                                    <button onClick={() => handleUpdateQty(item.id, 1)} className="w-6 h-6 border rounded hover:bg-gray-100">+</button>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right font-medium">R$ {Number(item.price).toFixed(2)}</td>
                                            <td className="p-3 text-right font-bold text-primary">R$ {(item.price * item.qty).toFixed(2)}</td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-primary/5 font-bold">
                                    <tr>
                                        <td colSpan="3" className="p-4 text-right text-lg">TOTAL DO PEDIDO:</td>
                                        <td className="p-4 text-right text-xl text-primary">R$ {order.total_amount.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => navigate('/admin/pedidos')}
                                className="px-6 py-2 border rounded text-sm font-bold text-gray-500 hover:bg-gray-50"
                            >
                                Sair sem salvar
                            </button>

                            {order.status === 'Aprovado' && (
                                <button
                                    key="pdf-btn"
                                    onClick={generatePDF}
                                    className="px-6 py-2 bg-[#f39c12] text-white rounded text-sm font-bold shadow-sm flex items-center gap-2 hover:brightness-95 transition-all"
                                >
                                    <FileText size={16} /> Gerar PDF do Pedido
                                </button>
                            )}

                            {order.status !== 'Aprovado' && (
                                <button
                                    key="approve-btn"
                                    onClick={handleApprove}
                                    disabled={saving}
                                    className="px-6 py-2 bg-[#27ae60] text-white rounded text-sm font-bold shadow-sm flex items-center gap-2 hover:brightness-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? "Processando..." : "Aprovar e Liberar PDF"}
                                </button>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-8 py-2 bg-primary text-white rounded text-sm font-bold shadow-sm flex items-center gap-2 hover:brightness-95 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de busca de produto */}
            {showProductSearch && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold">Adicionar Produto ao Pedido</h3>
                            <button onClick={() => setShowProductSearch(false)} className="text-gray-400 hover:text-black">X</button>
                        </div>
                        <div className="p-4">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Procurar produto no estoque..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-80 overflow-y-auto space-y-2">
                                {filteredProducts.map(p => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between p-2 hover:bg-blue-50 cursor-pointer rounded-lg border border-transparent hover:border-blue-100 transition-all"
                                        onClick={() => handleAddItem(p)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                style={{ width: '48px', height: '48px', minWidth: '48px' }}
                                                className="rounded-lg border border-gray-200 overflow-hidden bg-white flex items-center justify-center p-1"
                                            >
                                                <img
                                                    src={p.image}
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm leading-tight">{p.name}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">R$ {Number(p.price).toFixed(2)} / {p.unit}</p>
                                            </div>
                                        </div>
                                        <Plus size={20} className="text-primary" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
