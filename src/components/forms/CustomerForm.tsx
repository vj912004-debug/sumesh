import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  company: z.string().min(2, 'Company name is required'),
  gstin: z.string().optional(),
  address: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CustomerForm({ initialData, onSubmit, onCancel, isLoading }: CustomerFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      company: '',
      gstin: '',
      address: '',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
          <Input {...register('name')} placeholder="John Doe" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Company Name <span className="text-red-500">*</span></label>
          <Input {...register('company')} placeholder="Acme Corp" />
          {errors.company && <p className="text-xs text-red-500">{errors.company.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
          <Input {...register('email')} type="email" placeholder="john@acme.com" />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
          <Input {...register('phone')} placeholder="+91 9876543210" />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">GSTIN (Optional)</label>
          <Input {...register('gstin')} placeholder="24AAAAA0000A1Z5" />
          {errors.gstin && <p className="text-xs text-red-500">{errors.gstin.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Address (Optional)</label>
          <Input {...register('address')} placeholder="123 Industrial Area, Vadodara" />
          {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
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
