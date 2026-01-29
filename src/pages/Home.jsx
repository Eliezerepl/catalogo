import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, X, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import bannerImg from '../assets/banner.png';

export function Home() {
    const { searchQuery, selectedCategory } = useOutletContext();
    const { addToCart, openDrawer } = useCart();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [toast, setToast] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        showToast(`"${product.name}" adicionado ao carrinho!`);
        openDrawer();
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('status', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setProducts(data || []);
            } catch (error) {
                console.error('Erro ao buscar produtos:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery, products]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="home-banner">
                <img src={bannerImg} alt="Banner Promocional Ardulimp" className="banner-image" />
            </div>
            <div className="products-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-image-wrapper p-4 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                            <img src={product.image} alt={product.name} className="product-image" />
                        </div>
                        <div className="product-info">
                            {/* <span className="product-category">{product.category}</span> */}
                            <h3 className="product-title text-gray-600">{product.name}</h3>
                            <div className="flex flex-col items-center mb-4">
                                <span className="product-price text-2xl text-primary font-extrabold mb-1">R$ {product.price.toFixed(2)}</span>
                                <span className="text-xs text-gray-500">ou 3x de R$ {(product.price / 3).toFixed(2)} Sem juros</span>
                            </div>
                            {/* <p className="product-desc">{product.description}</p> */}

                            <div className="product-footer w-full">
                                <button className="btn-add w-full" onClick={() => setSelectedProduct(product)}>
                                    Detalhes
                                </button>
                                <button className="btn-whatsapp-outline w-full" onClick={() => setSelectedProduct(product)}>
                                    <MessageCircle size={16} /> Comprar pelo Whats
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredProducts.length === 0 && (
                    <div className="empty-state col-span-full">
                        <p>Nenhum produto encontrado.</p>
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setSelectedProduct(null)}>
                            <X size={24} />
                        </button>
                        <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-image" />
                        <div className="modal-body">
                            <span className="product-category">{selectedProduct.category}</span>
                            <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                            <div className="text-xl font-bold text-indigo-600 mb-4">
                                R$ {selectedProduct.price.toFixed(2)} <span className="text-sm font-normal text-gray-500">/ {selectedProduct.unit}</span>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {selectedProduct.description}
                            </p>
                            <button
                                className="btn-add w-full justify-center py-3 text-lg"
                                onClick={() => {
                                    handleAddToCart(selectedProduct);
                                    setSelectedProduct(null);
                                }}
                            >
                                <Plus size={24} /> Adicionar ao Carrinho
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="notification">
                    {toast}
                </div>
            )}
        </div>
    );
}
