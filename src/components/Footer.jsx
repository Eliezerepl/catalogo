import React from 'react';
import { Link } from 'react-router-dom';
import {
    Instagram,
    Facebook,
    Mail,
    MapPin,
    Phone,
    MessageCircle,
    ShoppingBag,
    ShieldCheck,
    Truck
} from 'lucide-react';
import { CATEGORIES } from '../data';
import logoImg from '../assets/logo.png';

export function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <Link to="/" className="logo footer-logo">
                            <img src={logoImg} alt="Ardulimp Logo" className="logo-img" style={{ height: '40px' }} />
                        </Link>
                        <p className="footer-desc">
                            Especialistas em soluções de limpeza e organização para sua casa ou empresa.
                            Qualidade, economia e entrega rápida em um só lugar.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-icon" aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="social-icon" aria-label="Facebook">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="social-icon" aria-label="WhatsApp">
                                <MessageCircle size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links">
                        <h4 className="footer-title">Navegação</h4>
                        <ul>
                            <li><Link to="/">Início</Link></li>
                            <li><Link to="/carrinho">Meu Carrinho</Link></li>
                            <li><Link to="/login">Minha Conta</Link></li>
                            <li><Link to="/admin">Área Administrativa</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="footer-links">
                        <h4 className="footer-title">Categorias</h4>
                        <ul>
                            {CATEGORIES.slice(0, 5).map(cat => (
                                <li key={cat}>
                                    <Link to={`/?category=${cat}`}>{cat}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-contact">
                        <h4 className="footer-title">Contato</h4>
                        <div className="contact-item">
                            <MapPin size={18} className="text-primary" />
                            <span>Rua Exemplo, 123 - Centro<br />São Paulo - SP</span>
                        </div>
                        <div className="contact-item">
                            <Phone size={18} className="text-primary" />
                            <span>(19) 93500-4003</span>
                        </div>
                        <div className="contact-item">
                            <Mail size={18} className="text-primary" />
                            <span>contato@ardulimp.com.br</span>
                        </div>
                    </div>
                </div>

                <div className="footer-features">
                    <div className="feature-item">
                        <Truck size={24} />
                        <div>
                            <h5>Entrega Rápida</h5>
                            <p>Para toda a região</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <ShieldCheck size={24} />
                        <div>
                            <h5>Compra Segura</h5>
                            <p>Dados protegidos</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <ShoppingBag size={24} />
                        <div>
                            <h5>Atacado & Varejo</h5>
                            <p>Melhores preços</p>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Ardulimp. Todos os direitos reservados.</p>
                    <div className="footer-bottom-links">
                        <a href="#">Privacidade</a>
                        <a href="#">Termos de Uso</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
