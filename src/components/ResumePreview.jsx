function ResumePreview({ resumeData, template, accentColor, sectionOrder, fontFamily }) {
  const { personal, summary, experience, education, skills, projects, certifications } = resumeData || {}

  const formatDate = (startDate, endDate, current) => {
    if (current) return `${startDate} - Present`
    if (startDate && endDate) return `${startDate} - ${endDate}`
    return startDate || endDate || ''
  }

  const color = accentColor || '#2563eb'
  const font = fontFamily || 'Inter'
  const order = sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications']

  const sectionMap = {
    summary: summary && (
      <section className="resume-section" key="summary">
        <h2 style={{ color, borderColor: color }}>Professional Summary</h2>
        <p className="summary-text">{summary}</p>
      </section>
    ),
    experience: experience && experience.length > 0 && experience[0].title && (
      <section className="resume-section" key="experience">
        <h2 style={{ color, borderColor: color }}>Work Experience</h2>
        {experience.map((exp) => (
          <div key={exp.id} className="experience-entry">
            <div className="entry-header">
              <div className="entry-left">
                <h3>{exp.title}</h3>
                <span className="company">{exp.company}</span>
              </div>
              <div className="entry-right">
                <span className="date">{formatDate(exp.startDate, exp.endDate, exp.current)}</span>
                {exp.location && <span className="location">{exp.location}</span>}
              </div>
            </div>
            {exp.bullets && exp.bullets.length > 0 && exp.bullets[0] && (
              <ul className="bullets">
                {exp.bullets.map((bullet, i) => (
                  bullet && <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    ),
    education: education && education.length > 0 && education[0].degree && (
      <section className="resume-section" key="education">
        <h2 style={{ color, borderColor: color }}>Education</h2>
        {education.map((edu) => (
          <div key={edu.id} className="education-entry">
            <div className="entry-header">
              <div className="entry-left">
                <h3>{edu.degree}</h3>
                <span className="school">{edu.school}</span>
              </div>
              <div className="entry-right">
                <span className="date">{formatDate(edu.startDate, edu.endDate)}</span>
                {edu.gpa && <span className="gpa">GPA: {edu.gpa}</span>}
              </div>
            </div>
            {edu.description && <p className="description">{edu.description}</p>}
          </div>
        ))}
      </section>
    ),
    skills: skills && skills.length > 0 && skills[0].category && (
      <section className="resume-section" key="skills">
        <h2 style={{ color, borderColor: color }}>Skills</h2>
        <div className="skills-grid">
          {skills.map((skill) => (
            <div key={skill.id} className="skill-group">
              <span className="skill-category" style={{ color }}>{skill.category}:</span>
              <span className="skill-items">{skill.items.join(', ')}</span>
            </div>
          ))}
        </div>
      </section>
    ),
    projects: projects && projects.length > 0 && projects[0].name && (
      <section className="resume-section" key="projects">
        <h2 style={{ color, borderColor: color }}>Projects</h2>
        {projects.map((project) => (
          <div key={project.id} className="project-entry">
            <div className="entry-header">
              <h3>{project.name}</h3>
              {project.link && <span className="link">{project.link}</span>}
            </div>
            {project.description && <p className="description">{project.description}</p>}
            {project.technologies && project.technologies.length > 0 && (
              <div className="tech-tags">
                {project.technologies.map((tech, i) => (
                  <span key={i} className="tech-tag" style={{ borderColor: color, color }}>{tech}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    ),
    certifications: certifications && certifications.length > 0 && certifications[0].name && (
      <section className="resume-section" key="certifications">
        <h2 style={{ color, borderColor: color }}>Certifications</h2>
        {certifications.map((cert) => (
          <div key={cert.id} className="certification-entry">
            <div className="entry-header">
              <h3>{cert.name}</h3>
              <span className="date">{cert.date}</span>
            </div>
            {cert.issuer && <p className="issuer">{cert.issuer}</p>}
          </div>
        ))}
      </section>
    ),
  }

  const renderSections = () => {
    return order.map(id => sectionMap[id]).filter(Boolean)
  }

  if (template === 'modern') {
    return (
      <div className="resume modern" style={{ fontFamily: font }}>
        <header className="resume-header">
          <div className="header-main">
            <h1>{personal.name || 'Your Name'}</h1>
            <p className="title" style={{ color }}>{personal.title || 'Your Title'}</p>
          </div>
          <div className="header-contact">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
            {personal.linkedin && <span>{personal.linkedin}</span>}
            {personal.website && <span>{personal.website}</span>}
          </div>
        </header>
        {renderSections()}
      </div>
    )
  }

  if (template === 'classic') {
    return (
      <div className="resume classic" style={{ fontFamily: font }}>
        <header className="resume-header">
          <h1>{personal.name || 'Your Name'}</h1>
          <p className="title">{personal.title || 'Your Title'}</p>
          <div className="contact-line">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span> | {personal.phone}</span>}
            {personal.location && <span> | {personal.location}</span>}
            {personal.linkedin && <span> | {personal.linkedin}</span>}
          </div>
        </header>
        {renderSections()}
      </div>
    )
  }

  if (template === 'executive') {
    return (
      <div className="resume executive" style={{ fontFamily: font }}>
        <header className="resume-header">
          <div className="header-border" style={{ borderColor: color }}>
            <h1>{personal.name || 'Your Name'}</h1>
            <p className="title">{personal.title || 'Your Title'}</p>
          </div>
          <div className="contact-row">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>•</span>}
            {personal.location && <span>{personal.location}</span>}
            {personal.linkedin && <span>•</span>}
            {personal.linkedin && <span>{personal.linkedin}</span>}
          </div>
        </header>
        {renderSections()}
      </div>
    )
  }

  if (template === 'creative') {
    return (
      <div className="resume creative" style={{ fontFamily: font }}>
        <div className="sidebar" style={{ background: color }}>
          <div className="profile-section">
            <h1>{personal.name || 'Your Name'}</h1>
            <p className="title">{personal.title || 'Your Title'}</p>
          </div>
          <div className="contact-section">
            <h3>Contact</h3>
            {personal.email && <p>{personal.email}</p>}
            {personal.phone && <p>{personal.phone}</p>}
            {personal.location && <p>{personal.location}</p>}
            {personal.linkedin && <p>{personal.linkedin}</p>}
          </div>
          {skills && skills.length > 0 && (
            <div className="skills-section">
              <h3>Skills</h3>
              {skills.map((skill) => (
                <div key={skill.id} className="skill-item">
                  <p className="skill-name">{skill.category}</p>
                  <div className="skill-bar">
                    <div className="skill-fill" style={{ width: '80%', background: 'white' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="main-content">
          {renderSections()}
        </div>
      </div>
    )
  }

  if (template === 'technical') {
    return (
      <div className="resume technical" style={{ fontFamily: font }}>
        <header className="resume-header">
          <h1>{personal.name || 'Your Name'}</h1>
          <p className="title" style={{ color }}>{personal.title || 'Your Title'}</p>
          <div className="contact-row">
            {personal.email && <span>📧 {personal.email}</span>}
            {personal.phone && <span>📱 {personal.phone}</span>}
            {personal.location && <span>📍 {personal.location}</span>}
            {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
          </div>
        </header>
        {renderSections()}
      </div>
    )
  }

  if (template === 'compact') {
    return (
      <div className="resume compact" style={{ fontFamily: font }}>
        <header className="resume-header">
          <div className="header-left">
            <h1>{personal.name || 'Your Name'}</h1>
            <p className="title">{personal.title || 'Your Title'}</p>
          </div>
          <div className="header-right">
            {personal.email && <p>{personal.email}</p>}
            {personal.phone && <p>{personal.phone}</p>}
            {personal.location && <p>{personal.location}</p>}
            {personal.linkedin && <p>{personal.linkedin}</p>}
          </div>
        </header>
        {summary && <p className="summary">{summary}</p>}
        <div className="two-columns">
          <div className="column-main">
            {order.filter(s => ['experience', 'projects'].includes(s)).map(id => sectionMap[id]).filter(Boolean)}
          </div>
          <div className="column-side">
            {order.filter(s => ['education', 'skills', 'certifications'].includes(s)).map(id => sectionMap[id]).filter(Boolean)}
          </div>
        </div>
      </div>
    )
  }

  // Minimal template
  return (
    <div className="resume minimal" style={{ fontFamily: font }}>
      <header className="resume-header">
        <h1>{personal.name || 'Your Name'}</h1>
        <div className="contact-row">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
        </div>
      </header>
      {personal.title && (
        <div className="title-line" style={{ borderBottomColor: color }}>{personal.title}</div>
      )}
      {renderSections()}
    </div>
  )
}

export default ResumePreview
