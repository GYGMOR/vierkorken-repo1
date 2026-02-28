"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCart } from "@/contexts/CartContext";
import { EventImageCarousel } from "@/components/events/EventImageCarousel";
import { EditableText } from "@/components/admin/EditableText";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ShareButton } from "@/components/ui/ShareButton";

import { useSession } from "next-auth/react";
import { EventEditModal } from "@/components/events/EventEditModal";
import { EventCard } from "@/components/events/EventCard";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyaltyRules, setLoyaltyRules] = useState<any[]>([]);

  // Admin state
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  const [headerImage, setHeaderImage] = useState(
    "/images/layout/weingläser.jpg",
  );
  const [isHeaderEditorOpen, setIsHeaderEditorOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings?keys=events_page_header_image");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            const hImage = data.settings.find(
              (s: any) => s.key === "events_page_header_image",
            );
            if (hImage?.value) setHeaderImage(hImage.value);
          }
        }
      } catch (e) {
        console.error("Error fetching settings:", e);
      }
    };
    fetchSettings();
  }, [isAdmin]);

  const saveHeaderImage = async (url: string) => {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "events_page_header_image", value: url }),
      });
      setHeaderImage(url);
      setIsHeaderEditorOpen(false);
    } catch (e) {
      console.error("Error saving setting:", e);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const url = isAdmin ? "/api/events?includeUnpublished=true" : "/api/events";
      const response = await fetch(url, {
        cache: "no-store", // Always fetch fresh data
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.events && data.events.length > 0) {
          // Transform API data to match component format
          const transformedEvents = data.events.map((event: any) => ({
            id: event.id,
            slug: event.slug,
            title: event.title,
            subtitle: event.subtitle || "",
            date: new Date(event.startDateTime).toISOString().split("T")[0],
            time: new Date(event.startDateTime).toLocaleTimeString("de-CH", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            duration: event.duration || 0,
            venue: event.venue,
            type: event.eventType,
            price: event.price,
            memberPrice: event.memberPrice || event.price,
            capacity: event.maxCapacity,
            booked: event.currentCapacity,
            image: event.featuredImage || "/events/default.jpg",
            description: event.description,
            minLoyaltyLevel: event.minLoyaltyLevel,
            status: event.status,
          }));
          setEvents(transformedEvents);
          console.log(
            "✅ Loaded events from database:",
            transformedEvents.length,
          );
          console.log(
            "📸 Event images:",
            transformedEvents.map((e: any) => ({
              title: e.title,
              image: e.image,
            })),
          );
        } else {
          // No events in DB
          console.log("⚠️ No events in database");
          setEvents([]);
        }
      } else {
        // API error
        console.log("⚠️ API error");
        setEvents([]);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      // Exception
      console.log("⚠️ Exception loading events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load events on mount and when admin status changes
  useEffect(() => {
    fetchEvents();
  }, [isAdmin]);

  // Load loyalty rules on mount
  useEffect(() => {
    const fetchLoyaltyRules = async () => {
      try {
        const res = await fetch("/api/loyalty/rules");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setLoyaltyRules(data.rules || []);
          }
        }
      } catch (e) {
        console.error("Error fetching loyalty rules:", e);
      }
    };
    fetchLoyaltyRules();
  }, []);

  // Reload events when page becomes visible (user returns from detail page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Page visible again, reloading events...");
        fetchEvents();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Check for admin status
  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user.role === "ADMIN") {
            setIsAdmin(true);
          }
        })
        .catch(() => setIsAdmin(false));
    }
  }, [session]);

  const handleEdit = (event: any, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();

    // Transform the event data to match EventEditModal's expected format
    const transformedEvent = {
      id: event.id,
      slug: event.slug,
      title: event.title,
      subtitle: event.subtitle || null,
      description: event.description,
      eventType: event.type,
      venue: event.venue,
      venueAddress: {},
      startDateTime: `${event.date}T${event.time}`,
      endDateTime: `${event.date}T${event.time}`, // Will need to calculate based on duration
      duration: event.duration,
      maxCapacity: event.capacity,
      currentCapacity: event.booked,
      availableTickets: event.capacity - event.booked,
      price: event.price,
      memberPrice: event.memberPrice,
      featuredImage: event.image,
      galleryImages: [],
      featuredWines: [],
      minLoyaltyLevel: event.minLoyaltyLevel,
      isPrivate: false,
      requiresApproval: false,
      followUpOffer: null,
      followUpDuration: null,
      status: "PUBLISHED",
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingEvent(transformedEvent);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setShowEditModal(true);
  };

  const handleSave = () => {
    fetchEvents(); // Reload events
    setShowEditModal(false);
    setEditingEvent(null);
  };

  return (
    <MainLayout>
      {/* Hero */}
      <div className="relative bg-graphite-dark border-b border-taupe-light overflow-hidden group py-16 md:py-24 flex items-center justify-center">
        {/* Hintergrundbild - transparent */}
        <div className="absolute inset-0 z-0 text-center flex items-center justify-center">
          <Image
            src={headerImage}
            alt="Weingläser Hintergrund"
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
        )}

        {/* Content - über dem Bild */}
        <div className="container-custom py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <BackButton href="/" className="mb-4" />
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-burgundy/10 rounded-full border border-accent-burgundy/20 backdrop-blur-sm">
              <span className="text-accent-burgundy font-medium text-sm">
                EVENTS
              </span>
            </div>
            <EditableText
              settingKey="events_page_header_title"
              defaultValue="Exklusive Weinerlebnisse"
              isAdmin={isAdmin}
              as="h1"
              className="text-display font-serif font-light text-graphite-dark"
            />
            <EditableText
              settingKey="events_page_header_subtitle"
              defaultValue="Nehmen Sie an Verkostungen, Masterclasses und exklusiven Weindinners teil. Entdecken Sie neue Weine und treffen Sie Gleichgesinnte."
              isAdmin={isAdmin}
              as="p"
              className="text-body-lg text-graphite"
              multiline={true}
            />
          </div>
        </div>
      </div>

      {/* Event Image Carousel */}
      <EventImageCarousel />

      <div className="container-custom py-12 space-y-12">
        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            {isAdmin ? (
              <div
                onClick={handleCreate}
                className="w-full max-w-md h-[300px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-accent-burgundy transition-colors"
                title="Neues Event erstellen"
              >
                <div className="w-16 h-16 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                  <span className="text-4xl text-accent-burgundy font-light">
                    +
                  </span>
                </div>
                <span className="text-lg font-medium text-graphite-dark">
                  Event Hinzufügen
                </span>
              </div>
            ) : (
              <p className="text-graphite text-lg">Keine Events verfügbar</p>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isAdmin && (
              <div
                onClick={handleCreate}
                className="h-[500px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-accent-burgundy transition-colors"
                title="Neues Event erstellen"
              >
                <div className="w-16 h-16 rounded-full bg-accent-burgundy/10 flex items-center justify-center mb-4">
                  <span className="text-4xl text-accent-burgundy font-light">
                    +
                  </span>
                </div>
                <span className="text-lg font-medium text-graphite-dark">
                  Event Hinzufügen
                </span>
              </div>
            )}

            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isAdmin={isAdmin}
                onEdit={(e) => handleEdit(event, e)}
              />
            ))}
          </div>
        )}

        {/* Benefits Section */}
        <section className="mt-16">
          <Card className="p-12 bg-gradient-to-br from-warmwhite via-rose-light to-warmwhite">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-h2 font-serif font-light text-wine-dark">
                Loyalty Club Vorteile
              </h2>
              <p className="text-body-lg text-graphite">
                Als Mitglied des Loyalty Clubs erhalten Sie exklusive Vorteile
                bei Events
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <BenefitCard
                  icon={<DiscountIcon />}
                  title="Ermässigte Preise"
                  description="Spezielle Mitgliederpreise für alle Events"
                />
                <BenefitCard
                  icon={<EarlyAccessIcon />}
                  title="Früher Zugang"
                  description="Buchen Sie Events vor allen anderen"
                />
                <BenefitCard
                  icon={<PointsIcon />}
                  title="Punkte sammeln"
                  description={`${loyaltyRules.find(r => r.identifier === 'event')?.points || '+150'} Loyalty Punkte pro Event`}
                />
              </div>
              <Link href="/club">
                <Button size="lg" className="mt-6">
                  Mehr zum Loyalty Club
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>

      {/* Admin Edit Modal */}
      {showEditModal && (
        <EventEditModal
          event={editingEvent}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}

      {/* Header Image Editor Modal */}
      {isHeaderEditorOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 lg:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-taupe-light/30">
            <button
              onClick={() => setIsHeaderEditorOpen(false)}
              className="absolute top-4 right-4 text-graphite/40 hover:text-graphite transition-colors"
            >
              <svg
                className="w-6 h-6"
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
            <h2 className="text-h3 font-serif text-graphite-dark mb-6">
              Header-Bild ändern
            </h2>
            <ImageUploader onUploadComplete={saveHeaderImage} />
          </div>
        </div>
      )}
    </MainLayout>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-burgundy/10 text-accent-burgundy">
        {icon}
      </div>
      <h3 className="font-serif text-body-lg font-semibold text-graphite-dark">
        {title}
      </h3>
      <p className="text-body-sm text-graphite/70">{description}</p>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// Icons
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function DiscountIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  );
}

function EarlyAccessIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

function PointsIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 12H4"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}
