function TemplateSelector({ templates, selected, onSelect }) {
  return (
    <div className="template-selector">
      {templates.map((template) => (
        <button
          key={template.id}
          className={`template-btn ${selected === template.id ? 'active' : ''}`}
          onClick={() => onSelect(template.id)}
          title={template.description}
        >
          <span className="template-name">{template.name}</span>
        </button>
      ))}
    </div>
  )
}

export default TemplateSelector
