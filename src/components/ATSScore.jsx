import { useState } from 'react'

function ATSScore({ resumeData }) {
  const [uploadedText, setUploadedText] = useState('')
  const [fileName, setFileName] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadMode, setUploadMode] = useState(false)

  const extractTextFromPDF = async (file) => {
    const pdfjsLib = await import('pdfjs-dist')

    // Use CDN for worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      fullText += textContent.items.map(item => item.str).join(' ') + '\n'
    }

    return fullText
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsAnalyzing(true)
    setFileName(file.name)

    try {
      let text = ''

      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file)
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        text = await file.text()
      } else {
        alert('Please upload a PDF or text file')
        setIsAnalyzing(false)
        return
      }

      setUploadedText(text)
    } catch (error) {
      console.error('Error reading file:', error)
      alert('Error reading file. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeText = (text) => {
    const issues = []
    let score = 0
    const maxScore = 100
    const lowerText = text.toLowerCase()

    // Contact Info (20 points)
    let contactScore = 0
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    const phoneRegex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/

    if (emailRegex.test(text)) {
      contactScore += 7
    } else {
      issues.push({ type: 'error', text: 'No email address found' })
    }

    if (phoneRegex.test(text)) {
      contactScore += 7
    } else {
      issues.push({ type: 'error', text: 'No phone number found' })
    }

    if (linkedinRegex.test(text)) {
      contactScore += 3
    } else {
      issues.push({ type: 'info', text: 'Consider adding LinkedIn profile' })
    }

    if (text.match(/\b(new york|san francisco|los angeles|chicago|houston|seattle|boston|austin|denver|remote)\b/i)) {
      contactScore += 3
    } else {
      issues.push({ type: 'warning', text: 'No location found' })
    }
    score += contactScore

    // Summary/Objective (10 points)
    let summaryScore = 0
    if (lowerText.includes('summary') || lowerText.includes('objective') || lowerText.includes('profile')) {
      summaryScore += 5
      const summaryIndex = Math.max(
        lowerText.indexOf('summary'),
        lowerText.indexOf('objective'),
        lowerText.indexOf('profile')
      )
      const summarySection = text.substring(summaryIndex, summaryIndex + 500)
      const wordCount = summarySection.split(/\s+/).length
      if (wordCount >= 30) {
        summaryScore += 5
      } else if (wordCount >= 15) {
        summaryScore += 3
        issues.push({ type: 'info', text: 'Summary could be longer' })
      }
    } else {
      issues.push({ type: 'warning', text: 'No summary/objective section found' })
    }
    score += summaryScore

    // Experience (30 points)
    let expScore = 0
    if (lowerText.includes('experience') || lowerText.includes('employment') || lowerText.includes('work history')) {
      expScore += 10

      const actionVerbs = ['led', 'developed', 'implemented', 'managed', 'created', 'improved', 'increased', 'reduced', 'achieved', 'delivered', 'built', 'designed', 'launched', 'optimized', 'automated', 'streamlined', 'coordinated', 'supervised', 'trained', 'analyzed', 'maintained', 'established', 'generated', 'facilitated']
      const hasActionVerbs = actionVerbs.some(verb => lowerText.includes(verb))
      if (hasActionVerbs) {
        expScore += 10
      } else {
        issues.push({ type: 'info', text: 'Use more action verbs (led, developed, improved, etc.)' })
      }

      const dateRegex = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*\d{4}|20\d{2})/gi
      const dates = text.match(dateRegex)
      if (dates && dates.length >= 2) {
        expScore += 5
      } else {
        issues.push({ type: 'warning', text: 'Add dates to experience entries' })
      }

      const bulletPoints = (text.match(/[•\-\*]\s/g) || []).length
      if (bulletPoints >= 6) {
        expScore += 5
      } else if (bulletPoints >= 3) {
        expScore += 3
        issues.push({ type: 'info', text: 'Add more bullet points' })
      } else {
        issues.push({ type: 'warning', text: 'Use bullet points to describe achievements' })
      }
    } else {
      issues.push({ type: 'error', text: 'No experience section found' })
    }
    score += expScore

    // Education (15 points)
    let eduScore = 0
    if (lowerText.includes('education') || lowerText.includes('academic')) {
      eduScore += 8

      const degrees = ['bachelor', 'master', 'phd', 'doctorate', 'associate', 'b.s.', 'b.a.', 'm.s.', 'm.a.', 'mba']
      const hasDegree = degrees.some(degree => lowerText.includes(degree))
      if (hasDegree) {
        eduScore += 4
      } else {
        issues.push({ type: 'info', text: 'Specify your degree type' })
      }

      const universities = ['university', 'college', 'institute', 'school']
      const hasSchool = universities.some(u => lowerText.includes(u))
      if (hasSchool) {
        eduScore += 3
      } else {
        issues.push({ type: 'warning', text: 'Add school/university name' })
      }
    } else {
      issues.push({ type: 'warning', text: 'No education section found' })
    }
    score += eduScore

    // Skills (25 points)
    let skillsScore = 0
    if (lowerText.includes('skills') || lowerText.includes('technologies') || lowerText.includes('competencies')) {
      skillsScore += 10

      const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'aws', 'docker', 'git', 'typescript', 'angular', 'vue', 'php', 'ruby', 'go', 'rust', 'kubernetes', 'terraform']
      const foundTech = techKeywords.filter(tech => lowerText.includes(tech))
      if (foundTech.length >= 5) {
        skillsScore += 10
      } else if (foundTech.length >= 3) {
        skillsScore += 7
      } else if (foundTech.length >= 1) {
        skillsScore += 4
      } else {
        issues.push({ type: 'info', text: 'Include more technical skills' })
      }

      const softSkills = ['communication', 'leadership', 'teamwork', 'problem-solving', 'analytical', 'creative', 'organized', 'detail-oriented', 'adaptable']
      const hasSoftSkills = softSkills.some(skill => lowerText.includes(skill))
      if (hasSoftSkills) {
        skillsScore += 5
      } else {
        issues.push({ type: 'info', text: 'Consider adding soft skills' })
      }
    } else {
      issues.push({ type: 'error', text: 'No skills section found' })
    }
    score += skillsScore

    const percentage = Math.min(Math.round((score / maxScore) * 100), 100)

    let grade = 'F'
    if (percentage >= 90) grade = 'A+'
    else if (percentage >= 80) grade = 'A'
    else if (percentage >= 70) grade = 'B'
    else if (percentage >= 60) grade = 'C'
    else if (percentage >= 50) grade = 'D'

    return { score: percentage, grade, issues }
  }

  const dataToAnalyze = uploadedText || ''
  const { score, grade, issues } = dataToAnalyze ? analyzeText(dataToAnalyze) : { score: 0, grade: '-', issues: [] }

  const getScoreColor = () => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const errorCount = issues.filter(i => i.type === 'error').length
  const warningCount = issues.filter(i => i.type === 'warning').length
  const infoCount = issues.filter(i => i.type === 'info').length

  return (
    <div className="ats-container">
      <div className="ats-tabs">
        <button
          className={`ats-tab ${!uploadMode ? 'active' : ''}`}
          onClick={() => setUploadMode(false)}
        >
          Analyze Builder Resume
        </button>
        <button
          className={`ats-tab ${uploadMode ? 'active' : ''}`}
          onClick={() => setUploadMode(true)}
        >
          Upload Resume
        </button>
      </div>

      {uploadMode && (
        <div className="ats-upload">
          <label className="upload-area">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              hidden
            />
            {isAnalyzing ? (
              <span>Analyzing...</span>
            ) : fileName ? (
              <span className="file-name">{fileName}</span>
            ) : (
              <span>Click to upload PDF or TXT file</span>
            )}
          </label>
        </div>
      )}

      {!uploadMode && !resumeData?.personal?.name && (
        <div className="ats-empty">
          <p>Fill in the resume builder to see your ATS score</p>
        </div>
      )}

      {(uploadMode ? uploadedText : resumeData?.personal?.name) && (
        <div className="ats-score">
          <div className="ats-header">
            <h3>ATS Score</h3>
            <div className="ats-badge" style={{ background: getScoreColor() }}>
              {grade}
            </div>
          </div>

          <div className="ats-score-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={getScoreColor()}
                strokeWidth="8"
                strokeDasharray={`${score * 2.83} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="ats-score-text">
              <span className="score">{score}%</span>
            </div>
          </div>

          <div className="ats-stats">
            <span className="stat error">{errorCount} errors</span>
            <span className="stat warning">{warningCount} warnings</span>
            <span className="stat info">{infoCount} suggestions</span>
          </div>

          <div className="ats-issues">
            {issues.map((issue, index) => (
              <div key={index} className={`ats-issue ${issue.type}`}>
                <span className="issue-icon">
                  {issue.type === 'error' && '✕'}
                  {issue.type === 'warning' && '⚠'}
                  {issue.type === 'info' && 'ℹ'}
                </span>
                <span className="issue-text">{issue.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ATSScore
