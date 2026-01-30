import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, MessageCircle, ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

const WHATSAPP_NUMBER = "5519935004003";

export function CartPage() {
    const { cart, updateQty, removeFromCart, cartTotalItems, clearCart } = useCart();
    const [isSaving, setIsSaving] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({
        name: "",
        neighborhood: "",
        deliveryType: "Retirar",
        obs: ""
    });

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleCheckout = async () => {
        if (!checkoutForm.name || !checkoutForm.neighborhood) {
            alert("Por favor, preencha Nome e Bairro.");
            return;
        }

        if (cart.length === 0) {
            alert("O carrinho está vazio.");
            return;
        }

        try {
            setIsSaving(true);
            const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

            // 1. Salva no Banco de Dados
            const { data: order, error } = await supabase
                .from('orders')
                .insert([{
                    customer_name: checkoutForm.name,
                    customer_neighborhood: checkoutForm.neighborhood,
                    delivery_type: checkoutForm.deliveryType,
                    observations: checkoutForm.obs,
                    items: cart,
                    total_amount: totalAmount,
                    status: 'Pendente'
                }])
                .select()
                .single();

            if (error) throw error;

            // 2. Prepara mensagem do WhatsApp
            const itemsList = cart.map(item =>
                `• *${item.qty}x ${item.name}* (${item.unit})`
            ).join('\n');

            const message = `*NOVO PEDIDO #${order.id}*\n\n` +
                `*Nome:* ${checkoutForm.name}\n` +
                `*Bairro:* ${checkoutForm.neighborhood}\n` +
                `*Entrega:* ${checkoutForm.deliveryType}\n\n` +
                `*Itens:*\n${itemsList}\n\n` +
                `*Total:* R$ ${totalAmount.toFixed(2).replace('.', ',')}\n\n` +
                `*Observações:* ${checkoutForm.obs || 'Nenhuma'}`;

            // 3. Limpa o carrinho e redireciona direto
            clearCart();
            const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
            window.location.href = '/'; // Redireciona para home após abrir whatsapp

        } catch (error) {
            console.error('Erro ao processar pedido:', error);
            alert('Ocorreu um erro ao enviar seu pedido. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh]">
                <ShoppingCart size={64} className="text-gray-300 mb-6" />
                <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
                <p className="text-gray-500 mb-8">Adicione itens para solicitar um orçamento.</p>
                <Link to="/" className="btn-add">
                    Voltar para o Catálogo
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-8 cart-page">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6">
                <ArrowLeft size={20} /> Voltar comprando
            </Link>

            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <ShoppingCart /> Carrinho de Compras
            </h1>

            <div className="cart-layout md:flex md:gap-8">
                {/* Cart Items List */}
                {!showCheckout ? (
                    <div className="cart-items-section flex-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            {cart.map(item => (
                                <div key={item.id} className="p-4 border-b border-gray-100 flex gap-4 items-center">
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md bg-gray-100" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{item.name}</h3>
                                        <p className="text-gray-500 text-sm">Unidade: {item.unit}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="qty-controls flex items-center border rounded">
                                            <button className="p-2 hover:bg-gray-50" onClick={() => updateQty(item.id, -1)}><Minus size={16} /></button>
                                            <span className="w-8 text-center font-medium">{item.qty}</span>
                                            <button className="p-2 hover:bg-gray-50" onClick={() => updateQty(item.id, 1)}><Plus size={16} /></button>
                                        </div>
                                        <button
                                            className="text-red-500 text-sm hover:underline flex items-center gap-1"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 size={14} /> Remover
                                        </button>
                                        <div className="font-bold text-primary">
                                            R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <div className="text-right">
                                <p className="text-gray-500 mb-2">Total de {cartTotalItems} itens</p>
                                <button
                                    className="btn-add px-8 py-3 text-lg"
                                    onClick={() => setShowCheckout(true)}
                                >
                                    Continuar para Orçamento
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Checkout Form */
                    <div className="checkout-section flex-1 max-w-2xl mx-auto">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <button
                                className="text-sm text-gray-500 mb-6 flex items-center gap-1 hover:text-black"
                                onClick={() => setShowCheckout(false)}
                            >
                                <ArrowLeft size={16} /> Voltar para revisão do carrinho
                            </button>

                            <h2 className="text-2xl font-bold mb-6">Finalizar Orçamento</h2>

                            <div className="space-y-4">
                                <div className="form-group">
                                    <label className="form-label">Nome Completo *</label>
                                    <input
                                        type="text"
                                        className="form-input w-full"
                                        placeholder="Digite seu nome"
                                        value={checkoutForm.name}
                                        onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Bairro *</label>
                                    <input
                                        type="text"
                                        className="form-input w-full"
                                        placeholder="Seu bairro aqui"
                                        value={checkoutForm.neighborhood}
                                        onChange={e => setCheckoutForm({ ...checkoutForm, neighborhood: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Opção de Entrega</label>
                                    <select
                                        className="form-select w-full"
                                        value={checkoutForm.deliveryType}
                                        onChange={e => setCheckoutForm({ ...checkoutForm, deliveryType: e.target.value })}
                                    >
                                        <option value="Retirar">Retirar na Loja</option>
                                        <option value="Entrega">Solicitar Entrega</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Observações</label>
                                    <textarea
                                        className="form-textarea w-full"
                                        rows="3"
                                        placeholder="Alguma observação sobre o pedido?"
                                        value={checkoutForm.obs}
                                        onChange={e => setCheckoutForm({ ...checkoutForm, obs: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="pt-4 border-t border-gray-100 mt-4">
                                    <p className="font-bold text-lg mb-4">Resumo do Pedido</p>
                                    <div className="space-y-3 mb-6">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex justify-between items-start text-sm">
                                                <div className="flex-1">
                                                    <span className="font-bold">{item.qty}x</span> {item.name}
                                                </div>
                                                <span className="font-semibold ml-4">
                                                    R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mb-4 text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        <span className="font-bold">Total Final:</span>
                                        <span className="font-bold text-primary text-xl">
                                            R$ {cart.reduce((acc, item) => acc + (item.price * item.qty), 0).toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                    <button
                                        className="btn-whatsapp w-full justify-center"
                                        onClick={handleCheckout}
                                        disabled={!checkoutForm.name || !checkoutForm.neighborhood || isSaving}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <MessageCircle size={20} /> Enviar Pedido no WhatsApp
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
