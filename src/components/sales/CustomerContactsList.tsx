import { Phone, User } from 'lucide-react';
import type { CustomerContact } from '@/lib/customerContacts';

type CustomerContactsListProps = {
  contacts: CustomerContact[];
  compact?: boolean;
};

export function CustomerContactsList({ contacts, compact = false }: CustomerContactsListProps) {
  if (contacts.length === 0) {
    return <p className="text-sm text-muted-foreground">No contacts on file.</p>;
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {contacts.map((c, i) => (
          <div key={`${c.name}-${i}`} className="text-sm">
            <span className="font-medium">{c.name}</span>
            <span className="text-muted-foreground"> · {c.designation} · </span>
            <a href={`tel:${c.phone}`} className="text-primary hover:underline">{c.phone}</a>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-muted-foreground">
          <tr>
            <th className="py-2 px-3 text-left font-semibold">Designation</th>
            <th className="py-2 px-3 text-left font-semibold">Name</th>
            <th className="py-2 px-3 text-left font-semibold">Number</th>
            <th className="py-2 px-3 text-left font-semibold">Email</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {contacts.map((c, i) => (
            <tr key={`${c.name}-${i}`}>
              <td className="py-2.5 px-3 text-muted-foreground">{c.designation}</td>
              <td className="py-2.5 px-3 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {c.name}
                  {i === 0 && (
                    <span className="text-[10px] uppercase tracking-wide text-primary font-semibold">Primary</span>
                  )}
                </span>
              </td>
              <td className="py-2.5 px-3">
                <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                  <Phone className="h-3.5 w-3.5" />
                  {c.phone}
                </a>
              </td>
              <td className="py-2.5 px-3 text-muted-foreground text-xs">
                {c.email ? (
                  <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>
                ) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
