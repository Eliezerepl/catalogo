import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit, Loader2, Image as ImageIcon, Layout as LayoutIcon, Search, Package, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AdminPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [form, setForm] = useState({
        name: '',
        category: 'Limpeza',
        price: '',
        unit: 'un',
        image: '',
        description: ''
    });

    const [editingId, setEditingId] = useState(null);
    const [imageFile, setImageFile] = useState(null);

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

    const uploadImage = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
            .from('products')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price) return alert("Nome e Preço são obrigatórios");

        try {
            setSaving(true);
            let finalImageUrl = form.image;

            if (imageFile) {
                finalImageUrl = await uploadImage(imageFile);
            }

            const { id: _, ...updateData } = {
                ...form,
                image: finalImageUrl,
                price: parseFloat(form.price)
            };

            if (editingId) {
                const { error } = await supabase
                    .from('products')
                    .update(updateData)
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([updateData]);
                if (error) throw error;
            }

            resetForm();
            fetchProducts();
        } catch (error) {
            alert('Erro ao salvar produto: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            category: 'Limpeza',
            price: '',
            unit: 'un',
            image: '',
            description: ''
        });
        setEditingId(null);
        setImageFile(null);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            // Gerar preview local
            const reader = new FileReader();
            reader.onload = (event) => {
                setForm({ ...form, image: event.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (product) => {
        setForm({
            name: product.name,
            category: product.category,
            price: product.price,
            unit: product.unit,
            image: product.image,
            description: product.description
        });
        setEditingId(product.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="container py-8 max-w-6xl mx-auto">
            <header className="flex items-center justify-between mb-8 admin-header-row">
                <div>
                    <Link to="/" className="back-to-site-link mb-2">
                        <ArrowLeft size={18} /> Voltar ao Site
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <LayoutIcon className="text-primary" size={32} />
                        Gestão de Produtos
                    </h1>
                </div>
                <div className="bg-primary-light px-4 py-2 rounded-full text-primary font-bold text-sm">
                    {products.length} Produtos Ativos
                </div>
            </header>

            <div className="admin-layout">
                {/* Lado Esquerdo: Formulário */}
                <div className="admin-glass-card">
                    <h2 className="admin-section-title">
                        {editingId ? (
                            <RefreshCw key="edit-icon" size={24} />
                        ) : (
                            <Plus key="add-icon" size={24} />
                        )}
                        <span>{editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}</span>
                    </h2>

                    <form onSubmit={handleSubmit} className="admin-grid-form">
                        <div className="form-group full-width">
                            <label className="form-label">Nome do Produto</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ex: Detergente Especial 5L"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Categoria</label>
                            <select
                                className="form-select"
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                            >
                                <option value="Limpeza">Limpeza</option>
                                <option value="Utensílios">Utensílios</option>
                                <option value="Organização">Organização</option>
                                <option value="Automotivo">Automotivo</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Unidade de Venda</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="un, gl, cx, kg"
                                value={form.unit}
                                onChange={e => setForm({ ...form, unit: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Preço (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-input"
                                placeholder="0,00"
                                value={form.price}
                                onChange={e => setForm({ ...form, price: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Imagem do Produto</label>
                            <div className="flex flex-col gap-2 image-upload-wrapper">
                                <label className="upload-label">
                                    <ImageIcon size={32} />
                                    <span className="text-sm font-bold">{imageFile ? imageFile.name : 'Subir Imagem'}</span>
                                    <span className="text-xs text-gray-400">Arraste ou clique para selecionar</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                                <div className="relative mt-2">
                                    <input
                                        type="text"
                                        className="form-input w-full pr-10"
                                        placeholder="Ou cole o link da imagem aqui..."
                                        value={form.image}
                                        onChange={e => {
                                            setForm({ ...form, image: e.target.value });
                                            setImageFile(null);
                                        }}
                                    />
                                    <ImageIcon className="absolute right-3 top-3 text-gray-400" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Descrição Detalhada</label>
                            <textarea
                                className="form-textarea"
                                rows="3"
                                placeholder="Fale sobre o rendimento, benefícios e uso do produto..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="full-width flex gap-3 justify-end mt-4">
                            {(editingId || form.name) && (
                                <button
                                    type="button"
                                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                                    onClick={resetForm}
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-add w-auto px-8 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                {saving ? (
                                    <Loader2 key="loader-icon" className="animate-spin" size={20} />
                                ) : (
                                    editingId ? <Save key="update-icon" size={20} /> : <Save key="save-icon" size={20} />
                                )}
                                <span>{saving ? 'Publicando...' : (editingId ? 'Salvar Alterações' : 'Publicar Produto')}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Lado Direito: Preview e Busca */}
                <div className="space-y-6">
                    <div className="preview-card-sticky">
                        <span className="preview-label">Visualização em Tempo Real</span>
                        <div className="preview-box">
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border">
                                    {form.image ? (
                                        <img src={form.image} alt="Preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <ImageIcon className="text-gray-300" size={32} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{form.category}</span>
                                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{form.name || 'Nome do Produto'}</h3>
                                    <p className="text-xl font-black text-gray-900">
                                        R$ {form.price ? parseFloat(form.price).toFixed(2) : '0,00'}
                                        <span className="text-sm font-normal text-gray-500 ml-1">/{form.unit}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-glass-card mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Package size={20} className="text-primary" />
                                Lista de Produtos
                            </h2>
                        </div>

                        <div className="admin-search-bar">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar nos registros..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div key="loading-state" className="flex justify-center p-8">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div key="empty-state" className="text-center py-10 text-gray-400">
                                    <Package size={48} className="mx-auto mb-2 opacity-20" />
                                    <p>Nenhum produto encontrado.</p>
                                </div>
                            ) : (
                                <div key="product-list" className="space-y-0">
                                    {filteredProducts.map((p, index) => (
                                        <div key={p.id} className="product-item-row animate-list-item" style={{ animationDelay: `${index * 50}ms` }}>
                                            <div className="w-12 h-12 rounded-lg bg-gray-50 flex-shrink-0 border overflow-hidden">
                                                <img src={p.image} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 ml-4 overflow-hidden">
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{p.name}</h4>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">{p.category}</p>
                                            </div>
                                            <div className="text-right mr-4 hidden md:block">
                                                <p className="font-bold text-sm">R$ {p.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button className="btn-icon edit" title="Editar" onClick={() => handleEdit(p)}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-icon delete" title="Excluir" onClick={() => handleDelete(p.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

