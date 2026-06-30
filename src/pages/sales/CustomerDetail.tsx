import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { CustomerForm, type CustomerFormData } from '@/components/forms/CustomerForm';
import { api } from '@/lib/api';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Trash2 } from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`/crm/customers/${id}`);
      setCustomer(response.data);
    } catch (error) {
      console.error('Failed to fetch customer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleEdit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      await api.put(`/crm/customers/${id}`, data);
      setIsEditOpen(false);
      fetchCustomer();
    } catch (error) {
      console.error('Failed to update customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/crm/customers/${id}`);
      navigate('/customers');
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!customer) return <div className="p-8 text-center text-red-500">Customer not found</div>;

  const customerOrders = customer.orders || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/customers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{customer.name}</h2>
          <p className="text-muted-foreground">{customer.id}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Customer</DialogTitle>
                <DialogDescription>
                  Update the details of the customer here.
                </DialogDescription>
              </DialogHeader>
              <CustomerForm 
                initialData={customer}
                onSubmit={handleEdit} 
                onCancel={() => setIsEditOpen(false)} 
                isLoading={isSubmitting} 
              />
            </DialogContent>
          </Dialog>

          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground">{customer.email}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Phone</div>
                <div className="text-sm text-muted-foreground">{customer.phone}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Address</div>
                <div className="text-sm text-muted-foreground whitespace-pre-line">{customer.address}</div>
                <div className="text-sm text-muted-foreground">{customer.city}, {customer.state}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
                <TabsTrigger value="ledger">Ledger</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">GSTIN</p>
                    <p className="text-sm text-muted-foreground">{customer.gstin}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Contact Person</p>
                    <p className="text-sm text-muted-foreground">{customer.contactPerson}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Orders</p>
                    <p className="text-sm text-muted-foreground">{customerOrders.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Account Status</p>
                    <p className="text-sm text-green-600 font-medium">Active</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="orders">
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="py-2 px-4 text-left font-semibold">Order ID</th>
                        <th className="py-2 px-4 text-left font-semibold">Date</th>
                        <th className="py-2 px-4 text-left font-semibold">Status</th>
                        <th className="py-2 px-4 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {customerOrders.length > 0 ? customerOrders.map(order => (
                        <tr key={order.id}>
                          <td className="py-2 px-4">
                            <Link to={`/orders/${order.id}`} className="text-primary hover:underline">
                              {order.id}
                            </Link>
                          </td>
                          <td className="py-2 px-4">{order.date}</td>
                          <td className="py-2 px-4">{order.status}</td>
                          <td className="py-2 px-4 text-right">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-muted-foreground">No orders found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="ledger">
                <div className="p-8 text-center text-muted-foreground border rounded-md">
                  Ledger data will be pulled from the Finance module.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
