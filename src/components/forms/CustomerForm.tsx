import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { getCustomerContacts, EMPTY_CONTACT } from '@/lib/customerContacts';

const contactSchema = z.object({
  designation: z.string().min(1, 'Designation is required'),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

const customerSchema = z.object({
  name: z.string().min(2, 'Party / company name is required'),
  gstin: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  email: z.string().email('Invalid company email').optional().or(z.literal('')),
  contacts: z.array(contactSchema).min(1, 'Add at least one contact person'),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData> & { contactPerson?: string; phone?: string };
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function toFormDefaults(initialData?: CustomerFormProps['initialData']): CustomerFormData {
  const contacts = initialData ? getCustomerContacts(initialData as Parameters<typeof getCustomerContacts>[0]) : [];
  return {
    name: initialData?.name ?? '',
    gstin: initialData?.gstin ?? '',
    address: initialData?.address ?? '',
    city: initialData?.city ?? '',
    state: initialData?.state ?? '',
    email: initialData?.email ?? '',
    contacts: contacts.length > 0
      ? contacts.map(c => ({ ...c, email: c.email ?? '' }))
      : [{ ...EMPTY_CONTACT }],
  };
}

export function CustomerForm({ initialData, onSubmit, onCancel, isLoading }: CustomerFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: toFormDefaults(initialData),
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'contacts' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Party / Company Name <span className="text-red-500">*</span></label>
        <Input {...register('name')} placeholder="e.g. Reliance Industries Ltd" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">GSTIN</label>
          <Input {...register('gstin')} placeholder="24AAAAA0000A1Z5" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Company Email</label>
          <Input {...register('email')} type="email" placeholder="sales@company.com" />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Address</label>
        <Input {...register('address')} placeholder="Factory / office address" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">City</label>
          <Input {...register('city')} placeholder="Vadodara" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">State</label>
          <Input {...register('state')} placeholder="Gujarat" />
        </div>
      </div>

      <div className="pt-2 border-t space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Contact Persons</p>
            <p className="text-xs text-muted-foreground">Designation, name and number for each contact</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ ...EMPTY_CONTACT })}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Person
          </Button>
        </div>

        {errors.contacts?.message && (
          <p className="text-xs text-red-500">{errors.contacts.message}</p>
        )}

        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-3 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Contact {index + 1}{index === 0 ? ' (Primary)' : ''}
                </span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-rose-500"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Designation <span className="text-red-500">*</span></label>
                  <Input
                    {...register(`contacts.${index}.designation`)}
                    placeholder="e.g. Purchase Manager"
                  />
                  {errors.contacts?.[index]?.designation && (
                    <p className="text-xs text-red-500">{errors.contacts[index]?.designation?.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Name <span className="text-red-500">*</span></label>
                  <Input {...register(`contacts.${index}.name`)} placeholder="Full name" />
                  {errors.contacts?.[index]?.name && (
                    <p className="text-xs text-red-500">{errors.contacts[index]?.name?.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Number <span className="text-red-500">*</span></label>
                  <Input {...register(`contacts.${index}.phone`)} placeholder="+91 9876543210" />
                  {errors.contacts?.[index]?.phone && (
                    <p className="text-xs text-red-500">{errors.contacts[index]?.phone?.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Email (optional)</label>
                <Input {...register(`contacts.${index}.email`)} type="email" placeholder="person@company.com" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Customer'}
        </Button>
      </div>
    </form>
  );
}
