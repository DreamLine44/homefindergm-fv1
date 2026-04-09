export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold text-stone-800 mb-2">{title}</h3>
      {description && <p className="text-stone-500 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
