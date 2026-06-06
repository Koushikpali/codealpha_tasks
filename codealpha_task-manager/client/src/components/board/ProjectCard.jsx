import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProjectCard = ({ project, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = project.owner._id === user._id;

  return (
    <div onClick={() => navigate(`/projects/${project._id}`)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{project.title}</h3>
          {project.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>}
        </div>
        {isOwner && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(project._id); }}
            className="ml-2 text-slate-300 hover:text-red-500 transition-colors text-lg leading-none flex-shrink-0" title="Delete project">✕</button>
        )}
      </div>
      <div className="flex items-center gap-2 mt-4">
        <div className="flex -space-x-2">
          {project.members.slice(0, 4).map((member) => (
            <div key={member._id} className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium" title={member.name}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {project.members.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-600 text-xs font-medium">+{project.members.length - 4}</div>
          )}
        </div>
        <span className="text-xs text-slate-400 ml-auto">{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};

export default ProjectCard;
