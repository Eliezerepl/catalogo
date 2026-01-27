import React, { useState, useEffect } from 'react';
import { Save, Plus, Loader2, Image as ImageIcon, Layout as LayoutIcon, ArrowLeft, RefreshCw, List } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AdminPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        category: 'Limpeza',
        price: '',
        unit: 'un',
        image: '',
        description: ''
    });

    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }
    }, [id]);

    const fetchProduct = async (productId) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;
            if (data) {
                setForm({
                    name: data.name,
                    category: data.category,
                    price: data.price,
                    unit: data.unit,
                    image: data.image,
                    description: data.description || ''
                });
            }
        } catch (error) {
            alert('Erro ao carregar produto: ' + error.message);
            navigate('/admin/lista');
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

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

            const updateData = {
                ...form,
                image: finalImageUrl,
                price: parseFloat(form.price)
            };

            if (id) {
                const { error } = await supabase
                    .from('products')
                    .update(updateData)
                    .eq('id', id);
                if (error) throw error;
                alert('Produto atualizado com sucesso!');
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([updateData]);
                if (error) throw error;
                alert('Produto cadastrado com sucesso!');
            }

            navigate('/admin/lista');
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            const reader = new FileReader();
            reader.onload = (event) => {
                setForm({ ...form, image: event.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-4xl mx-auto">
            <header className="flex items-center justify-between mb-8 admin-header-row">
                <div>
                    <Link to="/admin/lista" className="back-to-site-link mb-2">
                        <ArrowLeft size={18} /> Voltar para Consulta
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <LayoutIcon className="text-primary" size={32} />
                        {id ? 'Editar Produto' : 'Novo Cadastro'}
                    </h1>
                </div>
                <Link to="/admin/lista" className="bg-gray-100 px-4 py-2 rounded-full text-gray-600 font-bold text-sm flex items-center gap-2 no-underline">
                    <List size={18} /> Ver Todos Produtos
                </Link>
            </header>

            <div className="admin-glass-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Coluna do Formulário */}
                    <div>
                        <h2 className="admin-section-title">
                            {id ? <RefreshCw size={24} /> : <Plus size={24} />}
                            <span>{id ? 'Informações do Produto' : 'Dados do Cadastro'}</span>
                        </h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="form-group">
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

                            <div className="form-row">
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
                                <label className="form-label">Descrição</label>
                                <textarea
                                    className="form-textarea"
                                    rows="3"
                                    placeholder="Detalhes sobre o produto..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button
                                    type="button"
                                    className="px-8 py-3 bg-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-all"
                                    onClick={() => navigate('/admin/lista')}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-add flex-1 rounded-xl shadow-lg shadow-primary/20"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    <span>{saving ? 'Salvando...' : 'Salvar Produto'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Coluna de Mídia/Preview */}
                    <div className="flex flex-col gap-6">
                        <div className="form-group">
                            <label className="form-label">Mídia do Produto</label>
                            <label className="upload-label min-h-[220px]">
                                {form.image ? (
                                    <img src={form.image} alt="Preview" className="w-full h-full object-contain max-h-[180px]" />
                                ) : (
                                    <>
                                        <ImageIcon size={48} className="text-gray-300" />
                                        <span className="font-bold text-gray-400">Escolher Imagem</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                            <div className="relative mt-4">
                                <input
                                    type="text"
                                    className="form-input w-full pr-10"
                                    placeholder="Ou cole o link da imagem..."
                                    value={form.image.startsWith('data:') ? '' : form.image}
                                    onChange={e => setForm({ ...form, image: e.target.value })}
                                />
                                <ImageIcon className="absolute right-3 top-3 text-gray-400" size={18} />
                            </div>
                        </div>

                        <div className="bg-primary-light p-6 rounded-2xl">
                            <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                                <RefreshCw size={16} /> Dica de Cadastro
                            </h4>
                            <p className="text-primary/70 text-sm leading-relaxed">
                                Use imagens com fundo claro ou transparente e descrições detalhadas para converter mais vendas pelo WhatsApp.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
