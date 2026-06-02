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

  if (template === 'executive') {
    return (
      <div className="resume executive">
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

        {summary && (
          <section className="resume-section">
            <h2 style={{ color, borderBottomColor: color }}>EXECUTIVE SUMMARY</h2>
            <p>{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && experience[0].title && (
          <section className="resume-section">
            <h2 style={{ color, borderBottomColor: color }}>PROFESSIONAL EXPERIENCE</h2>
            {experience.map((exp) => (
              <div key={exp.id} className="experience-entry">
                <div className="entry-header">
                  <div>
                    <h3>{exp.title}</h3>
                    <span className="company">{exp.company}{exp.location && `, ${exp.location}`}</span>
                  </div>
                  <span className="date">{formatDate(exp.startDate, exp.endDate, exp.current)}</span>
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
            <h2 style={{ color, borderBottomColor: color }}>EDUCATION</h2>
            {education.map((edu) => (
              <div key={edu.id} className="education-entry">
                <div className="entry-header">
                  <div>
                    <h3>{edu.degree}</h3>
                    <span className="school">{edu.school}</span>
                  </div>
                  <span className="date">{formatDate(edu.startDate, edu.endDate)}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {skills && skills.length > 0 && skills[0].category && (
          <section className="resume-section">
            <h2 style={{ color, borderBottomColor: color }}>CORE COMPETENCIES</h2>
            <div className="skills-grid">
              {skills.map((skill) => (
                <div key={skill.id} className="skill-item">
                  <span className="skill-name" style={{ color }}>{skill.category}</span>
                  <span className="skill-desc">{skill.items.join(' • ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  if (template === 'creative') {
    return (
      <div className="resume creative">
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
          {summary && (
            <section className="resume-section">
              <h2 style={{ color }}>About Me</h2>
              <p>{summary}</p>
            </section>
          )}

          {experience && experience.length > 0 && experience[0].title && (
            <section className="resume-section">
              <h2 style={{ color }}>Experience</h2>
              {experience.map((exp) => (
                <div key={exp.id} className="experience-entry">
                  <div className="entry-header">
                    <h3>{exp.title}</h3>
                    <span className="date">{formatDate(exp.startDate, exp.endDate, exp.current)}</span>
                  </div>
                  <p className="company">{exp.company}{exp.location && ` • ${exp.location}`}</p>
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
              <h2 style={{ color }}>Education</h2>
              {education.map((edu) => (
                <div key={edu.id} className="education-entry">
                  <h3>{edu.degree}</h3>
                  <p className="school">{edu.school} • {formatDate(edu.startDate, edu.endDate)}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    )
  }

  if (template === 'technical') {
    return (
      <div className="resume technical">
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

        {summary && (
          <section className="resume-section">
            <h2 style={{ background: color }}>SUMMARY</h2>
            <p>{summary}</p>
          </section>
        )}

        {skills && skills.length > 0 && skills[0].category && (
          <section className="resume-section">
            <h2 style={{ background: color }}>TECHNICAL SKILLS</h2>
            <div className="skills-grid">
              {skills.map((skill) => (
                <div key={skill.id} className="skill-group">
                  <span className="skill-label" style={{ color }}>{skill.category}:</span>
                  <div className="skill-tags">
                    {skill.items.map((item, i) => (
                      <span key={i} className="skill-tag" style={{ borderColor: color, color }}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {experience && experience.length > 0 && experience[0].title && (
          <section className="resume-section">
            <h2 style={{ background: color }}>EXPERIENCE</h2>
            {experience.map((exp) => (
              <div key={exp.id} className="experience-entry">
                <div className="entry-header">
                  <div>
                    <h3>{exp.title}</h3>
                    <span className="company">{exp.company}</span>
                  </div>
                  <span className="date">{formatDate(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                {exp.location && <p className="location">{exp.location}</p>}
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

        {projects && projects.length > 0 && projects[0].name && (
          <section className="resume-section">
            <h2 style={{ background: color }}>PROJECTS</h2>
            {projects.map((project) => (
              <div key={project.id} className="project-entry">
                <h3>{project.name}</h3>
                {project.description && <p>{project.description}</p>}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="tech-tags">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="tech-tag" style={{ background: color }}>{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {education && education.length > 0 && education[0].degree && (
          <section className="resume-section">
            <h2 style={{ background: color }}>EDUCATION</h2>
            {education.map((edu) => (
              <div key={edu.id} className="education-entry">
                <div className="entry-header">
                  <h3>{edu.degree}</h3>
                  <span className="date">{formatDate(edu.startDate, edu.endDate)}</span>
                </div>
                <p className="school">{edu.school}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    )
  }

  if (template === 'compact') {
    return (
      <div className="resume compact">
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
            {experience && experience.length > 0 && experience[0].title && (
              <section className="resume-section">
                <h2 style={{ color, borderColor: color }}>EXPERIENCE</h2>
                {experience.map((exp) => (
                  <div key={exp.id} className="experience-entry">
                    <div className="entry-row">
                      <strong>{exp.title}</strong>
                      <span className="date">{formatDate(exp.startDate, exp.endDate, exp.current)}</span>
                    </div>
                    <div className="entry-sub">{exp.company}{exp.location && `, ${exp.location}`}</div>
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

            {projects && projects.length > 0 && projects[0].name && (
              <section className="resume-section">
                <h2 style={{ color, borderColor: color }}>PROJECTS</h2>
                {projects.map((project) => (
                  <div key={project.id} className="project-entry">
                    <strong>{project.name}</strong>
                    {project.description && <p>{project.description}</p>}
                  </div>
                ))}
              </section>
            )}
          </div>

          <div className="column-side">
            {education && education.length > 0 && education[0].degree && (
              <section className="resume-section">
                <h2 style={{ color, borderColor: color }}>EDUCATION</h2>
                {education.map((edu) => (
                  <div key={edu.id} className="education-entry">
                    <strong>{edu.degree}</strong>
                    <p>{edu.school}</p>
                    <p className="date">{formatDate(edu.startDate, edu.endDate)}</p>
                  </div>
                ))}
              </section>
            )}

            {skills && skills.length > 0 && skills[0].category && (
              <section className="resume-section">
                <h2 style={{ color, borderColor: color }}>SKILLS</h2>
                {skills.map((skill) => (
                  <div key={skill.id} className="skill-item">
                    <strong>{skill.category}</strong>
                    <p>{skill.items.join(', ')}</p>
                  </div>
                ))}
              </section>
            )}

            {certifications && certifications.length > 0 && certifications[0].name && (
              <section className="resume-section">
                <h2 style={{ color, borderColor: color }}>CERTIFICATIONS</h2>
                {certifications.map((cert) => (
                  <div key={cert.id} className="cert-item">
                    <strong>{cert.name}</strong>
                    <p>{cert.date}</p>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
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
