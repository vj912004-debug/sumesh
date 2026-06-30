import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { CalendarClock, CheckSquare, Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  assignee: string;
  due: string;
  status: string;
  priority: string;
}

export default function Tasks() {
  const [activeTasks, setActiveTasks] = useState<Task[]>([
    { id: 'TSK-101', title: 'Follow up on Quotation QT-26-501', assignee: 'Sales Dept', due: 'Today', status: 'Pending', priority: 'High' },
    { id: 'TSK-102', title: 'Prepare E-Way bill for Tata Power delivery', assignee: 'Logistics Desk', due: 'Tomorrow', status: 'Pending', priority: 'Medium' },
    { id: 'TSK-103', title: 'Schedule AMC Visit for Reliance', assignee: 'Service Coordinator', due: '05-Jul-2026', status: 'Not Started', priority: 'Low' },
  ]);

  const [completedTasks, setCompletedTasks] = useState<Task[]>([
    { id: 'TSK-100', title: 'Call back vendor regarding MS Plate quote.', assignee: 'Purchase Desk', due: 'Yesterday', status: 'Completed', priority: 'Medium' }
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [due, setDue] = useState('Today');
  const [priority, setPriority] = useState('Medium');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: `TSK-${104 + activeTasks.length + completedTasks.length}`,
      title,
      assignee,
      due,
      status: 'Pending',
      priority
    };
    setActiveTasks([...activeTasks, newTask]);
    setIsOpen(false);
    setTitle('');
    setAssignee('');
  };

  const handleMarkDone = (task: Task) => {
    setActiveTasks(activeTasks.filter(t => t.id !== task.id));
    setCompletedTasks([{ ...task, status: 'Completed' }, ...completedTasks]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Task Management & Reminders</h2>
          <p className="text-muted-foreground">Office tasks, follow-ups, and automated system reminders.</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Kanban style columns */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-red-500" /> Due Soon
          </h3>
          {activeTasks.filter(t => t.due === 'Today' || t.due === 'Tomorrow').map(task => (
            <Card key={task.id} className="border-l-4 border-l-red-500">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-sm font-bold leading-tight">{task.title}</CardTitle>
                  <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'} className="text-[10px] h-4 px-1.5">
                    {task.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex justify-between items-end mt-2 text-xs">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Assignee: <span className="font-medium text-foreground">{task.assignee}</span></div>
                    <div className="text-red-500 font-semibold">Due: {task.due}</div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleMarkDone(task)}>
                    <CheckSquare className="mr-1 h-3 w-3" /> Done
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-blue-500" /> Upcoming
          </h3>
          {activeTasks.filter(t => t.due !== 'Today' && t.due !== 'Tomorrow').map(task => (
            <Card key={task.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-sm font-bold leading-tight">{task.title}</CardTitle>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {task.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex justify-between items-end mt-2 text-xs">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Assignee: <span className="font-medium text-foreground">{task.assignee}</span></div>
                    <div className="text-muted-foreground font-semibold">Due: {task.due}</div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleMarkDone(task)}>
                    <CheckSquare className="mr-1 h-3 w-3" /> Done
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-green-500" /> Completed
          </h3>
          {completedTasks.map(task => (
            <Card key={task.id} className="border-l-4 border-l-green-500 bg-muted/50 opacity-75">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold leading-tight line-through text-muted-foreground">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Completed</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">Done</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreateTask}>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new administrative task or follow-up reminder.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title</label>
                <Input 
                  placeholder="e.g. Follow up on quotation QT-26-501" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assignee</label>
                <Input 
                  placeholder="e.g. Sales Dept, Suresh Fitter" 
                  value={assignee} 
                  onChange={e => setAssignee(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={due} 
                  onChange={e => setDue(e.target.value)}
                >
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Next Week">Next Week</option>
                  <option value="15-Jul-2026">15-Jul-2026</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={priority} 
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

