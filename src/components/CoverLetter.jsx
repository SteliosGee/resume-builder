import { useState } from 'react'

function CoverLetter({ resumeData, accentColor }) {
  const [coverData, setCoverData] = useState({
    recipientName: '',
    recipientTitle: '',
    companyName: '',
    companyAddress: '',
    opening: 'I am writing to express my strong interest in the position at your company. With my background in ' + (resumeData.personal?.title || 'this field') + ', I believe I would be a valuable addition to your team.',
    body: 'In my current role, I have developed strong skills in problem-solving, collaboration, and delivering results. My experience has taught me how to work effectively in fast-paced environments while maintaining attention to detail.',
    closing: 'I would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application. I look forward to hearing from you.',
  })

  const handleChange = (field, value) => {
    setCoverData({ ...coverData, [field]: value })
  }

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="cover-letter-container">
      <div className="cover-letter-form">
        <h3>Cover Letter Details</h3>

        <div className="form-section">
          <h4>Recipient Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Hiring Manager Name</label>
              <input
                type="text"
                value={coverData.recipientName}
                onChange={(e) => handleChange('recipientName', e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={coverData.recipientTitle}
                onChange={(e) => handleChange('recipientTitle', e.target.value)}
                placeholder="Hiring Manager"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={coverData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Acme Corporation"
              />
            </div>
            <div className="form-group">
              <label>Company Address</label>
              <input
                type="text"
                value={coverData.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                placeholder="123 Business St, City, State"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Letter Content</h4>
          <div className="form-group">
            <label>Opening Paragraph</label>
            <textarea
              value={coverData.opening}
              onChange={(e) => handleChange('opening', e.target.value)}
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Body Paragraph</label>
            <textarea
              value={coverData.body}
              onChange={(e) => handleChange('body', e.target.value)}
              rows={6}
            />
          </div>
          <div className="form-group">
            <label>Closing Paragraph</label>
            <textarea
              value={coverData.closing}
              onChange={(e) => handleChange('closing', e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </div>

      <div className="cover-letter-preview">
        <div className="cover-letter-page" style={{ borderTopColor: accentColor }}>
          <div className="letter-header">
            <h1 style={{ color: accentColor }}>{resumeData.personal?.name || 'Your Name'}</h1>
            <p className="contact-info">
              {resumeData.personal?.email && <span>{resumeData.personal.email}</span>}
              {resumeData.personal?.phone && <span> | {resumeData.personal.phone}</span>}
              {resumeData.personal?.location && <span> | {resumeData.personal.location}</span>}
            </p>
          </div>

          <div className="letter-date">{today}</div>

          <div className="letter-recipient">
            {coverData.recipientName && <p className="name">{coverData.recipientName}</p>}
            {coverData.recipientTitle && <p>{coverData.recipientTitle}</p>}
            {coverData.companyName && <p className="company">{coverData.companyName}</p>}
            {coverData.companyAddress && <p>{coverData.companyAddress}</p>}
          </div>

          <div className="letter-body">
            <p>Dear {coverData.recipientName || 'Hiring Manager'},</p>

            <p>{coverData.opening}</p>

            <p>{coverData.body}</p>

            <p>{coverData.closing}</p>

            <p className="signature">
              Sincerely,<br />
              <strong>{resumeData.personal?.name || 'Your Name'}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoverLetter
