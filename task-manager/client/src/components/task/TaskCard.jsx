import { useNavigate } from 'react-router-dom';

const priorityStyles = {
  low:    'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high:   'bg-red-100 text-red-700',
};

const TaskCard = ({ task, onDelete }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/tasks/${task._id}`)}
      className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 cursor-pointer hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-800 leading-snug">{task.title}</p>
        <button onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
          className="text-slate-200 hover:text-red-400 transition-colors text-base leading-none flex-shrink-0 opacity-0 group-hover:opacity-100">✕</button>
      </div>
      {task.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>}
      <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>{task.priority}</span>
        {task.assignedTo && (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0" title={task.assignedTo.name}>
            {task.assignedTo.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {task.dueDate && <p className="text-xs text-slate-400 mt-2">Due {new Date(task.dueDate).toLocaleDateString()}</p>}
    </div>
  );
};

export default TaskCard;
