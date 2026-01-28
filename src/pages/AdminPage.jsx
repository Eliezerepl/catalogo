import React, { useState, useEffect } from 'react';
import { Save, Plus, Loader2, Image as ImageIcon, RefreshCw, HelpCircle, ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AdminLayout } from '../components/AdminLayout';

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
        description: '',
        status: true,
        supplier: '',
        brand: '',
        code: '',
        internal_ref: '',
        supplier_price: '0.00',
        cost: '0.00',
        min_markup: '0',
        min_price: '0.00',
        sale_markup: '0'
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
                    ...form,
                    name: data.name || '',
                    category: data.category || 'Limpeza',
                    price: (data.price || 0).toString(),
                    unit: data.unit || 'un',
                    image: data.image || '',
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

            // Garante que o preço seja tratado com segurança, aceitando vírgula ou ponto
            const safePrice = form.price ? form.price.toString().replace(',', '.') : '0';
            const numericPrice = parseFloat(safePrice) || 0;

            const updateData = {
                name: form.name || 'Sem nome',
                category: form.category || 'Limpeza',
                price: numericPrice,
                unit: form.unit || 'un',
                image: finalImageUrl || '',
                description: form.description || ''
            };

            if (id) {
                const { error } = await supabase
                    .from('products')
                    .update(updateData)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([updateData]);
                if (error) throw error;
            }

            // Redireciona imediatamente sem bloquear com alert
            navigate('/admin/lista');
        } catch (error) {
            console.error('Erro ao salvar:', error);
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
            <AdminLayout title="Carregando...">
                <div className="flex justify-center items-center min-h-[40vh]">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={id ? 'Editar Produto' : 'Novo Cadastro'}>
            <div className="erp-form-card">
                <div className="erp-form-header">
                    <h2>Dados gerais do produto</h2>
                    <div className="erp-actions-link cursor-pointer">
                        <span>Ações</span>
                        <ChevronDown size={14} />
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="erp-form-grid">
                        {/* LADO ESQUERDO: IMAGEM */}
                        <div className="erp-image-upload">
                            <div className="erp-image-preview-box">
                                {form.image ? (
                                    <img src={form.image} alt="Preview" />
                                ) : (
                                    <ImageIcon size={48} className="text-gray-200" />
                                )}
                            </div>
                            <label className="erp-add-image-link">
                                Selecione a imagem
                                <input
                                    type="file"
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {/* LADO DIREITO: CAMPOS */}
                        <div className="flex flex-col gap-5">
                            {/* LINHA 1: NOME E SITUAÇÃO */}
                            <div className="erp-form-row">
                                <div className="erp-field" style={{ flex: 3 }}>
                                    <label className="erp-label">Nome</label>
                                    <input
                                        type="text"
                                        className="erp-input"
                                        placeholder="Ex: Caneca"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="erp-field" style={{ flex: 1 }}>
                                    <label className="erp-label">Situação</label>
                                    <div className="erp-toggle-group">
                                        <button
                                            type="button"
                                            className={`erp-status-btn ${!form.status ? 'inactive' : ''}`}
                                            onClick={() => setForm({ ...form, status: !form.status })}
                                        >
                                            {form.status ? 'Ativo' : 'Inativo'}
                                            <span className="w-4 h-4 bg-white rounded-sm"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* LINHA 2: DESCRIÇÃO */}
                            <div className="erp-field">
                                <label className="erp-label">
                                    Descrição <span>(opcional)</span>
                                    <div className="erp-help-icon" title="Detalhes do produto">?</div>
                                </label>
                                <textarea
                                    className="erp-textarea h-24"
                                    placeholder="Detalhes sobre o produto..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                ></textarea>
                                <span className="text-[10px] text-gray-400">Quantidade máxima de 700 caracteres</span>
                            </div>

                            {/* LINHA 3: CATEGORIA, PREÇO E UNIDADE */}
                            <div className="erp-form-row">
                                <div className="erp-field" style={{ flex: 2 }}>
                                    <label className="erp-label">Categoria</label>
                                    <select
                                        className="erp-select"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                    >
                                        <option value="Limpeza">Limpeza</option>
                                        <option value="Utensílios">Utensílios</option>
                                        <option value="Organização">Organização</option>
                                        <option value="Automotivo">Automotivo</option>
                                    </select>
                                </div>
                                <div className="erp-field" style={{ flex: 1 }}>
                                    <label className="erp-label">Preço</label>
                                    <div className="erp-financial-input">
                                        <span className="erp-currency-symbol">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="erp-input font-bold"
                                            placeholder="0.00"
                                            value={form.price}
                                            onChange={e => setForm({ ...form, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="erp-field" style={{ flex: 1 }}>
                                    <label className="erp-label">Unidade <span>(un, kg, gl)</span></label>
                                    <input
                                        type="text"
                                        className="erp-input"
                                        placeholder="un"
                                        value={form.unit}
                                        onChange={e => setForm({ ...form, unit: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* BOTÕES DE AÇÃO */}
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    className="px-6 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-600 hover:bg-gray-50 bg-white"
                                    onClick={() => navigate('/admin/lista')}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-2 bg-[#0093d1] text-white rounded text-sm font-bold shadow-sm flex items-center justify-center gap-2 hover:brightness-95 disabled:opacity-50 min-w-[160px]"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 key="loader" className="animate-spin" size={16} />
                                            <span>Gravando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save key="save" size={16} />
                                            <span>Gravar Produto</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
