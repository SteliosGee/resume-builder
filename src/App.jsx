import { useState, useRef, useEffect } from 'react'
import ResumeForm from './components/ResumeForm'
import ResumePreview from './components/ResumePreview'
import TemplateSelector from './components/TemplateSelector'
import PaymentModal from './components/PaymentModal'
import FAQ from './components/FAQ'
import ATSScore from './components/ATSScore'
import SectionReorder from './components/SectionReorder'
import CoverLetter from './components/CoverLetter'
import Tooltip from './components/Tooltip'
import LoadingSkeleton from './components/LoadingSkeleton'
import SuccessAnimation from './components/SuccessAnimation'
import { ToastProvider, useToast } from './components/Toast'

const TEMPLATES = [
  { id: 'modern', name: 'Modern', description: 'Clean design with accent colors' },
  { id: 'classic', name: 'Classic', description: 'Traditional professional format' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' },
  { id: 'executive', name: 'Executive', description: 'Formal, for senior positions' },
  { id: 'creative', name: 'Creative', description: 'Bold design for creative roles' },
  { id: 'technical', name: 'Technical', description: 'Optimized for engineers' },
  { id: 'compact', name: 'Compact', description: 'Maximum content, minimal space' },
]

const defaultResumeData = {
  personal: {
    name: 'John Doe',
    title: 'Senior Software Developer',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/johndoe',
    website: '',
  },
  summary: 'Passionate software developer with 5+ years of experience building scalable web applications. Proficient in React, Node.js, and Python. Led teams of 5+ developers and improved system performance by 40% through architectural improvements.',
  experience: [
    {
      id: 1,
      title: 'Senior Software Developer',
      company: 'Tech Corp',
      location: 'New York, NY',
      startDate: 'Jan 2022',
      endDate: 'Present',
      current: true,
      bullets: [
        'Led development of microservices architecture serving 1M+ daily users',
        'Mentored team of 5 junior developers, improving code quality by 30%',
        'Implemented CI/CD pipelines reducing deployment time by 60%',
      ],
    },
    {
      id: 2,
      title: 'Software Developer',
      company: 'StartupXYZ',
      location: 'San Francisco, CA',
      startDate: 'Jun 2019',
      endDate: 'Dec 2021',
      current: false,
      bullets: [
        'Developed 10+ React components used across 3 products',
        'Collaborated with design team to implement responsive UI',
        'Reduced page load time by 45% through code optimization',
      ],
    },
  ],
  education: [
    {
      id: 1,
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of Technology',
      location: 'Boston, MA',
      startDate: '2015',
      endDate: '2019',
      gpa: '3.8',
      description: 'Graduated with honors. Relevant coursework: Data Structures, Algorithms, Web Development.',
    },
  ],
  skills: [
    { id: 1, category: 'Programming Languages', items: ['JavaScript', 'TypeScript', 'Python', 'SQL'] },
    { id: 2, category: 'Frameworks', items: ['React', 'Node.js', 'Express', 'Next.js'] },
    { id: 3, category: 'Tools', items: ['Git', 'Docker', 'AWS', 'CI/CD'] },
  ],
  projects: [
    {
      id: 1,
      name: 'E-Commerce Platform',
      description: 'Full-stack e-commerce solution with real-time inventory management',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
      link: 'github.com/johndoe/ecommerce',
    },
  ],
  certifications: [
    { id: 1, name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023' },
  ],
}

function AppContent() {
  const { addToast } = useToast()
  const [resumeData, setResumeData] = useState(function() {
    try {
      var saved = localStorage.getItem('resumeData')
      if (saved) {
        var parsed = JSON.parse(saved)
        return {
          ...defaultResumeData,
          ...parsed,
          personal: { ...defaultResumeData.personal, ...(parsed.personal || {}) },
          experience: parsed.experience || [],
          education: parsed.education || [],
          skills: parsed.skills || [],
          projects: parsed.projects || [],
          certifications: parsed.certifications || [],
        }
      }
      return defaultResumeData
    } catch (e) {
      return defaultResumeData
    }
  })
  const [template, setTemplate] = useState(function() {
    try {
      return localStorage.getItem('resumeTemplate') || 'modern'
    } catch (e) {
      return 'modern'
    }
  })
  const [accentColor, setAccentColor] = useState(function() {
    try {
      return localStorage.getItem('resumeAccentColor') || '#2563eb'
    } catch (e) {
      return '#2563eb'
    }
  })
  const [fontFamily, setFontFamily] = useState(function() {
    try {
      return localStorage.getItem('resumeFontFamily') || 'Inter'
    } catch (e) {
      return 'Inter'
    }
  })
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('editor')
  const [sectionOrder, setSectionOrder] = useState(['summary', 'experience', 'education', 'skills', 'projects', 'certifications'])
  const [showSuccess, setShowSuccess] = useState(false)
  const resumeRef = useRef(null)

  useEffect(function() {
    try {
      localStorage.setItem('resumeData', JSON.stringify(resumeData))
    } catch (e) {
      console.error('Failed to save data:', e)
    }
  }, [resumeData])

  useEffect(function() {
    try {
      localStorage.setItem('resumeTemplate', template)
    } catch (e) {
      console.error('Failed to save template:', e)
    }
  }, [template])

  useEffect(function() {
    try {
      localStorage.setItem('resumeAccentColor', accentColor)
    } catch (e) {
      console.error('Failed to save color:', e)
    }
  }, [accentColor])

  useEffect(function() {
    try {
      localStorage.setItem('resumeFontFamily', fontFamily)
    } catch (e) {
      console.error('Failed to save font:', e)
    }
  }, [fontFamily])

  // Handle Stripe redirect
  useEffect(function() {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const cancelled = params.get('cancelled')
    
    if (sessionId) {
      // Clear URL params first, then process payment
      window.history.replaceState({}, document.title, '/')
      handlePaymentSuccess(sessionId)
    }

    if (cancelled) {
      setPaymentMessage({ type: 'error', text: 'Payment was cancelled.' })
      window.history.replaceState({}, document.title, '/')
    }
  }, [])

  const handlePaymentSuccess = async (sessionId) => {
    setIsGenerating(true)
    setPaymentMessage(null)

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          resumeData,
          accentColor,
          template,
          fontFamily,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate PDF')
      }

      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `${resumeData.personal.name.replace(/\s+/g, '_')}_Resume.zip`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?$/)
        if (match) filename = match[1]
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      setShowSuccess(true)
      addToast('Resume downloaded successfully!', 'success')
      setTimeout(() => setShowSuccess(false), 2500)
    } catch (error) {
      console.error('Error:', error)
      setPaymentMessage({ type: 'error', text: error.message || 'Error generating PDF' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadClick = () => {
    setShowPayment(true)
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('resumeData')
      setResumeData(defaultResumeData)
      addToast('Resume data cleared', 'info')
    }
  }

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${resumeData.personal.name.replace(/\s+/g, '_')}_Resume.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Resume exported as JSON', 'success')
  }

  const handleImportJSON = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        setResumeData(data)
        addToast('Resume imported successfully', 'success')
      } catch {
        addToast('Invalid JSON file', 'error')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">Resume</span>
            <span className="logo-text">ProBuilder</span>
          </div>
          <div className="header-actions">
            <Tooltip text="Export resume data">
              <button className="btn btn-outline" onClick={handleExportJSON}>
                Export
              </button>
            </Tooltip>
            <label className="btn btn-outline">
              Import
              <input type="file" accept=".json" onChange={handleImportJSON} hidden />
            </label>
            <Tooltip text="Clear all data">
              <button className="btn btn-outline" onClick={handleClearData}>
                Reset
              </button>
            </Tooltip>
            {isGenerating ? (
              <button className="btn btn-primary" disabled>
                <span className="loading-spinner-small"></span>
                Generating...
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleDownloadClick}>
                Download
              </button>
            )}
          </div>
        </div>
      </header>

      {paymentMessage && (
        <div className={`payment-message ${paymentMessage.type}`}>
          {paymentMessage.text}
          <button onClick={() => setPaymentMessage(null)}>×</button>
        </div>
      )}

      <div className="tabs-bar">
        <button
          className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          Editor
        </button>
        <button
          className={`tab-btn ${activeTab === 'cover' ? 'active' : ''}`}
          onClick={() => setActiveTab('cover')}
        >
          Cover Letter
        </button>
        <button
          className={`tab-btn ${activeTab === 'ats' ? 'active' : ''}`}
          onClick={() => setActiveTab('ats')}
        >
          ATS Score
        </button>
        <button
          className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          FAQ
        </button>
      </div>

      {activeTab === 'editor' && (
        <>
          <div className="template-bar">
            <span className="template-label">Template:</span>
            <TemplateSelector
              templates={TEMPLATES}
              selected={template}
              onSelect={setTemplate}
            />
            <div className="color-picker-group">
              <label className="color-picker-label">Color:</label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="color-picker"
              />
            </div>
            <div className="font-picker-group">
              <label className="font-picker-label">Font:</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="font-picker"
              >
                <option value="Inter">Inter</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Calibri">Calibri</option>
                <option value="Garamond">Garamond</option>
                <option value="Palatino">Palatino</option>
              </select>
            </div>
            <button
              className="btn btn-ghost mobile-preview-toggle"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>

          <main className="app-main">
            <div className={`form-panel ${showPreview ? 'hide-mobile' : ''}`}>
              <ResumeForm resumeData={resumeData} setResumeData={setResumeData} />
              <SectionReorder order={sectionOrder} setOrder={setSectionOrder} />
            </div>
            <div className={`preview-panel ${showPreview ? '' : 'hide-mobile'}`}>
              <div className="preview-container">
                <div ref={resumeRef} className="resume-print-area">
                  <ResumePreview resumeData={resumeData} template={template} accentColor={accentColor} sectionOrder={sectionOrder} fontFamily={fontFamily} />
                </div>
              </div>
            </div>
          </main>
        </>
      )}

      {activeTab === 'cover' && (
        <main className="app-main cover-mode">
          <CoverLetter resumeData={resumeData} accentColor={accentColor} />
        </main>
      )}

      {activeTab === 'ats' && (
        <main className="app-main ats-mode">
          <ATSScore />
        </main>
      )}

      {activeTab === 'faq' && (
        <main className="app-main faq-mode">
          <FAQ />
        </main>
      )}

      <footer className="app-footer">
        <p>Need help? Contact us at <a href="mailto:stelios.galegalidis@gmail.com">stelios.galegalidis@gmail.com</a></p>
      </footer>

      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          resumeName={resumeData.personal.name}
        />
      )}

      <SuccessAnimation show={showSuccess} />
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App
