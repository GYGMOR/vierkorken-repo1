'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/admin/ImageUploader';

export interface Event {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string;
    eventType: string;
    venue: string;
    venueAddress: any;
    startDateTime: string;
    endDateTime: string;
    duration: number | null;
    maxCapacity: number;
    currentCapacity: number;
    availableTickets: number;
    price: number;
    memberPrice: number | null;
    featuredImage: string | null;
    galleryImages: any;
    featuredWines: any;
    minLoyaltyLevel: number | null;
    isPrivate: boolean;
    requiresApproval: boolean;
    followUpOffer: any;
    followUpDuration: number | null;
    status: string;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    includeTax: boolean;
}

const EVENT_TYPES = [
    { value: 'TASTING', label: 'Weinverkostung' },
    { value: 'WINE_DINNER', label: 'Weindinner' },
    { value: 'MASTERCLASS', label: 'Masterclass' },
    { value: 'WINERY_VISIT', label: 'Weingut-Besuch' },
    { value: 'FESTIVAL', label: 'Festival' },
    { value: 'PRIVATE', label: 'Privat' },
];

const STATUS_OPTIONS = [
    { value: 'DRAFT', label: 'Entwurf' },
    { value: 'PUBLISHED', label: 'Veröffentlicht' },
    { value: 'SOLD_OUT', label: 'Ausverkauft' },
    { value: 'CANCELLED', label: 'Abgesagt' },
    { value: 'COMPLETED', label: 'Abgeschlossen' },
];

interface EventEditModalProps {
    event?: Event | null; // If null, creating new event
    onClose: () => void;
    onSave: () => void;
}

export function EventEditModal({ event, onClose, onSave }: EventEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        slug: '',
        title: '',
        subtitle: '',
        description: '',
        eventType: 'TASTING',
        venue: '',
        venueAddress: '',
        startDateTime: '',
        endDateTime: '',
        duration: '',
        maxCapacity: '',
        price: '',
        memberPrice: '',
        featuredImage: '',
        status: 'DRAFT',
        includeTax: true,
    });

    useEffect(() => {
        if (event) {
            setFormData({
                slug: event.slug,
                title: event.title,
                subtitle: event.subtitle || '',
                description: event.description,
                eventType: event.eventType,
                venue: event.venue,
                venueAddress: JSON.stringify(event.venueAddress || {}),
                startDateTime: event.startDateTime ? event.startDateTime.slice(0, 16) : '',
                endDateTime: event.endDateTime ? event.endDateTime.slice(0, 16) : '',
                duration: event.duration?.toString() || '',
                maxCapacity: event.maxCapacity.toString(),
                price: event.price.toString(),
                memberPrice: event.memberPrice?.toString() || '',
                featuredImage: event.featuredImage || '',
                status: event.status,
                includeTax: event.includeTax ?? true,
            });
        }
    }, [event]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                duration: formData.duration ? parseInt(formData.duration) : null,
                maxCapacity: parseInt(formData.maxCapacity),
                price: parseFloat(formData.price),
                memberPrice: formData.memberPrice ? parseFloat(formData.memberPrice) : null,
                venueAddress: formData.venueAddress ? JSON.parse(formData.venueAddress) : {},
                galleryImages: [],
            };

            const url = event
                ? `/api/admin/events/${event.id}`
                : '/api/admin/events';

            const method = event ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                onSave();
                onClose();
            } else {
                const error = await response.json();
                alert(`Fehler: ${error.error || 'Unbekannter Fehler'}`);
            }
        } catch (error: any) {
            console.error('Error saving event:', error);
            alert(`Fehler: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-4xl my-8 relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-taupe-light sticky top-0 bg-white z-10 rounded-t-lg">
                    <h2 className="text-2xl font-serif text-graphite-dark">
                        {event ? 'Event bearbeiten' : 'Neues Event erstellen'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-graphite hover:text-wine transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Titel *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Slug * (z.B. "weinverkostung-2024")
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    required
                                    pattern="[a-z0-9-]+"
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-graphite mb-1">
                                Untertitel
                            </label>
                            <input
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-graphite mb-1">
                                Beschreibung *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                            />
                        </div>

                        {/* Event Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Event-Typ *
                                </label>
                                <select
                                    name="eventType"
                                    value={formData.eventType}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                >
                                    {EVENT_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Status *
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Venue */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Veranstaltungsort *
                                </label>
                                <input
                                    type="text"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="z.B. Vierkorken Weinlounge"
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Adresse (JSON)
                                </label>
                                <input
                                    type="text"
                                    name="venueAddress"
                                    value={formData.venueAddress}
                                    onChange={handleInputChange}
                                    placeholder='{"street": "Musterstr. 1", "city": "Zürich"}'
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Start-Datum & Zeit *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="startDateTime"
                                    value={formData.startDateTime}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    End-Datum & Zeit *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="endDateTime"
                                    value={formData.endDateTime}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Dauer (Minuten)
                                </label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    placeholder="120"
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>
                        </div>

                        {/* Capacity & Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Max. Kapazität *
                                </label>
                                <input
                                    type="number"
                                    name="maxCapacity"
                                    value={formData.maxCapacity}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Preis (CHF) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Mitglieder-Preis (CHF)
                                </label>
                                <input
                                    type="number"
                                    name="memberPrice"
                                    value={formData.memberPrice}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>
                        </div>

                        <div className="bg-taupe-light/10 p-4 rounded-lg border border-taupe-light/30">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="includeTax"
                                        className="sr-only"
                                        checked={formData.includeTax}
                                        onChange={handleInputChange}
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.includeTax ? 'bg-accent-gold' : 'bg-gray-300'}`}></div>
                                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.includeTax ? 'translate-x-4' : ''}`}></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-graphite-dark group-hover:text-accent-gold transition-colors">MwSt (8.1%) berechnen</span>
                                    <span className="text-xs text-graphite/60">Falls deaktiviert, wird für dieses Event im Checkout keine MwSt aufgeschlagen.</span>
                                </div>
                            </label>
                        </div>

                        {/* Featured Image - Uses Admin ImageUploader */}
                        <div>
                            <label className="block text-sm font-medium text-graphite mb-2">
                                Event-Bild
                            </label>

                            {formData.featuredImage && (
                                <div className="mb-4">
                                    <div className="relative inline-block">
                                        <img
                                            src={formData.featuredImage}
                                            alt="Event Vorschau"
                                            className="max-h-48 rounded-lg border border-taupe-light"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, featuredImage: '' })}
                                            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                            title="Bild entfernen"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <ImageUploader
                                onUploadComplete={(url) => setFormData({ ...formData, featuredImage: url })}
                                allowMultiple={false}
                                maxSizeMB={10}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer actions - Fixed */}
                <div className="flex justify-end gap-3 p-6 border-t border-taupe-light bg-white rounded-b-lg">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        type="submit"
                        form="event-form"
                        disabled={loading}
                    >
                        {loading ? 'Speichert...' : event ? 'Speichern' : 'Erstellen'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
