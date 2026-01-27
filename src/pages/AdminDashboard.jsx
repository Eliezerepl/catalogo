import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    List,
    TrendingUp,
    Box,
    ArrowRight,
    ShoppingBag,
    LogOut,
    ExternalLink,
    Bell,
    Settings as SettingsIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AdminDashboard() {
    const navigate = useNavigate();
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

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        navigate('/');
    };

    return (
        <div className="admin-wrapper">
            {/* Sidebar Lateral */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="admin-logo">
                        <LayoutDashboard size={28} />
                        <span>ADMIN BHB</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/admin" className="nav-link active">
                        <LayoutDashboard size={20} />
                        Painel Geral
                    </Link>
                    <Link to="/admin/lista" className="nav-link">
                        <List size={20} />
                        Produtos
                    </Link>
                    <Link to="/admin/cadastro" className="nav-link">
                        <PlusCircle size={20} />
                        Novo Cadastro
                    </Link>
                    <div className="nav-divider"></div>
                    <Link to="/" className="nav-link site-link">
                        <ExternalLink size={20} />
                        Ver Loja
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Sair Admin</span>
                    </button>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="welcome-msg">
                        <h2>Olá, Administrador</h2>
                        <p>Visão geral do sistema</p>
                    </div>
                    <div className="topbar-actions">
                        <button className="icon-badge-btn">
                            <Bell size={20} />
                            <span className="dot"></span>
                        </button>
                        <div className="admin-user-profile">
                            <div className="avatar">AD</div>
                        </div>
                    </div>
                </header>

                <div className="admin-content-inner">
                    {/* Cards de Métricas */}
                    <div className="dashboard-grid">
                        <div className="admin-stat-card primary">
                            <div className="stat-content">
                                <span className="stat-label">Produtos Ativos</span>
                                <h3 className="stat-value">{stats.totalProducts}</h3>
                                <div className="stat-badge">Total Geral</div>
                            </div>
                            <Package className="stat-bg-icon" size={80} />
                        </div>

                        <div className="admin-stat-card secondary">
                            <div className="stat-content">
                                <span className="stat-label">Categorias</span>
                                <h3 className="stat-value">{stats.categories}</h3>
                                <div className="stat-badge">Segmentos</div>
                            </div>
                            <Box className="stat-bg-icon" size={80} />
                        </div>

                        <div className="admin-stat-card accent">
                            <div className="stat-content">
                                <span className="stat-label">Status do Sistema</span>
                                <h3 className="stat-value">Ativo</h3>
                                <div className="stat-badge">Supabase Online</div>
                            </div>
                            <TrendingUp className="stat-bg-icon" size={80} />
                        </div>
                    </div>

                    {/* Ações e Último Produto */}
                    <div className="admin-flex-grid mt-10">
                        <div className="flex-card action-section">
                            <h3 className="section-title">Ações Rápidas</h3>
                            <div className="quick-actions-grid">
                                <Link to="/admin/cadastro" className="quick-btn plus">
                                    <PlusCircle size={40} />
                                    <span>Cadastrar Produto</span>
                                </Link>
                                <Link to="/admin/lista" className="quick-btn list">
                                    <List size={40} />
                                    <span>Gerenciar Estoque</span>
                                </Link>
                            </div>
                        </div>

                        <div className="flex-card recent-section">
                            <div className="section-header">
                                <h3 className="section-title">Recém Adicionado</h3>
                                <Link to="/admin/lista" className="text-link">Ver lista completa</Link>
                            </div>

                            {loading ? (
                                <div className="loading-placeholder">Carregando...</div>
                            ) : stats.latestProduct ? (
                                <div className="recent-product-card">
                                    <img src={stats.latestProduct.image} alt="" />
                                    <div className="product-details">
                                        <span className="category-tag">{stats.latestProduct.category}</span>
                                        <h4>{stats.latestProduct.name}</h4>
                                        <div className="price-tag">
                                            R$ {stats.latestProduct.price.toFixed(2)}
                                            <small>/{stats.latestProduct.unit}</small>
                                        </div>
                                    </div>
                                    <Link to={`/admin/editar/${stats.latestProduct.id}`} className="edit-circle">
                                        <ArrowRight size={20} />
                                    </Link>
                                </div>
                            ) : (
                                <p className="empty-msg">Nenhum produto cadastrado.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
