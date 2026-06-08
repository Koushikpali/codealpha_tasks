import TaskCard from '../task/TaskCard';

const columnMeta = {
  todo:        { label: 'To Do',       color: 'bg-slate-400' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-400' },
  done:        { label: 'Done',        color: 'bg-green-400' },
};

const KanbanColumn = ({ status, tasks, onAddTask, onDeleteTask, onStatusChange }) => {
  const meta = columnMeta[status];
  return (
    <div className="bg-slate-100 rounded-xl p-3 flex flex-col min-h-[500px] w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full ${meta.color}`} />
        <h3 className="font-semibold text-slate-700 text-sm">{meta.label}</h3>
        <span className="ml-auto text-xs bg-white text-slate-500 rounded-full px-2 py-0.5 border border-slate-200">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onDelete={onDeleteTask} onStatusChange={onStatusChange} />
        ))}
      </div>
      <button onClick={onAddTask}
        className="mt-3 w-full text-sm text-slate-500 hover:text-blue-600 hover:bg-white border border-dashed border-slate-300 hover:border-blue-400 rounded-lg py-2 transition">
        + Add task
      </button>
    </div>
  );
};

export default KanbanColumn;
