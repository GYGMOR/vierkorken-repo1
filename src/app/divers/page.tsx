'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface DiversProduct {
    id: string;
    title: string;
    description: string | null;
    price: number | string;
    image: string | null;
    type: 'SELL' | 'RENT';
    isActive: boolean;
}

export default function DiversPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'ADMIN';
    const { addItem } = useCart();

    const [products, setProducts] = useState<DiversProduct[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<DiversProduct | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        image: '',
        type: 'SELL' as 'SELL' | 'RENT',
        isActive: true
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Regular users only see active products. Admins see all.
            const url = isAdmin ? '/api/divers' : '/api/divers?active=true';
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Error fetching divers products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [isAdmin]);

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({ title: '', description: '', price: '', image: '', type: 'SELL', isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (product: DiversProduct) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            description: product.description || '',
            price: product.price.toString(),
            image: product.image || '',
            type: product.type,
            isActive: product.isActive
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const isEditing = !!editingProduct;
            const method = isEditing ? 'PUT' : 'POST';
            const body = isEditing ? { id: editingProduct.id, ...formData } : formData;

            const res = await fetch('/api/divers', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchProducts();
            } else {
                alert('Ein Fehler ist aufgetreten.');
            }
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const handleDelete = async () => {
        if (!editingProduct) return;
        if (!confirm('Produkt wirklich löschen?')) return;

        try {
            const res = await fetch(`/api/divers?id=${editingProduct.id}`, { method: 'DELETE' });
            if (res.ok) {
                setIsModalOpen(false);
                fetchProducts();
            } else {
                alert('Löschen fehlgeschlagen.');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const addToCart = (product: DiversProduct) => {
        addItem({
            id: product.id,
            name: product.title,
            price: Number(product.price),
            imageUrl: product.image || undefined,
            type: 'divers'
        });
        alert(`${product.title} wurde zum Warenkorb hinzugefügt.`);
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine"></div>
                </div>
            </MainLayout>
        );
    }

    const sellProducts = products.filter(p => p.type === 'SELL');
    const rentProducts = products.filter(p => p.type === 'RENT');

    return (
        <MainLayout>
            {/* Hero Section */}
            <div className="bg-warmwhite-light border-b border-taupe-light py-16 lg:py-24 relative overflow-hidden">
                <div className="container-custom relative z-10 text-center">
                    <h1 className="text-display font-serif text-graphite-dark mb-6">Divers</h1>
                    <p className="text-body-lg text-graphite max-w-2xl mx-auto">
                        Entdecken Sie unser ausgewähltes Sortiment an exklusivem Weinzubehör, edlen Gläsern und Mietartikeln für Ihren perfekten Anlass.
                    </p>

                    {isAdmin && (
                        <div className="mt-8">
                            <button onClick={openCreateModal} className="btn bg-wine text-white hover:bg-wine-dark inline-flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Neues Produkt anlegen
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="container-custom py-16">

                {/* Produkte zum Verkaufen */}
                {(sellProducts.length > 0 || isAdmin) && (
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-h2 font-serif text-graphite-dark">Produkte zum Kaufen</h2>
                            <div className="h-px bg-taupe-light flex-1"></div>
                        </div>

                        {sellProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {sellProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        isAdmin={isAdmin}
                                        onEdit={() => openEditModal(product)}
                                        onAddToCart={() => addToCart(product)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-graphite/60 italic">Noch keine Produkte in dieser Kategorie.</p>
                        )}
                    </div>
                )}

                {/* Mietprodukte */}
                {(rentProducts.length > 0 || isAdmin) && (
                    <div className="mb-10">
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-h2 font-serif text-graphite-dark">Mietprodukte</h2>
                            <div className="h-px bg-taupe-light flex-1"></div>
                        </div>

                        {rentProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {rentProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        isAdmin={isAdmin}
                                        onEdit={() => openEditModal(product)}
                                        onAddToCart={() => addToCart(product)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-graphite/60 italic">Noch keine Mietprodukte vorhanden.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Admin Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 md:p-8">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-graphite hover:text-wine p-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h2 className="text-h3 font-serif text-graphite-dark mb-6">
                            {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt anlegen'}
                        </h2>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-graphite-dark mb-1">Titel</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full form-input"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-graphite-dark mb-1">Preis (CHF)</label>
                                    <input
                                        type="number"
                                        step="0.05"
                                        required
                                        className="w-full form-input"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-graphite-dark mb-1">Beschreibung</label>
                                <textarea
                                    className="w-full form-input"
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-graphite-dark mb-1">Kategorie</label>
                                    <select
                                        className="w-full form-input"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as 'SELL' | 'RENT' })}
                                    >
                                        <option value="SELL">Kaufen</option>
                                        <option value="RENT">Mieten</option>
                                    </select>
                                </div>
                                <div className="flex items-center mt-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formData.isActive}
                                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            />
                                            <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                        <span className="text-sm font-medium text-graphite-dark">Produkt ist sichtbar</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-graphite-dark mb-1">Produktbild</label>
                                {formData.image ? (
                                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-taupe-light mb-4 group bg-warmwhite">
                                        <Image src={formData.image} alt="Vorschau" fill className="object-contain" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="btn btn-secondary bg-white text-sm">Bild entfernen</button>
                                        </div>
                                    </div>
                                ) : (
                                    <ImageUploader onUploadComplete={(url) => setFormData({ ...formData, image: url })} />
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-taupe-light">
                                {editingProduct ? (
                                    <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-700 font-medium text-sm">
                                        Produkt löschen
                                    </button>
                                ) : <div></div>}

                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Abbrechen</button>
                                    <button type="submit" className="btn btn-primary">Speichern</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

// Product Card Component
function ProductCard({ product, isAdmin, onEdit, onAddToCart }: { product: DiversProduct, isAdmin: boolean, onEdit: () => void, onAddToCart: () => void }) {
    return (
        <div className={`card group overflow-hidden border transition-all duration-300 flex flex-col h-full ${!product.isActive ? 'border-dashed border-gray-300 opacity-60' : 'border-transparent shadow-soft hover:shadow-medium'}`}>
            <div className="relative aspect-square w-full bg-warmwhite overflow-hidden">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-graphite/30">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                )}

                {/* Admin Edit Button over Image */}
                {isAdmin && (
                    <button
                        onClick={onEdit}
                        className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-graphite hover:text-blue-600 rounded-full p-2.5 shadow-md transition-all opacity-0 group-hover:opacity-100"
                        title="Bearbeiten"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                )}

                {/* Labels */}
                {!product.isActive && isAdmin && (
                    <div className="absolute top-3 left-3 bg-gray-800 text-white text-xs px-2 py-1 rounded font-medium">Versteckt</div>
                )}
                {product.type === 'RENT' && (
                    <div className="absolute bottom-3 right-3 bg-taupe-light/90 backdrop-blur-sm text-graphite-dark text-xs px-2 py-1 rounded font-medium border border-taupe/30">Miete</div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-h4 font-serif text-graphite-dark mb-2">{product.title}</h3>
                {product.description && (
                    <p className="text-graphite text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                )}

                <div className="mt-auto pt-4 border-t border-taupe-light/50 flex items-center justify-between">
                    <div className="font-serif text-xl text-wine">CHF {Number(product.price).toFixed(2)}</div>
                    <button
                        onClick={onAddToCart}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-warmwhite-dark text-wine hover:bg-wine hover:text-white transition-colors"
                        title="In den Warenkorb"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
