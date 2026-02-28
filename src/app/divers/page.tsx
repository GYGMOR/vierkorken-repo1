'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { SwipeGallery } from '@/components/ui/SwipeGallery';
import { EditableText } from '@/components/admin/EditableText';
import Link from 'next/link';

interface DiversProduct {
    id: string;
    title: string;
    description: string | null;
    price: number | string;
    image: string | null;
    gallery?: string[];
    type: 'SELL' | 'RENT';
    isActive: boolean;
}

export default function DiversPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'ADMIN';
    const { addItem } = useCart();

    const [products, setProducts] = useState<DiversProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const [headerImage, setHeaderImage] = useState('/images/layout/wein_regal_nah.jpg');
    const [isHeaderEditorOpen, setIsHeaderEditorOpen] = useState(false);

    // Editing state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<DiversProduct | null>(null);

    // View state
    const [viewingProduct, setViewingProduct] = useState<DiversProduct | null>(null);

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Rental Modal state
    const [rentalProduct, setRentalProduct] = useState<DiversProduct | null>(null);
    const [rentalForm, setRentalForm] = useState({ quantity: 1, name: '', email: '' });
    const [isSubmittingRental, setIsSubmittingRental] = useState(false);

    const openRentalModal = (product: DiversProduct) => {
        setRentalProduct(product);
        setRentalForm({ quantity: 1, name: '', email: '' });
    };

    const handleRentalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rentalProduct) return;

        setIsSubmittingRental(true);
        try {
            const res = await fetch('/api/rentals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productTitle: rentalProduct.title,
                    quantity: rentalForm.quantity,
                    name: rentalForm.name,
                    email: rentalForm.email
                })
            });
            const data = await res.json();
            if (data.success) {
                setRentalProduct(null);
                setToastMessage(`Ihre Mietanfrage für ${rentalProduct.title} wurde erfolgreich versendet.`);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 5000);
            } else {
                alert('Fehler beim Senden der Anfrage. Bitte versuchen Sie es später erneut.');
            }
        } catch (err) {
            console.error(err);
            alert('Fehler beim Senden der Anfrage.');
        } finally {
            setIsSubmittingRental(false);
        }
    };

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        image: '',
        gallery: [] as string[],
        type: 'SELL' as 'SELL' | 'RENT',
        isActive: true
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
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

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings?keys=divers_page_header_image');
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.settings) {
                    const hImage = data.settings.find((s: any) => s.key === 'divers_page_header_image');
                    if (hImage?.value) setHeaderImage(hImage.value);
                }
            }
        } catch (e) {
            console.error('Error fetching settings:', e);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchSettings();
    }, [isAdmin]);

    const saveHeaderImage = async (url: string) => {
        try {
            await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'divers_page_header_image', value: url }),
            });
            setHeaderImage(url);
            setIsHeaderEditorOpen(false);
        } catch (e) {
            console.error('Error saving setting:', e);
            alert('Speichern fehlgeschlagen');
        }
    };

    const openCreateModal = (type: 'SELL' | 'RENT' = 'SELL') => {
        setEditingProduct(null);
        setFormData({ title: '', description: '', price: '', image: '', gallery: [], type, isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (product: DiversProduct) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            description: product.description || '',
            price: product.price.toString(),
            image: product.image || '',
            gallery: product.gallery || [],
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
        setToastMessage(`${product.title} wurde zum Warenkorb hinzugefügt.`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
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
            {/* Toast */}
            {showToast && (
                <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md transition-opacity duration-300">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Editable Hero Section */}
            <div className="relative h-[400px] flex items-center justify-center overflow-hidden group border-b border-taupe-light">
                <div className="absolute inset-0 bg-graphite-dark">
                    <Image
                        src={headerImage}
                        alt="Divers Background"
                        fill
                        className="object-cover opacity-40 transition-opacity duration-700"
                        priority
                    />
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setIsHeaderEditorOpen(true)}
                        className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-graphite rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Header-Bild ändern"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                )}

                <div className="container-custom relative z-10 text-center text-white text-shadow-sm px-4">
                    <EditableText
                        settingKey="divers_page_header_title"
                        defaultValue="Divers"
                        isAdmin={isAdmin}
                        as="h1"
                        className="text-display font-serif font-light mb-6 text-white text-shadow-sm"
                    />
                    <EditableText
                        settingKey="divers_page_header_subtitle"
                        defaultValue="Entdecken Sie unser ausgewähltes Sortiment an exklusivem Weinzubehör, edlen Gläsern und Mietartikeln für Ihren perfekten Anlass."
                        isAdmin={isAdmin}
                        as="p"
                        className="text-body-lg text-white/90 max-w-2xl mx-auto text-shadow-sm"
                        multiline={true}
                    />
                </div>
            </div>

            <div className="container-custom py-16">

                {/* Produkte zum Verkaufen */}
                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-h2 font-serif text-graphite-dark">Produkte zum Kaufen</h2>
                        <div className="h-px bg-taupe-light flex-1"></div>
                    </div>

                    {(sellProducts.length > 0 || isAdmin) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {isAdmin && (
                                <div
                                    onClick={() => openCreateModal('SELL')}
                                    className="card border-2 border-dashed border-taupe-light hover:border-wine transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[400px] bg-warmwhite-light group shadow-none"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-taupe group-hover:text-wine group-hover:shadow-md transition-all mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <span className="font-serif text-graphite-dark group-hover:text-wine">Neues Kaufprodukt</span>
                                </div>
                            )}
                            {sellProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    isAdmin={isAdmin}
                                    onEdit={() => openEditModal(product)}
                                    onAddToCart={(e) => { e.stopPropagation(); addToCart(product); }}
                                    onClick={() => setViewingProduct(product)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-graphite/60 italic">Noch keine Produkte in dieser Kategorie.</p>
                    )}
                </div>

                {/* Mietprodukte */}
                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-h2 font-serif text-graphite-dark">Mietprodukte</h2>
                        <div className="h-px bg-taupe-light flex-1"></div>
                    </div>

                    {(rentProducts.length > 0 || isAdmin) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {isAdmin && (
                                <div
                                    onClick={() => openCreateModal('RENT')}
                                    className="card border-2 border-dashed border-taupe-light hover:border-wine transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[400px] bg-warmwhite-light group shadow-none"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-taupe group-hover:text-wine group-hover:shadow-md transition-all mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <span className="font-serif text-graphite-dark group-hover:text-wine">Neues Mietprodukt</span>
                                </div>
                            )}
                            {rentProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    isAdmin={isAdmin}
                                    onEdit={() => openEditModal(product)}
                                    onAddToCart={(e) => { e.stopPropagation(); openRentalModal(product); }}
                                    onClick={() => setViewingProduct(product)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-graphite/60 italic">Noch keine Mietprodukte vorhanden.</p>
                    )}
                </div>

                {/* Geschenkgutscheine Section */}
                <div className="mt-24 pt-16 border-t border-taupe-light/50">
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-accent-gold/10 to-warmwhite border-2 border-accent-gold/20 rounded-2xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
                            <svg className="w-64 h-64 text-accent-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-h2 font-serif text-wine-dark mb-4 group-hover:text-wine transition-colors">Suchen Sie ein passendes Geschenk?</h2>
                            <p className="text-body-lg text-graphite mb-10 max-w-2xl mx-auto border-b border-taupe-light/50 pb-8">
                                Überraschen Sie Ihre Liebsten mit einem luxuriösen Wertgutschein der Vier Korken Wein-Boutique – flexibel einsetzbar für Weine, Events & Zubehör.
                            </p>
                            <Link href="/geschenkgutscheine" className="btn btn-accent inline-flex items-center gap-3 text-lg py-4 px-8 group-hover:-translate-y-1 transition-transform shadow-md group-hover:shadow-xl hover:bg-accent-gold">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                                Geschenkgutschein kaufen
                            </Link>
                        </div>
                    </div>
                </div>

            </div>

            {/* Header Image Editor Modal */}
            {isHeaderEditorOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 lg:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-taupe-light/30">
                        <button onClick={() => setIsHeaderEditorOpen(false)} className="absolute top-4 right-4 text-graphite/40 hover:text-graphite transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h2 className="text-h3 font-serif text-graphite-dark mb-6">Header-Bild ändern</h2>
                        <ImageUploader onUploadComplete={saveHeaderImage} />
                    </div>
                </div>
            )}

            {/* Admin Product Editing Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 md:p-8 shadow-2xl border border-taupe-light/30">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-graphite/40 hover:text-wine p-2 transition-colors"
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

                            <div className="border-t border-taupe-light pt-6">
                                <label className="block text-sm font-medium text-graphite-dark mb-3">Haupt-Produktbild (Thumbnail)</label>
                                {formData.image ? (
                                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-taupe-light mb-4 group bg-warmwhite">
                                        <Image src={formData.image} alt="Vorschau" fill className="object-contain" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="btn btn-secondary bg-white text-sm">Bild entfernen</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-4">
                                        <ImageUploader onUploadComplete={(url) => setFormData({ ...formData, image: url })} />
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-taupe-light pt-6">
                                <label className="block text-sm font-medium text-graphite-dark mb-3">Bildergalerie (Zusätzlich zum Profilbild)</label>
                                {formData.gallery.length > 0 && (
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                        {formData.gallery.map((img, idx) => (
                                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-taupe-light h-24 bg-warmwhite">
                                                <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newGallery = formData.gallery.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, gallery: newGallery });
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Löschen"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <ImageUploader onUploadComplete={(url) => setFormData({ ...formData, gallery: [...formData.gallery, url] })} />
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-taupe-light mt-8">
                                {editingProduct ? (
                                    <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors">
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

            {/* Product View Modal */}
            {viewingProduct && (
                <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setViewingProduct(null)}>
                    <div
                        className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden relative flex flex-col md:flex-row shadow-2xl animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setViewingProduct(null)}
                            className="absolute z-20 top-4 right-4 bg-white/90 hover:bg-white hover:text-wine text-graphite p-2 rounded-full shadow-sm transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {/* Gallery Side */}
                        <div className="w-full md:w-1/2 bg-warmwhite relative border-r border-taupe-light/30">
                            {viewingProduct.gallery && viewingProduct.gallery.length > 0 ? (
                                <SwipeGallery images={[...(viewingProduct.image ? [viewingProduct.image] : []), ...viewingProduct.gallery]} />
                            ) : viewingProduct.image ? (
                                <div className="relative w-full h-72 md:h-full min-h-[350px]">
                                    <Image src={viewingProduct.image} alt={viewingProduct.title} fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="h-72 md:h-full flex flex-col items-center justify-center text-taupe bg-warmwhite-light">
                                    <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span className="font-serif">Kein Bild vorhanden</span>
                                </div>
                            )}
                        </div>

                        {/* Content Side */}
                        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col max-h-[50vh] md:max-h-none overflow-y-auto">
                            {viewingProduct.type === 'RENT' && (
                                <span className="inline-block px-4 py-1.5 bg-taupe-light/50 text-graphite-dark text-xs uppercase tracking-widest font-semibold rounded-full w-fit mb-6 border border-taupe/20">
                                    Mietartikel
                                </span>
                            )}
                            <h2 className="text-h2 font-serif text-graphite-dark mb-4">{viewingProduct.title}</h2>

                            <div className="font-serif text-4xl text-wine mb-8">
                                CHF {Number(viewingProduct.price).toFixed(2)}
                            </div>

                            {viewingProduct.description && (
                                <div className="prose prose-stone text-graphite text-lg flex-1 mb-10 whitespace-pre-wrap leading-relaxed">
                                    {viewingProduct.description}
                                </div>
                            )}

                            <div className="mt-auto pt-8 w-full">
                                {viewingProduct.type === 'RENT' ? (
                                    <button
                                        onClick={() => {
                                            openRentalModal(viewingProduct);
                                            setViewingProduct(null);
                                        }}
                                        className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Mietanfrage senden
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            addToCart(viewingProduct);
                                            setViewingProduct(null);
                                        }}
                                        className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                        In den Warenkorb
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rental Product Form Modal */}
            {rentalProduct && (
                <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setRentalProduct(null)}>
                    <div
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 md:p-8 shadow-2xl border border-taupe-light/30 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setRentalProduct(null)}
                            className="absolute z-20 top-4 right-4 bg-white/90 hover:bg-white text-graphite hover:text-wine p-2 rounded-full shadow-sm transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h2 className="text-h3 font-serif text-graphite-dark mb-4">Mietanfrage für {rentalProduct.title}</h2>
                        <p className="text-graphite mb-6 text-sm">Bitte füllen Sie das Formular aus, um eine unverbindliche Mietanfrage für diesen Artikel zu stellen. Wir werden uns in Kürze bei Ihnen melden.</p>

                        <form onSubmit={handleRentalSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-graphite-dark mb-1">Anzahl gewünschter Artikel ({Number(rentalProduct.price) > 0 ? `CHF ${Number(rentalProduct.price).toFixed(2)} / Stück` : 'Preis auf Anfrage'})</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    className="w-full form-input"
                                    value={rentalForm.quantity}
                                    onChange={e => setRentalForm({ ...rentalForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-graphite-dark mb-1">Ihr Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full form-input"
                                    value={rentalForm.name}
                                    onChange={e => setRentalForm({ ...rentalForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-graphite-dark mb-1">Ihre E-Mail Adresse</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full form-input"
                                    value={rentalForm.email}
                                    onChange={e => setRentalForm({ ...rentalForm, email: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-taupe-light mt-6">
                                <button type="button" onClick={() => setRentalProduct(null)} className="btn btn-outline flex-1">Abbrechen</button>
                                <button type="submit" disabled={isSubmittingRental} className="btn btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isSubmittingRental ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Wird gesendet...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            Anfrage senden
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </MainLayout>
    );
}

// Product Card Component
function ProductCard({ product, isAdmin, onEdit, onAddToCart, onClick }: { product: DiversProduct, isAdmin: boolean, onEdit: () => void, onAddToCart: (e: React.MouseEvent) => void, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`card group overflow-hidden border transition-all duration-300 flex flex-col h-full cursor-pointer ${!product.isActive ? 'border-dashed border-gray-300 opacity-60' : 'border-transparent shadow-soft hover:shadow-strong hover:-translate-y-1'}`}
        >
            <div className="relative aspect-square w-full bg-warmwhite overflow-hidden flex-shrink-0">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-graphite/30">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                )}

                {/* Admin Edit Button over Image */}
                {isAdmin && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-graphite hover:text-blue-600 rounded-full p-2.5 shadow-md transition-all opacity-0 group-hover:opacity-100"
                        title="Bearbeiten"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                )}

                {/* Labels */}
                {!product.isActive && isAdmin && (
                    <div className="absolute top-3 left-3 bg-gray-800 text-white text-xs px-2 py-1 rounded font-medium shadow-sm">Versteckt</div>
                )}
                {product.type === 'RENT' && (
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-graphite-dark text-xs px-2.5 py-1 rounded-full font-semibold border border-taupe/20 shadow-sm">Miete</div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1 bg-white">
                <h3 className="text-h4 font-serif text-graphite-dark mb-2 group-hover:text-wine transition-colors">{product.title}</h3>
                {product.description && (
                    <p className="text-graphite text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                )}

                <div className="mt-auto pt-4 border-t border-taupe-light/50 flex items-center justify-between">
                    <div className="font-serif text-xl border-taupe text-wine-dark">CHF {Number(product.price).toFixed(2)}</div>
                    {product.type === 'RENT' ? (
                        <button
                            onClick={onAddToCart}
                            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-warmwhite-light border border-taupe-light text-wine hover:bg-wine hover:text-white hover:border-transparent transition-all shadow-sm"
                            title="Mietanfrage"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </button>
                    ) : (
                        <button
                            onClick={onAddToCart}
                            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-warmwhite-light border border-taupe-light text-wine hover:bg-wine hover:text-white hover:border-transparent transition-all shadow-sm"
                            title="In den Warenkorb"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
