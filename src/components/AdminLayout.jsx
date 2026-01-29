import React from 'react';
import {
    LayoutDashboard,
    PlusCircle,
    List,
    ShoppingBag,
    ShoppingCart,
    LogOut,
    ExternalLink,
    Bell,
    User,
    Menu,
    Search
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';

export function AdminLayout({ children, title = "Painel" }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        navigate('/');
    };

    return (
        <div className="admin-wrapper">
            {/* Sidebar Consistente */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <img src={logoImg} alt="Ardulimp" style={{ height: '32px', marginRight: '10px' }} />
                    <span className="admin-logo-text">ADMIN ARDULIMP</span>
                </div>

                <div className="sidebar-search-container">
                    <div className="sidebar-search-box">
                        <Search size={14} />
                        <input type="text" placeholder="Buscar no sistema..." />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                        <LayoutDashboard size={18} />
                        Painel Geral
                    </Link>
                    <Link to="/admin/pedidos" className={`nav-link ${location.pathname.startsWith('/admin/pedido') ? 'active' : ''}`}>
                        <ShoppingCart size={18} />
                        Gerenciar Pedidos
                    </Link>
                    <Link to="/admin/lista" className={`nav-link ${location.pathname === '/admin/lista' ? 'active' : ''}`}>
                        <List size={18} />
                        Consultar Estoque
                    </Link>
                    <Link to="/admin/cadastro" className={`nav-link ${location.pathname === '/admin/cadastro' ? 'active' : ''}`}>
                        <PlusCircle size={18} />
                        Cadastrar Novo
                    </Link>

                    <div className="mt-auto p-4">
                        <Link to="/" className="nav-link site-link">
                            <ExternalLink size={18} />
                            Ir para o Site
                        </Link>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} />
                        <span>Encerrar Sessão</span>
                    </button>
                </div>
            </aside>

            {/* Área Principal */}
            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <Menu size={20} className="cursor-pointer" />
                        <span className="font-semibold text-gray-700">{title}</span>
                    </div>
                    <div className="topbar-right">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Sistema Online</span>
                        </div>
                        <User size={20} className="bg-gray-200 p-1 rounded-full" />
                        <Bell size={20} />
                    </div>
                </header>

                <div className="admin-content-inner">
                    {children}
                </div>
            </main>
        </div>
    );
}
