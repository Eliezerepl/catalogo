import React, { useState, useEffect } from 'react';
import {
    Package,
    PlusCircle,
    List,
    TrendingUp,
    Box,
    ArrowRight,
    RefreshCw,
    LayoutTemplate
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AdminLayout } from '../components/AdminLayout';

export function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        categories: 0,
        latestProduct: null,
        categoriesList: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const { data: products, error } = await supabase
                .from('products')
                .select('*');

            if (error) throw error;

            if (products) {
                const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
                setStats({
                    totalProducts: products.length,
                    categories: uniqueCategories.length,
                    categoriesList: uniqueCategories,
                    latestProduct: products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
                });
            }
        } catch (error) {
            console.error('Erro no dashboard:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Visão Geral do Estoque">
            <div className="dashboard-grid">
                <div className="admin-stat-card vendas-hoje">
                    <div className="stat-main">
                        <div>
                            <h3 className="stat-v-value">{stats.totalProducts}</h3>
                            <span className="stat-v-label">Total de Itens</span>
                        </div>
                        <Package size={48} className="opacity-20" />
                    </div>
                </div>

                <div className="admin-stat-card vendas-periodo">
                    <div className="stat-main">
                        <div>
                            <h3 className="stat-v-value">{stats.categories}</h3>
                            <span className="stat-v-label">Categorias</span>
                        </div>
                        <LayoutTemplate size={48} className="opacity-20" />
                    </div>
                </div>

                <div className="admin-stat-card receber-hoje">
                    <div className="stat-main">
                        <div>
                            <h3 className="stat-v-value">Ativo</h3>
                            <span className="stat-v-label">Status Catálogo</span>
                        </div>
                        <TrendingUp size={48} className="opacity-20" />
                    </div>
                </div>

                <div className="admin-stat-card pagar-hoje">
                    <div className="stat-main">
                        <div>
                            <h3 className="stat-v-value">0</h3>
                            <span className="stat-v-label">Itens Esgotados</span>
                        </div>
                        <Box size={48} className="opacity-20" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="widget-card">
                    <h3 className="widget-title !text-left !mb-6 font-bold flex items-center gap-2">
                        <LayoutTemplate size={20} className="text-primary" />
                        Categorias no Sistema
                    </h3>
                    <div className="space-y-3">
                        {stats.categoriesList.map(cat => (
                            <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="font-semibold text-gray-700">{cat}</span>
                                <Link to="/admin/lista" className="text-xs font-bold text-primary hover:underline">Ver Itens</Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="widget-card">
                    <h3 className="widget-title !text-left !mb-6 font-bold flex items-center gap-2">
                        <PlusCircle size={20} className="text-orange-500" />
                        Último Produto Cadastrado
                    </h3>

                    {loading ? (
                        <div className="flex justify-center p-10"><RefreshCw className="animate-spin text-gray-300" /></div>
                    ) : stats.latestProduct ? (
                        <div className="recent-product-card !bg-gray-50 !border-gray-100">
                            <img src={stats.latestProduct.image} alt="" className="!w-24 !h-24" />
                            <div className="product-details">
                                <span className="category-tag">{stats.latestProduct.category}</span>
                                <h4 className="text-xl">{stats.latestProduct.name}</h4>
                                <div className="price-tag text-2xl">
                                    R$ {stats.latestProduct.price.toFixed(2)}
                                    <small className="text-sm">/{stats.latestProduct.unit}</small>
                                </div>
                            </div>
                            <Link to={`/admin/editar/${stats.latestProduct.id}`} className="edit-circle !bg-white">
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 py-10">Nenhum produto encontrado.</p>
                    )}

                    <div className="mt-8 flex gap-4">
                        <Link to="/admin/cadastro" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-90 no-underline">
                            <PlusCircle size={20} /> Cadastrar
                        </Link>
                        <Link to="/admin/lista" className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 no-underline">
                            <List size={20} /> Estoque
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
