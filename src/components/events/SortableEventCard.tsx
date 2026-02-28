import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EventCard } from './EventCard';

export function SortableEventCard({ id, event, isAdmin, onEdit }: { id: string, event: any; isAdmin?: boolean; onEdit?: (e: React.MouseEvent) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {isAdmin && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute -top-3 -left-3 z-40 bg-white border border-gray-200 shadow-md p-2 rounded-full cursor-grab active:cursor-grabbing text-gray-500 hover:text-accent-burgundy opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Event verschieben"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                </div>
            )}
            <EventCard event={event} isAdmin={isAdmin} onEdit={onEdit} />
        </div>
    );
}
