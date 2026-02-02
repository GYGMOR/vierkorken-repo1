'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface Event {
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
  { value: 'DRAFT', label: 'Entwurf', color: 'bg-gray-200 text-gray-800' },
  { value: 'PUBLISHED', label: 'Veröffentlicht', color: 'bg-green-200 text-green-800' },
  { value: 'SOLD_OUT', label: 'Ausverkauft', color: 'bg-red-200 text-red-800' },
  { value: 'CANCELLED', label: 'Abgesagt', color: 'bg-orange-200 text-orange-800' },
  { value: 'COMPLETED', label: 'Abgeschlossen', color: 'bg-blue-200 text-blue-800' },
];

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

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
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      const url = editingEvent
        ? `/api/admin/events/${editingEvent.id}`
        : '/api/admin/events';

      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchEvents();
        setShowForm(false);
        setEditingEvent(null);
        resetForm();
        alert(editingEvent ? 'Event erfolgreich aktualisiert!' : 'Event erfolgreich erstellt!');
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.error || 'Unbekannter Fehler'}`);
      }
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert(`Fehler: ${error.message}`);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      slug: event.slug,
      title: event.title,
      subtitle: event.subtitle || '',
      description: event.description,
      eventType: event.eventType,
      venue: event.venue,
      venueAddress: JSON.stringify(event.venueAddress),
      startDateTime: event.startDateTime.slice(0, 16),
      endDateTime: event.endDateTime.slice(0, 16),
      duration: event.duration?.toString() || '',
      maxCapacity: event.maxCapacity.toString(),
      price: event.price.toString(),
      memberPrice: event.memberPrice?.toString() || '',
      featuredImage: event.featuredImage || '',
      status: event.status,
    });
    setShowForm(true);
  };

  const initiateDelete = (event: Event) => {
    const isExpired = new Date(event.endDateTime) < new Date();

    if (isExpired) {
      // Expired events can be deleted with a simple confirm
      if (confirm(`Möchten Sie das abgelaufene Event "${event.title}" wirklich löschen?`)) {
        performDelete(event.id);
      }
    } else {
      // Active events require safe delete modal
      setEventToDelete(event);
      setDeleteConfirmationInput('');
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!eventToDelete) return;

    if (deleteConfirmationInput === 'DELETE') {
      performDelete(eventToDelete.id);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const performDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEvents();
        // alert('Event erfolgreich gelöscht!'); // Optional: less noise
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.error || 'Unbekannter Fehler'}`);
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert(`Fehler: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
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
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig?.color || 'bg-gray-200'}`}>
        {statusConfig?.label || status}
      </span>
    );
  };

  const getEventTypeLabel = (type: string) => {
    return EVENT_TYPES.find((t) => t.value === type)?.label || type;
  };

  if (showForm) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-serif text-graphite-dark">
              {editingEvent ? 'Event bearbeiten' : 'Neues Event erstellen'}
            </h1>
            <Button
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setEditingEvent(null);
                resetForm();
              }}
            >
              Abbrechen
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      Slug * (URL-freundlich, z.B. "weinverkostung-2024")
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

                  <div>
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

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-graphite mb-2">
                    Event-Bild
                  </label>

                  {/* Current Image Preview */}
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
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-graphite mt-2">
                        Aktuelles Bild: {formData.featuredImage}
                      </p>
                    </div>
                  )}

                  {/* Image Uploader */}
                  <ImageUploader
                    onUploadComplete={(url) => setFormData({ ...formData, featuredImage: url })}
                    allowMultiple={false}
                    maxSizeMB={10}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingEvent ? 'Speichern' : 'Event erstellen'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                  >
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif text-graphite-dark">Events verwalten</h1>
          <Button onClick={() => setShowForm(true)}>
            + Neues Event
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-graphite">Lädt Events...</p>
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-graphite mb-4">Noch keine Events vorhanden</p>
              <Button onClick={() => setShowForm(true)}>
                Erstes Event erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4 md:p-6">
                  {/* Mobile/Tablet Layout */}
                  <div className="lg:hidden space-y-4">
                    {/* Header with Title & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-graphite-dark mb-1">
                          {event.title}
                        </h3>
                        {event.subtitle && (
                          <p className="text-sm text-graphite/80">{event.subtitle}</p>
                        )}
                      </div>
                      {getStatusBadge(event.status)}
                    </div>

                    {/* Event Details - Mobile Stack */}
                    <div className="grid grid-cols-1 gap-3 text-sm border-t pt-3">
                      <div>
                        <span className="text-graphite/60 text-xs">Typ:</span>
                        <p className="font-medium text-graphite">
                          {getEventTypeLabel(event.eventType)}
                        </p>
                      </div>

                      <div>
                        <span className="text-graphite/60 text-xs">Datum:</span>
                        <p className="font-medium text-graphite">
                          {new Date(event.startDateTime).toLocaleDateString('de-CH')}
                        </p>
                      </div>

                      <div>
                        <span className="text-graphite/60 text-xs">Ort:</span>
                        <p className="font-medium text-graphite">{event.venue}</p>
                      </div>

                      <div>
                        <span className="text-graphite/60 text-xs">Verfügbarkeit:</span>
                        <p className="font-medium text-graphite">
                          {event.availableTickets} / {event.maxCapacity} frei
                        </p>
                      </div>

                      <div>
                        <span className="text-graphite/60 text-xs">Preis:</span>
                        <p className="font-medium text-graphite">
                          CHF {event.price.toFixed(2)}
                          {event.memberPrice && (
                            <span className="text-xs text-graphite/60 ml-1 block">
                              Mitglieder: CHF {event.memberPrice.toFixed(2)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions - Mobile */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(event)}
                        size="sm"
                        className="flex-1"
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => initiateDelete(event)}
                        size="sm"
                        className="flex-1 text-red-600 hover:bg-red-50"
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-graphite-dark">
                          {event.title}
                        </h3>
                        {getStatusBadge(event.status)}
                      </div>

                      {event.subtitle && (
                        <p className="text-sm text-graphite/80 mb-2">{event.subtitle}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-graphite/60">Typ:</span>
                          <p className="font-medium text-graphite">
                            {getEventTypeLabel(event.eventType)}
                          </p>
                        </div>

                        <div>
                          <span className="text-graphite/60">Datum:</span>
                          <p className="font-medium text-graphite">
                            {new Date(event.startDateTime).toLocaleDateString('de-CH')}
                          </p>
                        </div>

                        <div>
                          <span className="text-graphite/60">Ort:</span>
                          <p className="font-medium text-graphite">{event.venue}</p>
                        </div>

                        <div>
                          <span className="text-graphite/60">Verfügbarkeit:</span>
                          <p className="font-medium text-graphite">
                            {event.availableTickets} / {event.maxCapacity} frei
                          </p>
                        </div>

                        <div>
                          <span className="text-graphite/60">Preis:</span>
                          <p className="font-medium text-graphite">
                            CHF {event.price.toFixed(2)}
                            {event.memberPrice && (
                              <span className="text-xs text-graphite/60 ml-1">
                                (Mitglieder: CHF {event.memberPrice.toFixed(2)})
                              </span>
                            )}
                          </p>
                        </div>

                        <div>
                          <span className="text-graphite/60">Slug:</span>
                          <p className="font-medium text-graphite font-mono text-xs">
                            {event.slug}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(event)}
                        size="sm"
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => initiateDelete(event)}
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
