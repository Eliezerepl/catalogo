import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            if (data.user) {
                localStorage.setItem('isAdmin', 'true');
                navigate('/admin');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Falha no login: Usuário ou senha incorretos');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card animate-fadeIn">
                <div className="login-header">
                    <div className="login-logo">
                        <User size={32} />
                    </div>
                    <h1>Área Restrita</h1>
                    <p>Gerenciamento de Catálogo Ardulimp</p>
                </div>

                {error && (
                    <div className="login-error animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label>Usuário</label>
                        <div className="input-with-icon">
                            <User size={18} className="icon" />
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Senha</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="icon" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-submit-btn">
                        Acessar Painel <ArrowRight size={18} />
                    </button>
                </form>

                <div className="login-footer">
                    <Link to="/" className="back-to-site-link">
                        <ArrowLeft size={16} /> Voltar ao site
                    </Link>
                    <p className="mt-4">Acesso exclusivo para administradores</p>
                </div>
            </div>
        </div>
    );
}
