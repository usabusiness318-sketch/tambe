import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, CheckCircle2, Clock, AlertCircle, LayoutGrid, Columns } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatCurrency } from '../lib/utils';
import { Project, ProjectStatus } from '../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export function ProjectsView() {
  const { clients, projects, addProject, updateProjectStatus } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId || !budget || !deadline) return;
    
    addProject({
      name,
      clientId,
      budget: parseFloat(budget),
      deadline: new Date(deadline).getTime(),
      status: 'planning'
    });
    
    setName('');
    setClientId('');
    setBudget('');
    setDeadline('');
    setIsAdding(false);
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const styles = {
      'planning': 'bg-slate-800 text-slate-300 border border-slate-700',
      'active': 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      'completed': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      'on-hold': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    };
    return (
      <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider", styles[status])}>
        {status}
      </span>
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      updateProjectStatus(draggableId, destination.droppableId as ProjectStatus);
    }
  };

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const client = clients.find(c => c.id === project.clientId);
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg p-6 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all group">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{project.name}</h3>
            <p className="text-sm text-slate-400">{client?.name || 'Unknown Client'}</p>
          </div>
          {viewMode === 'grid' && getStatusBadge(project.status)}
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Budget</span>
            <span className="font-medium text-slate-200">{formatCurrency(project.budget)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Deadline</span>
            <span className={cn("font-medium", project.deadline < Date.now() && project.status !== 'completed' ? "text-rose-400" : "text-slate-200")}>
              {format(project.deadline, 'MMM dd, yyyy')}
            </span>
          </div>
        </div>

        {viewMode === 'grid' && (
          <div className="pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs text-slate-500">Update Status:</span>
            <select 
              value={project.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateProjectStatus(project.id, e.target.value as ProjectStatus)}
              className="text-xs bg-black/40 border border-white/10 text-slate-300 py-1.5 px-2.5 rounded-lg cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
      </div>
    );
  };

  const columns: { id: ProjectStatus, title: string }[] = [
    { id: 'planning', title: 'Planning' },
    { id: 'active', title: 'Active' },
    { id: 'on-hold', title: 'On Hold' },
    { id: 'completed', title: 'Completed' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 flex flex-col h-full relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Projects</h2>
          <p className="text-sm text-slate-400 mt-1">Manage active work, deadlines, and budgets.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-black/20 p-1 rounded-xl flex items-center border border-white/10">
            <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors", viewMode === 'grid' && "bg-white/10 text-white shadow-sm")}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('kanban')} className={cn("p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors", viewMode === 'kanban' && "bg-white/10 text-white shadow-sm")}><Columns className="w-4 h-4" /></button>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            disabled={clients.length === 0}
            className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 disabled:opacity-50 text-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {clients.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-4 rounded-xl text-sm flex items-center gap-3 shadow-inner">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>You need to <strong>Add a Client</strong> before you can create a project.</p>
        </div>
      )}

      {isAdding && clients.length > 0 && (
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl mb-8 animate-in fade-in slide-in-from-top-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          <h3 className="text-sm font-semibold text-white mb-4 relative z-10">Project Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="Website Redesign"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Client</label>
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
              >
                <option value="" disabled>Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Budget (USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="5000"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 relative z-10">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400"
            >
              Create Project
            </button>
          </div>
        </form>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => <ProjectCard key={project.id} project={project} />)}
          {projects.length === 0 && !isAdding && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
              <h3 className="text-lg font-medium text-white">No active projects</h3>
              <p className="text-sm text-slate-400 mt-1">Create a project to start tracking work.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto min-h-[500px]">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 h-full items-start">
              {columns.map(col => {
                const columnProjects = projects.filter(p => p.status === col.id);
                return (
                  <div key={col.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col min-w-[320px] max-w-[320px] flex-shrink-0">
                    <div className="flex justify-between items-center mb-4 px-1">
                      <h3 className="font-semibold text-slate-200">{col.title}</h3>
                      <span className="text-xs font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/5">{columnProjects.length}</span>
                    </div>
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={cn("flex-1 flex flex-col gap-3 min-h-[150px] transition-colors rounded-xl", snapshot.isDraggingOver && "bg-indigo-500/10 p-2 -m-2 border border-indigo-500/20")}
                        >
                          {columnProjects.map((project, index) => (
                            // @ts-ignore
                            <Draggable key={project.id} draggableId={project.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{ ...provided.draggableProps.style }}
                                  className={cn("transition-transform", snapshot.isDragging && "rotate-2 scale-105 shadow-[0_0_30px_rgba(99,102,241,0.3)] z-50")}
                                >
                                  <ProjectCard project={project} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      )}
    </div>
  );
}
