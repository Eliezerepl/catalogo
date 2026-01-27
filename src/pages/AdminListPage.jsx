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
                    <div className="products-list-grid">
                        <div className="hidden md:flex items-center px-4 py-2 text-xs font-bold text-gray-400 border-bottom mb-2">
                            <span className="w-16">Foto</span>
                            <span className="flex-1 ml-6">Produto / Categoria</span>
                            <span className="w-24 text-right px-8">Preço</span>
                            <span className="w-20 text-right">Ações</span>
                        </div>
                        {filteredProducts.map((p, index) => (
                            <div key={p.id} className="product-item-row animate-list-item" style={{ animationDelay: `${index * 30}ms` }}>
                                <div className="w-12 h-12 rounded-lg bg-gray-50 flex-shrink-0 border overflow-hidden">
                                    <img src={p.image} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 ml-4 overflow-hidden">
                                    <h4 className="font-bold text-gray-800 text-sm truncate">{p.name}</h4>
                                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{p.category}</span>
                                </div>
                                <div className="text-right px-4 md:px-8">
                                    <p className="font-black text-gray-900 text-sm">R$ {p.price.toFixed(2)}</p>
                                    <p className="text-[10px] text-gray-400">por {p.unit}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/admin/editar/${p.id}`} className="btn-icon edit" title="Editar">
                                        <Edit size={16} />
                                    </Link>
                                    <button className="btn-icon delete" title="Excluir" onClick={() => handleDelete(p.id)}>
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
