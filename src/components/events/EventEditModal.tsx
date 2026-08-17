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
        venueStreet: '',
        venueZip: '',
        venueCity: '',
        startDateTime: '',
        endDateTime: '',
        timeDisplay: '',
        endTimeDisplay: '',
        duration: '',
        maxCapacity: '',
        price: '',
        memberPrice: '',
        featuredImage: '',
        status: 'DRAFT',
    });

    useEffect(() => {
        if (event) {
            const vAddr = event.venueAddress || {};
            setFormData({
                slug: event.slug,
                title: event.title,
                subtitle: event.subtitle || '',
                description: event.description,
                eventType: event.eventType,
                venue: event.venue,
                venueStreet: (vAddr as any).street || '',
                venueZip: (vAddr as any).zip || '',
                venueCity: (vAddr as any).city || '',
                startDateTime: event.startDateTime ? event.startDateTime.slice(0, 10) : '',
                endDateTime: event.endDateTime ? event.endDateTime.slice(0, 10) : '',
                timeDisplay: (vAddr as any).timeDisplay || '',
                endTimeDisplay: (vAddr as any).endTimeDisplay || '',
                duration: event.duration?.toString() || '',
                maxCapacity: event.maxCapacity.toString(),
                price: event.price.toString(),
                memberPrice: event.memberPrice?.toString() || '',
                featuredImage: event.featuredImage || '',
                status: event.status,
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
            const startTimeStr = formData.timeDisplay && /^\d{1,2}:\d{2}$/.test(formData.timeDisplay.trim())
                ? (formData.timeDisplay.trim().length === 4 ? `0${formData.timeDisplay.trim()}` : formData.timeDisplay.trim())
                : '12:00';
            const endTimeStr = formData.endTimeDisplay && /^\d{1,2}:\d{2}$/.test(formData.endTimeDisplay.trim())
                ? (formData.endTimeDisplay.trim().length === 4 ? `0${formData.endTimeDisplay.trim()}` : formData.endTimeDisplay.trim())
                : startTimeStr;

            const payload: any = {
                ...formData,
                startDateTime: formData.startDateTime
                    ? new Date(`${formData.startDateTime}T${startTimeStr}:00`).toISOString()
                    : undefined,
                endDateTime: formData.endDateTime
                    ? new Date(`${formData.endDateTime}T${endTimeStr}:00`).toISOString()
                    : (formData.startDateTime ? new Date(`${formData.startDateTime}T${endTimeStr}:00`).toISOString() : undefined),
                duration: formData.duration ? parseInt(formData.duration) : null,
                maxCapacity: parseInt(formData.maxCapacity),
                price: parseFloat(formData.price),
                memberPrice: formData.memberPrice ? parseFloat(formData.memberPrice) : null,
                venueAddress: {
                    street: formData.venueStreet || '',
                    zip: formData.venueZip || '',
                    city: formData.venueCity || '',
                    timeDisplay: formData.timeDisplay || null,
                    endTimeDisplay: formData.endTimeDisplay || null,
                },
                galleryImages: [],
            };

            delete payload.venueStreet;
            delete payload.venueZip;
            delete payload.venueCity;

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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Strasse &amp; Nr.
                                </label>
                                <input
                                    type="text"
                                    name="venueStreet"
                                    value={formData.venueStreet}
                                    onChange={handleInputChange}
                                    placeholder="z.B. Steinbrunnengasse 3a"
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    PLZ
                                </label>
                                <input
                                    type="text"
                                    name="venueZip"
                                    value={formData.venueZip}
                                    onChange={handleInputChange}
                                    placeholder="z.B. 5707"
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-graphite mb-1">
                                    Ortschaft
                                </label>
                                <input
                                    type="text"
                                    name="venueCity"
                                    value={formData.venueCity}
                                    onChange={handleInputChange}
                                    placeholder="z.B. Seengen AG"
                                    className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy"
                                />
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="bg-warmwhite-light/50 p-4 rounded-lg border border-taupe-light space-y-4">
                            <h4 className="font-serif font-semibold text-graphite-dark text-md border-b border-taupe-light pb-2">
                                Datum &amp; Uhrzeit
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-graphite mb-1">
                                        Datum Start *
                                    </label>
                                    <input
                                        type="date"
                                        name="startDateTime"
                                        value={formData.startDateTime}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-graphite mb-1">
                                        Datum Ende (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        name="endDateTime"
                                        value={formData.endDateTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-graphite mb-1">
                                        Startzeit (z.B. "17:30")
                                    </label>
                                    <input
                                        type="text"
                                        name="timeDisplay"
                                        value={formData.timeDisplay}
                                        onChange={handleInputChange}
                                        placeholder="z.B. 17:30"
                                        className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-graphite mb-1">
                                        Endzeit (z.B. "21:00")
                                    </label>
                                    <input
                                        type="text"
                                        name="endTimeDisplay"
                                        value={formData.endTimeDisplay}
                                        onChange={handleInputChange}
                                        placeholder="z.B. 21:00"
                                        className="w-full px-3 py-2 border border-taupe-light rounded focus:outline-none focus:ring-2 focus:ring-burgundy bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <span className="block text-xs text-taupe-dark font-medium mb-1.5">Schnellauswahl Uhrzeit:</span>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: '17:00 – 19:30', start: '17:00', end: '19:30' },
                                        { label: '18:00 – 21:00', start: '18:00', end: '21:00' },
                                        { label: '19:00 – 22:00', start: '19:00', end: '22:00' },
                                        { label: '17:30 – 20:30', start: '17:30', end: '20:30' },
                                        { label: 'Ganztägig', start: '10:00', end: '18:00' },
                                    ].map((preset) => (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, timeDisplay: preset.start, endTimeDisplay: preset.end }))}
                                            className="px-3 py-1 text-xs rounded bg-white hover:bg-accent-burgundy hover:text-white border border-taupe-light transition-colors text-graphite"
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3 bg-accent-burgundy/5 rounded border border-accent-burgundy/20 text-xs text-graphite">
                                <span className="font-semibold text-accent-burgundy">Kunden-Vorschau: </span>
                                {formData.startDateTime ? (
                                    <span>
                                        {new Date(`${formData.startDateTime}T12:00:00`).toLocaleDateString('de-CH', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
                                        {' • '}
                                        {formData.timeDisplay || '12:00'}
                                        {formData.endTimeDisplay && formData.endTimeDisplay !== formData.timeDisplay ? ` – ${formData.endTimeDisplay}` : ''}
                                        {' Uhr'}
                                    </span>
                                ) : (
                                    <span className="text-taupe-dark italic">Bitte Wählen Sie ein Datum aus</span>
                                )}
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

                    <div className="flex justify-end gap-3 p-6 border-t border-taupe-light bg-white rounded-b-lg mt-auto">
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
        </div>
    );
}
