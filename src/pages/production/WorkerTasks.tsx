import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Play, CheckCircle2, PauseCircle, Plus, Clock } from 'lucide-react';

interface Assignment {
  id: string;
  worker: string;
  jobCard: string;
  stage: string;
  desc: string;
  status: string;
  hoursLogged: number;
}

export default function WorkerTasks() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: '1', worker: 'Ramesh Bhai (Welder)', jobCard: 'WO-26-101', stage: 'Fabrication', desc: 'Weld main degassing chamber as per drawing.', status: 'In Progress', hoursLogged: 4.5 },
    { id: '2', worker: 'Suresh Kumar (Fitter)', jobCard: 'WO-26-101', stage: 'Assembly', desc: 'Mount gear pumps and inter-connecting pipe setup.', status: 'Pending', hoursLogged: 0 },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [newWorker, setNewWorker] = useState('');
  const [newJobCard, setNewJobCard] = useState('');
  const [newStage, setNewStage] = useState('Fabrication');
  const [newDesc, setNewDesc] = useState('');

  const handleStatusChange = (id: string, newStatus: string) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const handleAddHours = (id: string) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, hoursLogged: parseFloat((a.hoursLogged + 0.5).toFixed(1)) } : a));
  };

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Assignment = {
      id: String(assignments.length + 1),
      worker: newWorker,
      jobCard: newJobCard,
      stage: newStage,
      desc: newDesc,
      status: 'Pending',
      hoursLogged: 0
    };
    setAssignments([...assignments, newTask]);
    setIsOpen(false);
    setNewWorker('');
    setNewJobCard('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Worker Task Assignment</h2>
          <p className="text-muted-foreground">Allocate job cards to workers and log production timesheets.</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Assign New Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {assignments.map((task) => (
          <Card key={task.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-primary">{task.jobCard} - {task.stage}</CardTitle>
                <div className="text-sm font-medium mt-1">{task.worker}</div>
              </div>
              <Badge 
                variant={task.status === 'In Progress' ? 'default' : task.status === 'Finished' ? 'outline' : 'secondary'}
                className={task.status === 'Finished' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
              >
                {task.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{task.desc}</p>
              
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex flex-col gap-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Hours Logged: </span>
                    <span className="font-bold">{task.hoursLogged} hrs</span>
                  </div>
                  {task.status === 'In Progress' && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleAddHours(task.id)}
                      className="h-7 text-xs px-2 text-primary hover:text-primary/80 self-start"
                    >
                      <Clock className="mr-1 h-3 w-3" /> +0.5 hrs
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  {task.status === 'In Progress' ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                      onClick={() => handleStatusChange(task.id, 'Pending')}
                    >
                      <PauseCircle className="mr-2 h-4 w-4" /> Pause
                    </Button>
                  ) : task.status !== 'Finished' ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleStatusChange(task.id, 'In Progress')}
                    >
                      <Play className="mr-2 h-4 w-4" /> Start
                    </Button>
                  ) : null}
                  {task.status !== 'Finished' && (
                    <Button 
                      size="sm"
                      onClick={() => handleStatusChange(task.id, 'Finished')}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Finish
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAssignTask}>
            <DialogHeader>
              <DialogTitle>Assign New Task</DialogTitle>
              <DialogDescription>
                Assign a job card to a worker and set stage details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Worker Name</label>
                <Input 
                  placeholder="e.g. Ramesh Bhai (Welder)" 
                  value={newWorker} 
                  onChange={e => setNewWorker(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Card Ref</label>
                <Input 
                  placeholder="e.g. WO-26-102" 
                  value={newJobCard} 
                  onChange={e => setNewJobCard(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stage</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={newStage} 
                  onChange={e => setNewStage(e.target.value)}
                >
                  <option value="Fabrication">Fabrication</option>
                  <option value="Assembly">Assembly</option>
                  <option value="Electricals">Electricals</option>
                  <option value="Testing">Testing</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Description</label>
                <Input 
                  placeholder="Description of work to be performed..." 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Assign Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

