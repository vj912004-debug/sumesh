import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { CustomerForm, type CustomerFormData } from '@/components/forms/CustomerForm';
import { api } from '@/lib/api';
import { getPastQuotedRatesForParty, formatQuotedAmount } from '@/lib/quotationService';
import { ENQUIRY_TYPES, DEFAULT_ENQUIRY_TYPE, type EnquiryType } from '@/lib/enquiryTypes';
import { UserPlus } from 'lucide-react';

const ADD_NEW_CUSTOMER = '__add_new_customer__';

const enquirySchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  enquiryType: z.enum(['rental', 'supply', 'service', 'spares']),
  source: z.string().min(1, 'Source is required'),
  requirements: z.string().min(5, 'Please provide more detail about requirements'),
  expectedValue: z.coerce.number().min(0, 'Must be a positive value'),
  status: z.string().optional(),
  nextFollowUp: z.string().optional(),
});

export type EnquiryFormData = z.infer<typeof enquirySchema>;

interface EnquiryFormProps {
  initialData?: Partial<EnquiryFormData>;
  defaultType?: EnquiryType;
  onSubmit: (data: EnquiryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EnquiryForm({ initialData, defaultType, onSubmit, onCancel, isLoading }: EnquiryFormProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [newCustomerNote, setNewCustomerNote] = useState<string | null>(null);

  const loadCustomers = () =>
    api.get('/crm/customers').then(res => setCustomers(res.data)).catch(console.error);

  useEffect(() => {
    loadCustomers();
  }, []);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema) as any,
    defaultValues: initialData || {
      customerId: '',
      enquiryType: defaultType ?? DEFAULT_ENQUIRY_TYPE,
      source: '',
      requirements: '',
      expectedValue: 0,
      status: 'Open',
      nextFollowUp: '',
    }
  });

  useEffect(() => {
    const onFill = (e: Event) => {
      const { field, value } = (e as CustomEvent<{ field: keyof EnquiryFormData; value: string }>).detail;
      if (!field) return;
      const str = String(value);
      if (field === 'enquiryType' || field === 'customerId' || field === 'source' || field === 'status') {
        setValue(field, str as EnquiryFormData[typeof field], { shouldValidate: true });
        return;
      }
      if (field === 'expectedValue') {
        let i = 0;
        const timer = window.setInterval(() => {
          i += 1;
          setValue(field, Number(str.slice(0, i)), { shouldValidate: true });
          if (i >= str.length) window.clearInterval(timer);
        }, 35);
        return;
      }
      let i = 0;
      const timer = window.setInterval(() => {
        i += 1;
        setValue(field, str.slice(0, i) as EnquiryFormData[typeof field], { shouldValidate: true });
        if (i >= str.length) window.clearInterval(timer);
      }, 35);
    };
    window.addEventListener('demo-fill-field', onFill);
    return () => window.removeEventListener('demo-fill-field', onFill);
  }, [setValue]);

  const selectedCustomerId = watch('customerId');
  const pastQuotedRates = useMemo(
    () => (selectedCustomerId ? getPastQuotedRatesForParty(selectedCustomerId) : []),
    [selectedCustomerId]
  );

  const handleSaveNewCustomer = async (data: CustomerFormData) => {
    setSavingCustomer(true);
    try {
      const res = await api.post('/crm/customers', data);
      const newCustomer = res.data;
      await loadCustomers();
      setValue('customerId', newCustomer.id, { shouldValidate: true });
      setAddCustomerOpen(false);
      setNewCustomerNote(`${newCustomer.name} saved to Customer Master (${newCustomer.id}) and selected.`);
    } catch (err) {
      console.error('Failed to create customer:', err);
      alert('Failed to save customer. Please try again.');
    } finally {
      setSavingCustomer(false);
    }
  };

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Enquiry Type <span className="text-red-500">*</span></label>
        <select {...register('enquiryType')} className={inputClass} data-demo="enquiry-type">
          {ENQUIRY_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        {errors.enquiryType && <p className="text-xs text-red-500">{errors.enquiryType.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Customer <span className="text-red-500">*</span></label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setAddCustomerOpen(true)}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1" /> Add New Customer
          </Button>
        </div>
        <select
          {...register('customerId', {
            onChange: e => {
              if (e.target.value === ADD_NEW_CUSTOMER) {
                setValue('customerId', '');
                setAddCustomerOpen(true);
              }
            },
          })}
          className={inputClass}
          data-demo="enquiry-customer"
        >
          <option value="">Select a customer</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
          ))}
          <option value={ADD_NEW_CUSTOMER}>➕ Customer not in list? Add new…</option>
        </select>
        {errors.customerId && <p className="text-xs text-red-500">{errors.customerId.message}</p>}
        {newCustomerNote && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1.5">
            {newCustomerNote}
          </p>
        )}
        {pastQuotedRates.length > 0 && (
          <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1.5">
            <p className="font-semibold text-muted-foreground uppercase tracking-wide">Past quoted rates for this party</p>
            {pastQuotedRates.slice(0, 3).map(q => (
              <div key={q.quotationId} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <Link to={`/quotations/${q.quotationId}`} className="text-primary hover:underline font-medium">
                    {q.quotationId}
                  </Link>
                  <span className="text-muted-foreground"> · {q.date}</span>
                </span>
                <span className="font-semibold">{formatQuotedAmount(q.totalAmount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Source <span className="text-red-500">*</span></label>
          <select {...register('source')} className={inputClass} data-demo="enquiry-source">
            <option value="">Select source</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Cold Call">Cold Call</option>
            <option value="Trade Show">Trade Show</option>
            <option value="Existing Client">Existing Client</option>
          </select>
          {errors.source && <p className="text-xs text-red-500">{errors.source.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Expected Value (₹) <span className="text-red-500">*</span></label>
          <Input type="number" {...register('expectedValue')} placeholder="50000" data-demo="enquiry-value" />
          {errors.expectedValue && <p className="text-xs text-red-500">{errors.expectedValue.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Requirements <span className="text-red-500">*</span></label>
        <textarea 
          {...register('requirements')} 
          data-demo="enquiry-requirements"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Detailed client requirements..."
        />
        {errors.requirements && <p className="text-xs text-red-500">{errors.requirements.message}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Next Follow-up Date</label>
          <Input type="date" {...register('nextFollowUp')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select {...register('status')} className={inputClass}>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} data-demo="enquiry-submit">
          {isLoading ? 'Saving...' : 'Save Enquiry'}
        </Button>
      </div>

      <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer to Master</DialogTitle>
            <DialogDescription>
              Customer will be saved in the Customer Master and auto-selected for this enquiry.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleSaveNewCustomer}
            onCancel={() => setAddCustomerOpen(false)}
            isLoading={savingCustomer}
          />
        </DialogContent>
      </Dialog>
    </form>
  );
}
