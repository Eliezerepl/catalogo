import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Loader2, Search, Package, Plus, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AdminLayout } from '../components/AdminLayout';
import { CATEGORIES } from '../data';

export function AdminListPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            alert('Erro ao buscar produtos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este produto permanentemente?")) {
            try {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                fetchProducts();
            } catch (error) {
                alert('Erro ao excluir: ' + error.message);
            }
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <AdminLayout title="Gerenciamento de Estoque">
            {/* Toolbar: Barra de Pesquisa, Filtro e Botão Novo */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex flex-1 flex-col md:flex-row gap-3 w-full max-w-2xl">
                    {/* Barra de Pesquisa Moderna */}
                    <div className="modern-field search-field flex-1">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="O que você está procurando?"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtro de Categoria Moderno */}
                    <div className="modern-field filter-field">
                        <Filter size={16} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Botão Novo Produto (Menor) */}
                <Link
                    to="/admin/cadastro"
                    className="btn-add px-4 py-2 rounded-lg flex items-center gap-2 no-underline text-xs whitespace-nowrap bg-primary text-white hover:brightness-90 transition-all font-bold"
                    style={{ height: '38px' }}
                >
                    <Plus size={16} /> Novo Produto
                </Link>
            </div>

            <div className="admin-glass-card !bg-white !p-4">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Package size={64} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg">Nenhum produto encontrado.</p>
                    </div>
                ) : (
                    <div className="modern-product-table">
                        <div className="table-header hidden md:grid grid-cols-[70px_1fr_120px_120px] gap-4 px-6 py-4 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>Imagem</span>
                            <span>Informações do Produto</span>
                            <span className="text-right">Preço Venda</span>
                            <span className="text-right">Ações</span>
                        </div>
                        {filteredProducts.map((p, index) => (
                            <div key={p.id} className="table-row grid grid-cols-1 md:grid-cols-[70px_1fr_120px_120px] gap-4 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors" style={{ animationDelay: `${index * 30}ms` }}>
                                {/* Imagem */}
                                <div className="relative group mx-auto md:mx-0">
                                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 p-0.5 flex items-center justify-center overflow-hidden shadow-sm">
                                        <img src={p.image} alt="" className="w-full h-full object-contain" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex flex-col min-w-0 text-center md:text-left">
                                    <h4 className="font-bold text-gray-800 text-sm md:text-base truncate mb-0.5">{p.name}</h4>
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <span className="px-2 py-0.5 rounded-full bg-primary-light text-primary text-[10px] font-bold uppercase tracking-wider">
                                            {p.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Preço */}
                                <div className="text-center md:text-right">
                                    <div className="text-sm font-black text-gray-900">R$ {p.price.toFixed(2)}</div>
                                    <div className="text-[10px] text-gray-400 font-medium">unidade: {p.unit}</div>
                                </div>

                                {/* Ações */}
                                <div className="flex justify-center md:justify-end gap-2">
                                    <Link to={`/admin/editar/${p.id}`} className="modern-action-btn edit" title="Editar Produto">
                                        <Edit size={16} />
                                    </Link>
                                    <button className="modern-action-btn delete" title="Excluir Produto" onClick={() => handleDelete(p.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
