function ResumePreview({ resumeData, template, accentColor }) {
  const { personal, summary, experience, education, skills, projects, certifications } = resumeData || {}

  const formatDate = (startDate, endDate, current) => {
    if (current) return `${startDate} - Present`
    if (startDate && endDate) return `${startDate} - ${endDate}`
    return startDate || endDate || ''
  }

  const color = accentColor || '#2563eb'

  if (template === 'modern') {
    return (
      <div className="resume modern">
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

        {summary && (
          <section className="resume-section">
            <h2 style={{ color, borderColor: color }}>Professional Summary</h2>
            <p className="summary-text">{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && experience[0].title && (
          <section className="resume-section">
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
        )}

        {education && education.length > 0 && education[0].degree && (
          <section className="resume-section">
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
        )}

        {skills && skills.length > 0 && skills[0].category && (
          <section className="resume-section">
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
        )}

        {projects && projects.length > 0 && projects[0].name && (
          <section className="resume-section">
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
        )}

        {certifications && certifications.length > 0 && certifications[0].name && (
          <section className="resume-section">
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
        )}
      </div>
    )
  }

  if (template === 'classic') {
    return (
      <div className="resume classic">
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

        {summary && (
          <section className="resume-section">
            <h2 style={{ color, borderColor: color }}>PROFESSIONAL SUMMARY</h2>
            <p>{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && experience[0].title && (
          <section className="resume-section">
            <h2 style={{ color, borderColor: color }}>WORK EXPERIENCE</h2>
            {experience.map((exp) => (
              <div key={exp.id} className="experience-entry">
                <div className="entry-row">
                  <strong>{exp.title}</strong>
                  <span className="date">{formatDate(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="entry-row secondary">
                  <em>{exp.company}{exp.location && `, ${exp.location}`}</em>
                </div>
                {exp.bullets && exp.bullets.length > 0 && exp.bullets[0] && (
                  <ul>
                    {exp.bullets.map((bullet, i) => (
                      bullet && <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {education && education.length > 0 && education[0].degree && (
          <section className="resume-section">
            <h2 style={{ color, borderColor: color }}>EDUCATION</h2>
            {education.map((edu) => (
              <div key={edu.id} className="education-entry">
                <div className="entry-row">
                  <strong>{edu.degree}</strong>
                  <span className="date">{formatDate(edu.startDate, edu.endDate)}</span>
                </div>
                <div className="entry-row secondary">
                  <em>{edu.school}{edu.location && `, ${edu.location}`}</em>
                  {edu.gpa && <span> | GPA: {edu.gpa}</span>}
                </div>
                {edu.description && <p className="description">{edu.description}</p>}
              </div>
            ))}
          </section>
        )}

        {skills && skills.length > 0 && skills[0].category && (
          <section className="resume-section">
            <h2 style={{ color, borderColor: color }}>SKILLS</h2>
            <div className="skills-list">
              {skills.map((skill, i) => (
                <div key={skill.id}>
                  <strong style={{ color }}>{skill.category}:</strong> {skill.items.join(', ')}
                  {i < skills.length - 1 && <span className="separator"> | </span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {projects && projects.length > 0 && projects[0].name && (
          <section className="resume-section">
            <h2 style={{ color, borderColor: color }}>PROJECTS</h2>
            {projects.map((project) => (
              <div key={project.id} className="project-entry">
                <div className="entry-row">
                  <strong>{project.name}</strong>
                  {project.link && <span className="link">{project.link}</span>}
                </div>
                {project.description && <p>{project.description}</p>}
                {project.technologies.length > 0 && (
                  <p><strong>Technologies:</strong> {project.technologies.join(', ')}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {certifications && certifications.length > 0 && certifications[0].name && (
          <section className="resume-section">
            <h2>CERTIFICATIONS</h2>
            {certifications.map((cert) => (
              <div key={cert.id} className="certification-entry">
                <div className="entry-row">
                  <strong>{cert.name}</strong>
                  <span className="date">{cert.date}</span>
                </div>
                {cert.issuer && <p className="issuer">{cert.issuer}</p>}
              </div>
            ))}
          </section>
        )}
      </div>
    )
  }

  // Minimal template
  return (
    <div className="resume minimal">
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

      {summary && (
        <section className="resume-section">
          <p className="summary-text">{summary}</p>
        </section>
      )}

      {experience && experience.length > 0 && experience[0].title && (
        <section className="resume-section">
          <h2 style={{ color }}>EXPERIENCE</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="experience-entry">
              <div className="entry-header">
                <span className="entry-title">{exp.title}</span>
                <span className="entry-date">{formatDate(exp.startDate, exp.endDate, exp.current)}</span>
              </div>
              <div className="entry-subtitle">
                {exp.company}{exp.location && ` - ${exp.location}`}
              </div>
              {exp.bullets && exp.bullets.length > 0 && exp.bullets[0] && (
                <ul>
                  {exp.bullets.map((bullet, i) => (
                    bullet && <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {education && education.length > 0 && education[0].degree && (
        <section className="resume-section">
          <h2 style={{ color }}>EDUCATION</h2>
          {education.map((edu) => (
            <div key={edu.id} className="education-entry">
              <div className="entry-header">
                <span className="entry-title">{edu.degree}</span>
                <span className="entry-date">{formatDate(edu.startDate, edu.endDate)}</span>
              </div>
              <div className="entry-subtitle">
                {edu.school}{edu.location && ` - ${edu.location}`}
                {edu.gpa && ` | GPA: ${edu.gpa}`}
              </div>
            </div>
          ))}
        </section>
      )}

      {skills && skills.length > 0 && skills[0].category && (
        <section className="resume-section">
          <h2 style={{ color }}>SKILLS</h2>
          <div className="skills-compact">
            {skills.map((skill, i) => (
              <span key={skill.id}>
                <strong style={{ color }}>{skill.category}:</strong> {skill.items.join(', ')}
                {i < skills.length - 1 && ' • '}
              </span>
            ))}
          </div>
        </section>
      )}

      {projects && projects.length > 0 && projects[0].name && (
        <section className="resume-section">
          <h2>PROJECTS</h2>
          {projects.map((project) => (
            <div key={project.id} className="project-entry">
              <div className="entry-header">
                <span className="entry-title">{project.name}</span>
                {project.link && <span className="entry-link">{project.link}</span>}
              </div>
              {project.description && <p>{project.description}</p>}
            </div>
          ))}
        </section>
      )}

      {certifications && certifications.length > 0 && certifications[0].name && (
        <section className="resume-section">
          <h2>CERTIFICATIONS</h2>
          <div className="certifications-list">
            {certifications.map((cert, i) => (
              <span key={cert.id}>
                {cert.name} ({cert.date})
                {i < certifications.length - 1 && ' • '}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ResumePreview
