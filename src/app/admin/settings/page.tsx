'use client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/Card';

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-serif text-graphite-dark">Einstellungen</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-graphite">Einstellungen in Entwicklung</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
