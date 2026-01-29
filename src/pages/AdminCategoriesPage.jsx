import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Edit2, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';

export function AdminCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editName, setEditName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');
            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            alert('Erro ao buscar categorias: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            setIsSaving(true);
            const { error } = await supabase
                .from('categories')
                .insert([{ name: newCategory.trim() }]);
            if (error) throw error;
            setNewCategory('');
            fetchCategories();
        } catch (error) {
            alert('Erro ao adicionar categoria: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Deseja realmente excluir esta categoria? Isso pode afetar os produtos vinculados.')) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchCategories();
        } catch (error) {
            alert('Erro ao excluir categoria: ' + error.message);
        }
    };

    const startEditing = (category) => {
        setEditingCategory(category.id);
        setEditName(category.name);
    };

    const cancelEditing = () => {
        setEditingCategory(null);
        setEditName('');
    };

    const handleUpdateCategory = async (id) => {
        if (!editName.trim()) return;

        try {
            setIsSaving(true);
            const { error } = await supabase
                .from('categories')
                .update({ name: editName.trim() })
                .eq('id', id);
            if (error) throw error;
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            alert('Erro ao atualizar categoria: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout title="Gerenciar Categorias">
            <div className="admin-glass-card p-6 mb-8">
                <form onSubmit={handleAddCategory} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Nome da nova categoria..."
                        className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        disabled={isSaving}
                    />
                    <button
                        type="submit"
                        className="btn-add px-6 py-3 flex items-center gap-2"
                        disabled={isSaving || !newCategory.trim()}
                    >
                        <span>
                            {isSaving ? <Loader2 key="loader" className="animate-spin" size={20} /> : <Plus key="plus" size={20} />}
                        </span>
                        Adicionar
                    </button>
                </form>
            </div>

            <div className="admin-glass-card overflow-hidden">
                {loading ? (
                    <div className="p-20 flex justify-center">
                        <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {categories.map((category) => (
                            <div key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                {editingCategory === category.id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="text"
                                            className="flex-1 p-2 border border-primary rounded"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleUpdateCategory(category.id)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                        >
                                            <Save size={20} />
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-lg font-medium text-gray-700">{category.name}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => startEditing(category)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light rounded transition-colors"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <div className="p-10 text-center text-gray-500">
                                Nenhuma categoria cadastrada.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
