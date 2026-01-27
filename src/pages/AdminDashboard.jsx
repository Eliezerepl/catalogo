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
    LogOut,
    ExternalLink,
    Bell,
    Settings as SettingsIcon,
    Menu,
    Calendar,
    Flag,
    Users,
    ShoppingCart,
    Archive,
    DollarSign,
    ChevronRight,
    HelpCircle,
    User,
    ThumbsUp,
    ThumbsDown,
    ChevronDown,
    MoreHorizontal
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
            {/* Sidebar inspirada na imagem */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="admin-logo-img">
                        <ShoppingCart size={20} />
                    </div>
                    <span className="admin-logo-text">GESTÃO ONLINE</span>
                </div>

                <div className="sidebar-search-container">
                    <div className="sidebar-search-box">
                        <Search size={14} />
                        <input type="text" placeholder="Procurar opção do menu..." />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/admin" className="nav-link active">
                        <LayoutDashboard size={18} />
                        Painel
                    </Link>
                    <div className="nav-link"><Calendar size={18} /> Agenda</div>
                    <div className="nav-link"><Flag size={18} /> Emitente</div>
                    <div className="nav-link"><Users size={18} /> Pessoas</div>
                    <Link to="/admin/lista" className="nav-link">
                        <Package size={18} />
                        Produtos
                    </Link>
                    <div className="nav-link"><ShoppingBag size={18} /> Vendas</div>
                    <div className="nav-link"><Archive size={18} /> Estoque <ChevronDown size={14} className="ml-auto" /></div>
                    <div className="nav-link"><DollarSign size={18} /> Financeiro <ChevronDown size={14} className="ml-auto" /></div>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} />
                        <span>Sair Admin</span>
                    </button>
                </div>
            </aside>

            {/* Área Principal */}
            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <Menu size={20} className="cursor-pointer" />
                        <span className="font-semibold text-gray-700">Painel</span>
                    </div>
                    <div className="topbar-right">
                        <span className="hidden md:inline hover:underline cursor-pointer">Manual Sistema Gestão Online</span>
                        <User size={20} className="bg-gray-200 p-1 rounded-full" />
                        <div className="relative">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center"></span>
                        </div>
                    </div>
                </header>

                <div className="admin-content-inner">
                    {/* Grid de 4 Cards Coloridos (Igual à imagem) */}
                    <div className="dashboard-grid">
                        <div className="admin-stat-card vendas-hoje">
                            <div className="stat-main">
                                <div>
                                    <h3 className="stat-v-value">66,00</h3>
                                    <span className="stat-v-label">Vendas Hoje</span>
                                </div>
                                <ShoppingCart size={48} className="opacity-20" />
                            </div>
                            <div className="stat-footer">
                                <span>Ticket Médio $33.00 - Ref. 2 Venda(s)</span>
                            </div>
                        </div>

                        <div className="admin-stat-card vendas-periodo">
                            <div className="stat-main">
                                <div>
                                    <h3 className="stat-v-value">68,00</h3>
                                    <span className="stat-v-label">Vendas (Período)</span>
                                </div>
                                <TrendingUp size={48} className="opacity-20" />
                            </div>
                            <div className="stat-footer">
                                <span>Ticket Médio $22.67 - Ref. 3 Venda(s)</span>
                            </div>
                        </div>

                        <div className="admin-stat-card receber-hoje">
                            <div className="stat-main">
                                <div>
                                    <h3 className="stat-v-value">30,00</h3>
                                    <span className="stat-v-label">Receber Hoje</span>
                                </div>
                                <ThumbsUp size={48} className="opacity-20" />
                            </div>
                            <div className="stat-footer">
                                <span>Calendário</span>
                                <ChevronRight size={14} />
                            </div>
                        </div>

                        <div className="admin-stat-card pagar-hoje">
                            <div className="stat-main">
                                <div>
                                    <h3 className="stat-v-value">30,00</h3>
                                    <span className="stat-v-label">Pagar Hoje</span>
                                </div>
                                <ThumbsDown size={48} className="opacity-20" />
                            </div>
                            <div className="stat-footer">
                                <span>Calendário</span>
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo Central (Widgets) */}
                    <div className="dashboard-widgets-container mt-4">
                        {/* Tabela de Vendas Recentes */}
                        <div className="widget-card">
                            <table className="recent-sales-table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Cliente Modelo 1</td>
                                        <td>30,00</td>
                                        <td><span className="venda-badge">VENDA</span></td>
                                    </tr>
                                    <tr>
                                        <td>Cliente Modelo 2</td>
                                        <td>36,00</td>
                                        <td><span className="venda-badge">VENDA</span></td>
                                    </tr>
                                    <tr>
                                        <td>Cliente Modelo 2</td>
                                        <td>2,00</td>
                                        <td><span className="venda-badge">VENDA</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Gráfico de Vendas (Diário) */}
                        <div className="widget-card">
                            <h3 className="widget-title">Vendas (Diário)</h3>
                            <div className="dummy-chart-container">
                                <span className="y-axis-label">R$ Total Geral</span>
                                <div className="chart-bar h-[10%]" title="31/08/2018: 2,00">
                                    <span className="chart-bar-value">2,00</span>
                                    <span className="chart-bar-label">31/08/2018</span>
                                </div>
                                <div className="chart-bar h-[90%] ml-auto" title="03/09/2018: 66,00">
                                    <span className="chart-bar-value">66,00</span>
                                    <span className="chart-bar-label">03/09/2018</span>
                                </div>
                                <span className="x-axis-label">Data</span>
                            </div>
                        </div>

                        {/* Card Lateral de Info/Propaganda */}
                        <div className="widget-card flex flex-col items-center text-center">
                            <p className="text-gray-500 text-sm mb-4">Já pensou seus produtos expostos nos</p>
                            <h4 className="font-bold text-gray-800 mb-6">maiores e-commerces do Brasil?</h4>

                            <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center p-4 mb-4">
                                {/* Ícone de marketplace centralizado */}
                                <div className="relative">
                                    <ShoppingBag className="text-primary" size={60} />
                                    <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500 rounded-full"></div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 mt-auto">Solicite mais informações<br />No CHAT online..</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
