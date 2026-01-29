import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Loader2, Search, Package, Plus, Filter, List as ListIcon, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AdminLayout } from '../components/AdminLayout';
import { AdminLayout } from '../components/AdminLayout';

export function AdminListPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [categories, setCategories] = useState(["Todos"]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('name').order('name');
        if (data) {
            setCategories(["Todos", ...data.map(c => c.name)]);
        }
    };

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
        const name = p.name || "";
        const category = p.category || "";
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "Todos" || category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <AdminLayout title="Gerenciamento de Estoque">
            {/* Toolbar: Barra de Pesquisa, Filtro e Botão Novo */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex flex-1 flex-col md:flex-row gap-3 w-full max-w-2xl">
                    <div className="modern-field search-field flex-1">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="O que você está procurando?"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="modern-field filter-field">
                        <Filter size={16} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <Link
                    to="/admin/cadastro"
                    className="btn-add px-6 py-2 rounded-lg flex items-center gap-2 no-underline text-xs whitespace-nowrap bg-primary text-white hover:brightness-90 transition-all font-bold shadow-sm"
                    style={{ height: '42px' }}
                >
                    <Plus size={18} /> Novo Produto
                </Link>
            </div>

            {/* Layout Tabela Estilo ERP (conforme imagem) */}
            <div className="erp-table-container">
                <div className="erp-table-header-bar">
                    <ListIcon size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-700">Listando produtos</span>
                </div>

                <div className="erp-table-wrapper">
                    <table className="erp-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input type="checkbox" className="erp-checkbox" />
                                </th>
                                <th style={{ width: '100px' }}>Imagem</th>
                                <th>Produto</th>
                                <th>Categoria</th>
                                <th>Preço</th>
                                <th className="text-center">Qtd</th>
                                <th className="text-center">Situação</th>
                                <th style={{ width: '100px' }} className="text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12">
                                        <Loader2 key="list-loader" className="animate-spin text-primary inline" size={32} />
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-20 text-gray-400">
                                        <Package size={48} className="mx-auto mb-2 opacity-20" />
                                        <p>Nenhum produto cadastrado.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => (
                                    <tr key={p?.id || Math.random()}>
                                        <td>
                                            <input type="checkbox" className="erp-checkbox" />
                                        </td>
                                        <td className="text-center">
                                            <div className="erp-img-box">
                                                <img src={p?.image || ''} alt="" />
                                            </div>
                                        </td>
                                        <td className="font-medium text-gray-600">{p?.name || '---'}</td>
                                        <td className="text-gray-500">{p?.category || '---'}</td>
                                        <td className="text-gray-700 font-semibold">
                                            R$ {Number(p?.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="text-center font-bold">
                                            <span className={(p?.stock_quantity || 0) <= (p?.min_stock_quantity || 0) ? 'text-red-500' : 'text-gray-600'}>
                                                {p?.stock_quantity || 0}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className={`erp-qty-badge ${p?.status !== false ? 'green' : 'orange'}`}>
                                                {p?.status !== false ? 'Em estoque' : 'Sem estoque'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center gap-1">
                                                <Link to={`/admin/editar/${p?.id}`} className="erp-action-btn edit" title="Editar">
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(p?.id)}
                                                    className="erp-action-btn delete"
                                                    title="Excluir"
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
