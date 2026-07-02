import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { USER_RIGHTS_MODULES, SEED_USERS } from '@/lib/erpModules';
import { Users, Shield, Save } from 'lucide-react';

const RIGHTS_KEY = 'sp2_user_rights';

const defaultRights: Record<string, Record<string, boolean>> = {
  Administrator: Object.fromEntries(USER_RIGHTS_MODULES.map(m => [m, true])),
  RMPatel: {
    Masters: false, Sales: true, Engineering: false, 'Production Planning': false,
    'Material Requirement Planning': true, Purchase: false, Inventory: false,
    Despatch: true, 'Quality Control': false, 'Administration & Setup': false,
    'MIS Reports': true, 'Bill Passing': false, 'Job Work': true, Excise: false,
    Service: false, 'Fixed Assets': false, 'Graphical Reports': true, Utility: false,
    'Statutory Reports': false,
  },
  Suketu: {
    Masters: true, Sales: true, Engineering: true, 'Production Planning': true,
    'Material Requirement Planning': true, Purchase: true, Inventory: true,
    Despatch: true, 'Quality Control': true, 'Administration & Setup': true,
    'MIS Reports': true, 'Bill Passing': false, 'Job Work': true, Excise: false,
    Service: true, 'Fixed Assets': true, 'Graphical Reports': true, Utility: true,
    'Statutory Reports': true,
  },
  Mansi: Object.fromEntries(USER_RIGHTS_MODULES.map(m => [m, m === 'Sales' || m === 'MIS Reports'])),
  Production: Object.fromEntries(USER_RIGHTS_MODULES.map(m => [m, ['Production Planning', 'Material Requirement Planning', 'Inventory', 'Job Work', 'Despatch'].includes(m)])),
  Vraj: Object.fromEntries(USER_RIGHTS_MODULES.map(m => [m, true])),
};

function loadRights(): Record<string, Record<string, boolean>> {
  if (typeof window === 'undefined') return defaultRights;
  try {
    const saved = localStorage.getItem(RIGHTS_KEY);
    return saved ? { ...defaultRights, ...JSON.parse(saved) } : defaultRights;
  } catch {
    return defaultRights;
  }
}

export default function UsersManagement() {
  const [users] = useState(SEED_USERS);
  const [selectedId, setSelectedId] = useState('Administrator');
  const [rights, setRights] = useState(loadRights);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  const selected = users.find(u => u.userId === selectedId);
  const userRights = rights[selectedId] ?? Object.fromEntries(USER_RIGHTS_MODULES.map(m => [m, false]));

  const filteredUsers = users.filter(u =>
    u.userName.toLowerCase().includes(search.toLowerCase()) ||
    u.userId.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRight = (module: string) => {
    setRights(prev => ({
      ...prev,
      [selectedId]: { ...prev[selectedId], [module]: !userRights[module] },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(RIGHTS_KEY, JSON.stringify(rights));
    setSaved(true);
  };

  const enabledCount = USER_RIGHTS_MODULES.filter(m => userRights[m]).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">View Users</h2>
          <p className="text-muted-foreground">Manage users and assign ERP module access rights.</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> {saved ? 'Saved' : 'Save Rights'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" /> Users
            </CardTitle>
            <Input
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[480px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-semibold">User Name</th>
                    <th className="text-left p-3 font-semibold">User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr
                      key={u.userId}
                      onClick={() => { setSelectedId(u.userId); setSaved(false); }}
                      className={`cursor-pointer border-t transition-colors ${
                        selectedId === u.userId ? 'bg-primary/10 text-primary' : 'hover:bg-muted/40'
                      }`}
                    >
                      <td className="p-3 font-medium">{u.userName}</td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">{u.userId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              {selected?.userName} — Module Rights
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {enabledCount} of {USER_RIGHTS_MODULES.length} modules enabled
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="rights">
              <TabsList className="mb-4">
                <TabsTrigger value="details">User Details</TabsTrigger>
                <TabsTrigger value="rights">User Rights</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/40 rounded-lg">
                  <div>
                    <span className="text-muted-foreground">User Name</span>
                    <p className="font-semibold">{selected?.userName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">User ID</span>
                    <p className="font-mono font-semibold">{selected?.userId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Role</span>
                    <p className="font-semibold">{selectedId === 'Administrator' ? 'System Admin' : 'Standard User'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <Badge className="mt-1 bg-emerald-100 text-emerald-800 border-emerald-200">Active</Badge>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="rights">
                <div className="max-h-[400px] overflow-y-auto border rounded-lg p-3 space-y-1">
                  {USER_RIGHTS_MODULES.map(module => (
                    <label
                      key={module}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!userRights[module]}
                        onChange={() => toggleRight(module)}
                        className="w-4 h-4 rounded border-input accent-primary"
                      />
                      <span className="text-sm font-medium">{module}</span>
                      {userRights[module] && (
                        <Badge variant="outline" className="ml-auto text-[10px]">Access</Badge>
                      )}
                    </label>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
