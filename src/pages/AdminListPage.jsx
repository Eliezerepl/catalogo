import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Loader2, Search, Package, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AdminLayout } from '../components/AdminLayout';

export function AdminListPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Gerenciamento de Estoque">
            <div className="flex justify-between items-center mb-6">
                <div className="admin-search-bar !mb-0 flex-1 max-w-md">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar produto..."
                        className="w-full bg-transparent outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Link to="/admin/cadastro" className="btn-add px-6 py-3 rounded-xl flex items-center gap-2 no-underline text-sm ml-4">
                    <Plus size={20} /> Novo Produto
                </Link>
            </div>

            <div className="admin-glass-card !bg-white !p-6">
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
                        {filteredProducts.map((p, index) => (
                            <div key={p.id} className="product-item-row animate-list-item" style={{ animationDelay: `${index * 50}ms` }}>
                                <div className="w-16 h-16 rounded-xl bg-gray-50 flex-shrink-0 border overflow-hidden">
                                    <img src={p.image} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 ml-6">
                                    <h4 className="font-bold text-gray-800 text-base">{p.name}</h4>
                                    <span className="text-xs text-primary font-bold uppercase tracking-wider">{p.category}</span>
                                </div>
                                <div className="text-right px-8">
                                    <p className="font-black text-gray-900">R$ {p.price.toFixed(2)}</p>
                                    <p className="text-[10px] text-gray-400">por {p.unit}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/admin/editar/${p.id}`} className="btn-icon edit" title="Editar">
                                        <Edit size={18} />
                                    </Link>
                                    <button className="btn-icon delete" title="Excluir" onClick={() => handleDelete(p.id)}>
                                        <Trash2 size={18} />
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
