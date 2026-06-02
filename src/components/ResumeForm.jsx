import { useState } from 'react'

function ResumeForm({ resumeData, setResumeData }) {
  const [openSections, setOpenSections] = useState({
    personal: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: false,
    certifications: false,
  })

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handlePersonalChange = (field, value) => {
    setResumeData({
      ...resumeData,
      personal: { ...resumeData.personal, [field]: value },
    })
  }

  const handleSummaryChange = (value) => {
    setResumeData({ ...resumeData, summary: value })
  }

  const handleExperienceChange = (id, field, value) => {
    const updated = resumeData.experience.map((exp) =>
      exp.id === id ? { ...exp, [field]: value } : exp
    )
    setResumeData({ ...resumeData, experience: updated })
  }

  const handleBulletChange = (expId, bulletIndex, value) => {
    const updated = resumeData.experience.map((exp) => {
      if (exp.id === expId) {
        const newBullets = [...exp.bullets]
        newBullets[bulletIndex] = value
        return { ...exp, bullets: newBullets }
      }
      return exp
    })
    setResumeData({ ...resumeData, experience: updated })
  }

  const addBullet = (expId) => {
    const updated = resumeData.experience.map((exp) =>
      exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp
    )
    setResumeData({ ...resumeData, experience: updated })
  }

  const removeBullet = (expId, bulletIndex) => {
    const updated = resumeData.experience.map((exp) => {
      if (exp.id === expId) {
        return { ...exp, bullets: exp.bullets.filter((_, i) => i !== bulletIndex) }
      }
      return exp
    })
    setResumeData({ ...resumeData, experience: updated })
  }

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [''],
    }
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, newExp],
    })
  }

  const removeExperience = (id) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((exp) => exp.id !== id),
    })
  }

  const handleEducationChange = (id, field, value) => {
    const updated = resumeData.education.map((edu) =>
      edu.id === id ? { ...edu, [field]: value } : edu
    )
    setResumeData({ ...resumeData, education: updated })
  }

  const addEducation = () => {
    const newEdu = {
      id: Date.now(),
      degree: '',
      school: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: '',
    }
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEdu],
    })
  }

  const removeEducation = (id) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((edu) => edu.id !== id),
    })
  }

  const handleSkillCategoryChange = (id, value) => {
    const updated = resumeData.skills.map((skill) =>
      skill.id === id ? { ...skill, category: value } : skill
    )
    setResumeData({ ...resumeData, skills: updated })
  }

  const handleSkillItemsChange = (id, value) => {
    const items = value.split(',').map((s) => s.trim()).filter(Boolean)
    const updated = resumeData.skills.map((skill) =>
      skill.id === id ? { ...skill, items } : skill
    )
    setResumeData({ ...resumeData, skills: updated })
  }

  const addSkillCategory = () => {
    const newSkill = {
      id: Date.now(),
      category: '',
      items: [],
    }
    setResumeData({
      ...resumeData,
      skills: [...resumeData.skills, newSkill],
    })
  }

  const removeSkillCategory = (id) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((skill) => skill.id !== id),
    })
  }

  const handleProjectChange = (id, field, value) => {
    const updated = resumeData.projects.map((proj) =>
      proj.id === id ? { ...proj, [field]: value } : proj
    )
    setResumeData({ ...resumeData, projects: updated })
  }

  const handleProjectTechChange = (id, value) => {
    const technologies = value.split(',').map((s) => s.trim()).filter(Boolean)
    const updated = resumeData.projects.map((proj) =>
      proj.id === id ? { ...proj, technologies } : proj
    )
    setResumeData({ ...resumeData, projects: updated })
  }

  const addProject = () => {
    const newProject = {
      id: Date.now(),
      name: '',
      description: '',
      technologies: [],
      link: '',
    }
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, newProject],
    })
  }

  const removeProject = (id) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((proj) => proj.id !== id),
    })
  }

  const handleCertificationChange = (id, field, value) => {
    const updated = resumeData.certifications.map((cert) =>
      cert.id === id ? { ...cert, [field]: value } : cert
    )
    setResumeData({ ...resumeData, certifications: updated })
  }

  const addCertification = () => {
    const newCert = {
      id: Date.now(),
      name: '',
      issuer: '',
      date: '',
    }
    setResumeData({
      ...resumeData,
      certifications: [...resumeData.certifications, newCert],
    })
  }

  const removeCertification = (id) => {
    setResumeData({
      ...resumeData,
      certifications: resumeData.certifications.filter((cert) => cert.id !== id),
    })
  }

  const SectionHeader = ({ title, section, count }) => (
    <button
      className={`section-header ${openSections[section] ? 'open' : ''}`}
      onClick={() => toggleSection(section)}
    >
      <div className="section-header-left">
        <span className="section-arrow">▶</span>
        <span className="section-title-text">{title}</span>
        {count > 0 && <span className="section-count">{count}</span>}
      </div>
    </button>
  )

  return (
    <div className="resume-form">
      {/* Personal Information */}
      <div className="form-section">
        <SectionHeader title="Personal Information" section="personal" />
        {openSections.personal && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={resumeData.personal.name}
                  onChange={(e) => handlePersonalChange('name', e.target.value)}
                  placeholder="John Doe"
                  className={!resumeData.personal.name ? 'error' : ''}
                />
                {!resumeData.personal.name && (
                  <span className="error-text">Name is required</span>
                )}
              </div>
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  value={resumeData.personal.title}
                  onChange={(e) => handlePersonalChange('title', e.target.value)}
                  placeholder="Software Developer"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={resumeData.personal.email}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={resumeData.personal.phone}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={resumeData.personal.location}
                  onChange={(e) => handlePersonalChange('location', e.target.value)}
                  placeholder="New York, NY"
                />
              </div>
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="text"
                  value={resumeData.personal.linkedin}
                  onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={resumeData.personal.website}
                onChange={(e) => handlePersonalChange('website', e.target.value)}
                placeholder="https://johndoe.dev"
              />
            </div>
          </div>
        )}
      </div>

      {/* Professional Summary */}
      <div className="form-section">
        <SectionHeader title="Professional Summary" section="summary" />
        {openSections.summary && (
          <div className="section-content">
            <div className="form-group">
              <textarea
                value={resumeData.summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                placeholder="Write a compelling 2-4 sentence summary of your professional background and key achievements..."
                rows={4}
              />
              <div className="char-count">
                {resumeData.summary.length} / 500 characters
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Work Experience */}
      <div className="form-section">
        <SectionHeader
          title="Work Experience"
          section="experience"
          count={resumeData.experience.length}
        />
        {openSections.experience && (
          <div className="section-content">
            {resumeData.experience.map((exp, index) => (
              <div key={exp.id} className="experience-item">
                <div className="item-header">
                  <span className="item-number">#{index + 1}</span>
                  <button
                    className="btn-remove"
                    onClick={() => removeExperience(exp.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleExperienceChange(exp.id, 'title', e.target.value)}
                      placeholder="Software Developer"
                    />
                  </div>
                  <div className="form-group">
                    <label>Company *</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                      placeholder="Tech Corp"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => handleExperienceChange(exp.id, 'location', e.target.value)}
                      placeholder="New York, NY"
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(exp.id, 'startDate', e.target.value)}
                      placeholder="Jan 2022"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(exp.id, 'endDate', e.target.value)}
                      placeholder="Present"
                      disabled={exp.current}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => {
                        handleExperienceChange(exp.id, 'current', e.target.checked)
                        if (e.target.checked) {
                          handleExperienceChange(exp.id, 'endDate', 'Present')
                        }
                      }}
                    />
                    <span>Currently working here</span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Key Achievements & Responsibilities</label>
                  <div className="bullets-list">
                    {exp.bullets.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="bullet-item">
                        <span className="bullet-icon">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => handleBulletChange(exp.id, bulletIndex, e.target.value)}
                          placeholder="Describe an achievement or responsibility..."
                        />
                        {exp.bullets.length > 1 && (
                          <button
                            className="btn-remove-small"
                            onClick={() => removeBullet(exp.id, bulletIndex)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn-add-small"
                    onClick={() => addBullet(exp.id)}
                  >
                    + Add bullet point
                  </button>
                </div>
              </div>
            ))}
            <button className="btn-add" onClick={addExperience}>
              + Add Experience
            </button>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="form-section">
        <SectionHeader
          title="Education"
          section="education"
          count={resumeData.education.length}
        />
        {openSections.education && (
          <div className="section-content">
            {resumeData.education.map((edu, index) => (
              <div key={edu.id} className="education-item">
                <div className="item-header">
                  <span className="item-number">#{index + 1}</span>
                  <button
                    className="btn-remove"
                    onClick={() => removeEducation(edu.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Degree *</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>School *</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => handleEducationChange(edu.id, 'school', e.target.value)}
                      placeholder="University of Technology"
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={edu.location}
                      onChange={(e) => handleEducationChange(edu.id, 'location', e.target.value)}
                      placeholder="Boston, MA"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Year</label>
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) => handleEducationChange(edu.id, 'startDate', e.target.value)}
                      placeholder="2015"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Year</label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => handleEducationChange(edu.id, 'endDate', e.target.value)}
                      placeholder="2019"
                    />
                  </div>
                  <div className="form-group">
                    <label>GPA</label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => handleEducationChange(edu.id, 'gpa', e.target.value)}
                      placeholder="3.8"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Additional Information</label>
                  <textarea
                    value={edu.description}
                    onChange={(e) => handleEducationChange(edu.id, 'description', e.target.value)}
                    placeholder="Honors, relevant coursework, activities..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
            <button className="btn-add" onClick={addEducation}>
              + Add Education
            </button>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="form-section">
        <SectionHeader
          title="Skills"
          section="skills"
          count={resumeData.skills.length}
        />
        {openSections.skills && (
          <div className="section-content">
            {resumeData.skills.map((skill, index) => (
              <div key={skill.id} className="skill-category-item">
                <div className="item-header">
                  <span className="item-number">#{index + 1}</span>
                  <button
                    className="btn-remove"
                    onClick={() => removeSkillCategory(skill.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={skill.category}
                    onChange={(e) => handleSkillCategoryChange(skill.id, e.target.value)}
                    placeholder="Programming Languages"
                  />
                </div>
                <div className="form-group">
                  <label>Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={skill.items.join(', ')}
                    onChange={(e) => handleSkillItemsChange(skill.id, e.target.value)}
                    placeholder="JavaScript, Python, SQL"
                  />
                </div>
              </div>
            ))}
            <button className="btn-add" onClick={addSkillCategory}>
              + Add Skill Category
            </button>
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="form-section">
        <SectionHeader
          title="Projects"
          section="projects"
          count={resumeData.projects.length}
        />
        {openSections.projects && (
          <div className="section-content">
            {resumeData.projects.map((project, index) => (
              <div key={project.id} className="project-item">
                <div className="item-header">
                  <span className="item-number">#{index + 1}</span>
                  <button
                    className="btn-remove"
                    onClick={() => removeProject(project.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Project Name *</label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => handleProjectChange(project.id, 'name', e.target.value)}
                      placeholder="E-Commerce Platform"
                    />
                  </div>
                  <div className="form-group">
                    <label>Link</label>
                    <input
                      type="text"
                      value={project.link}
                      onChange={(e) => handleProjectChange(project.id, 'link', e.target.value)}
                      placeholder="github.com/username/project"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => handleProjectChange(project.id, 'description', e.target.value)}
                    placeholder="Brief description of the project..."
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={project.technologies.join(', ')}
                    onChange={(e) => handleProjectTechChange(project.id, e.target.value)}
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </div>
              </div>
            ))}
            <button className="btn-add" onClick={addProject}>
              + Add Project
            </button>
          </div>
        )}
      </div>

      {/* Certifications */}
      <div className="form-section">
        <SectionHeader
          title="Certifications"
          section="certifications"
          count={resumeData.certifications.length}
        />
        {openSections.certifications && (
          <div className="section-content">
            {resumeData.certifications.map((cert, index) => (
              <div key={cert.id} className="certification-item">
                <div className="item-header">
                  <span className="item-number">#{index + 1}</span>
                  <button
                    className="btn-remove"
                    onClick={() => removeCertification(cert.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Certification Name *</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleCertificationChange(cert.id, 'name', e.target.value)}
                      placeholder="AWS Certified Solutions Architect"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Issuing Organization</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleCertificationChange(cert.id, 'issuer', e.target.value)}
                      placeholder="Amazon Web Services"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="text"
                      value={cert.date}
                      onChange={(e) => handleCertificationChange(cert.id, 'date', e.target.value)}
                      placeholder="2023"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-add" onClick={addCertification}>
              + Add Certification
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeForm
