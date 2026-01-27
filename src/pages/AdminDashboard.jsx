import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    List,
    TrendingUp,
    Box,
    ArrowRight,
    Search,
    ShoppingBag,
    Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        categories: 0,
        latestProduct: null
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
                const uniqueCategories = new Set(products.map(p => p.category));
                setStats({
                    totalProducts: products.length,
                    categories: uniqueCategories.size,
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
        <div className="container py-8 max-w-6xl mx-auto">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4 mb-2">
                    <LayoutDashboard className="text-primary" size={40} />
                    Painel Administrativo
                </h1>
                <p className="text-gray-500 font-medium">Bem-vindo de volta! Aqui está um resumo do seu catálogo.</p>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="admin-stat-card">
                    <div className="stat-icon bg-primary-light text-primary">
                        <Package size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total de Produtos</span>
                        <h3 className="stat-value">{stats.totalProducts}</h3>
                    </div>
                    <TrendingUp className="stat-trend text-green-500" size={20} />
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon bg-orange-100 text-orange-600">
                        <Box size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Categorias</span>
                        <h3 className="stat-value">{stats.categories}</h3>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon bg-blue-100 text-blue-600">
                        <ShoppingBag size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Visualizações</span>
                        <h3 className="stat-value">--</h3>
                    </div>
                </div>
            </div>

            {/* Actions & Recent Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Ações Rápidas
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/admin/cadastro" className="admin-action-box no-underline">
                            <PlusCircle size={32} className="text-primary" />
                            <div>
                                <h4>Novo Produto</h4>
                                <p>Cadastre um item novo no seu estoque.</p>
                            </div>
                        </Link>
                        <Link to="/admin/lista" className="admin-action-box no-underline">
                            <List size={32} className="text-orange-500" />
                            <div>
                                <h4>Consultar Lista</h4>
                                <p>Gerencie seus produtos existentes.</p>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Último Adicionado
                    </h2>
                    {loading ? (
                        <div className="admin-glass-card h-40 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : stats.latestProduct ? (
                        <div className="admin-glass-card p-6 flex items-center gap-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border">
                                <img src={stats.latestProduct.image} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1">
                                <span className="text-xs font-bold text-primary uppercase">{stats.latestProduct.category}</span>
                                <h4 className="text-lg font-bold text-gray-900">{stats.latestProduct.name}</h4>
                                <p className="text-xl font-black text-gray-900">R$ {stats.latestProduct.price.toFixed(2)}</p>
                                <Link to={`/admin/editar/${stats.latestProduct.id}`} className="text-sm font-bold text-primary flex items-center gap-1 mt-2 no-underline hover:underline">
                                    Editar Produto <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="admin-glass-card p-6 text-center text-gray-400">
                            Nenhum produto cadastrado ainda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
