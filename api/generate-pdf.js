import Stripe from 'stripe'
import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TabStopType, TabStopPosition } from 'docx'
import JSZip from 'jszip'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

function generateDocx(resumeData, accentColor, template, fontFamily) {
  console.log('generateDocx called with template:', template)
  const { personal, summary, experience, education, skills, projects, certifications } = resumeData
  const font = fontFamily || 'Calibri'
  const color = accentColor.replace('#', '')

  const children = []

  // Template-specific configuration
  const headerAlign = ['classic', 'executive', 'modern'].includes(template) ? AlignmentType.CENTER : AlignmentType.LEFT
  
  // Template-specific sizing
  let nameSize, titleSize, bodySize, sectionSize, titleColor, titleBold
  
  if (template === 'compact') {
    nameSize = 40
    titleSize = 22
    bodySize = 18
    sectionSize = 20
    titleColor = '000000'
    titleBold = false
  } else if (template === 'minimal') {
    nameSize = 44
    titleSize = 24
    bodySize = 20
    sectionSize = 22
    titleColor = '888888'
    titleBold = false
  } else if (template === 'creative') {
    nameSize = 44
    titleSize = 26
    bodySize = 20
    sectionSize = 22
    titleColor = color
    titleBold = true
  } else if (template === 'technical') {
    nameSize = 52
    titleSize = 28
    bodySize = 20
    sectionSize = 22
    titleColor = color
    titleBold = true
  } else if (template === 'executive') {
    nameSize = 52
    titleSize = 28
    bodySize = 20
    sectionSize = 22
    titleColor = '000000'
    titleBold = false
  } else if (template === 'classic') {
    nameSize = 52
    titleSize = 26
    bodySize = 20
    sectionSize = 22
    titleColor = '000000'
    titleBold = false
  } else { // modern (default)
    nameSize = 52
    titleSize = 28
    bodySize = 20
    sectionSize = 22
    titleColor = color
    titleBold = true
  }

  // Helper to create section header based on template
  const createSectionHeader = (title) => {
    let borderStyle, headerColor
    
    if (template === 'classic') {
      borderStyle = { bottom: { color: '333333', style: BorderStyle.SINGLE, size: 2 } }
      headerColor = '000000'
    } else if (template === 'executive') {
      borderStyle = { bottom: { color, style: BorderStyle.SINGLE, size: 3 } }
      headerColor = '000000'
    } else if (template === 'minimal') {
      borderStyle = {}
      headerColor = '888888'
    } else if (template === 'compact') {
      borderStyle = { bottom: { color: '333333', style: BorderStyle.SINGLE, size: 1 } }
      headerColor = '000000'
    } else if (template === 'technical') {
      borderStyle = { top: { color, style: BorderStyle.SINGLE, size: 2 } }
      headerColor = color
    } else if (template === 'creative') {
      borderStyle = { bottom: { color, style: BorderStyle.DOUBLE, size: 1 } }
      headerColor = color
    } else { // modern
      borderStyle = { bottom: { color, style: BorderStyle.SINGLE, size: 1 } }
      headerColor = color
    }

    return new Paragraph({
      children: [new TextRun({ text: title.toUpperCase(), bold: true, size: sectionSize, color: headerColor, font })],
      spacing: { before: 200, after: 80 },
      border: borderStyle,
    })
  }

  // Header
  children.push(
    new Paragraph({
      children: [new TextRun({ text: personal.name || 'Your Name', bold: true, size: nameSize, font })],
      alignment: headerAlign,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: personal.title || 'Your Title', size: titleSize, bold: titleBold, color: titleColor, font })],
      alignment: headerAlign,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).join(' | '),
        size: bodySize - 2,
        font,
        color: template === 'minimal' ? '666666' : '000000'
      })],
      alignment: headerAlign,
      spacing: { after: 200 },
    })
  )

  // Summary
  if (summary) {
    children.push(createSectionHeader('Professional Summary'))
    children.push(
      new Paragraph({
        children: [new TextRun({ text: summary, size: bodySize, font })],
        spacing: { after: 150 },
      })
    )
  }

  // Experience
  if (experience && experience.length > 0 && experience[0].title) {
    children.push(createSectionHeader('Work Experience'))

    experience.forEach((exp) => {
      const dateStr = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title || '', bold: true, size: bodySize, font }),
            new TextRun({ text: `\t${dateStr}`, size: bodySize, font }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: { before: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`, italics: true, size: bodySize, font })],
          spacing: { after: 60 },
        })
      )

      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach((bullet) => {
          if (bullet) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: `• ${bullet}`, size: bodySize, font })],
                indent: { left: 720 },
                spacing: { after: 30 },
              })
            )
          }
        })
      }
    })
  }

  // Education
  if (education && education.length > 0 && education[0].degree) {
    children.push(createSectionHeader('Education'))

    education.forEach((edu) => {
      const dateStr = `${edu.startDate} - ${edu.endDate}`
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree || '', bold: true, size: bodySize, font }),
            new TextRun({ text: `\t${dateStr}`, size: bodySize, font }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: { before: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: edu.school || '', italics: true, size: bodySize, font })],
          spacing: { after: 80 },
        })
      )
    })
  }

  // Skills
  if (skills && skills.length > 0 && skills[0].category) {
    children.push(createSectionHeader('Skills'))

    skills.forEach((skill) => {
      if (skill.category && skill.items && skill.items.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${skill.category}: `, bold: true, size: bodySize, font }),
              new TextRun({ text: skill.items.join(', '), size: bodySize, font }),
            ],
            spacing: { after: 60 },
          })
        )
      }
    })
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      children,
    }],
  })

  return doc
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { sessionId, resumeData, accentColor, template, fontFamily: userFont } = req.body

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'No session ID provided' })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(403).json({ success: false, error: 'Payment not completed' })
    }

    const color = accentColor || '#2563eb'
    const fontFamily = userFont || 'Inter'
    
    console.log('Template received:', template, 'Font:', fontFamily, 'Color:', color)

    // Generate PDF based on template
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    let y = 20

    const checkPage = (needed) => {
      if (y + needed > pdfHeight - 20) { pdf.addPage(); y = 20 }
    }

    const drawLine = (x1, yPos, x2, thickness, r, g, b) => {
      pdf.setDrawColor(r, g, b)
      pdf.setLineWidth(thickness)
      pdf.line(x1, yPos, x2, yPos)
    }

    const addSectionModern = (title) => {
      checkPage(15)
      pdf.setFontSize(11)
      pdf.setFont(font, 'bold')
      pdf.setTextColor(rgb.r, rgb.g, rgb.b)
      pdf.text(title.toUpperCase(), 15, y)
      drawLine(15, y + 1.5, pdfWidth - 15, 0.3, rgb.r, rgb.g, rgb.b)
      y += 6
      pdf.setTextColor(0, 0, 0)
    }

    const addSectionClassic = (title) => {
      checkPage(15)
      pdf.setFontSize(11)
      pdf.setFont(font, 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text(title.toUpperCase(), 15, y)
      drawLine(15, y + 1.5, pdfWidth - 15, 0.5, 0, 0, 0)
      y += 6
    }

    const addSectionMinimal = (title) => {
      checkPage(15)
      pdf.setFontSize(10)
      pdf.setFont(font, 'bold')
      pdf.setTextColor(120, 120, 120)
      pdf.text(title.toUpperCase(), 15, y)
      y += 5
      pdf.setTextColor(0, 0, 0)
    }

    const addSectionExecutive = (title) => {
      checkPage(15)
      pdf.setFontSize(11)
      pdf.setFont(font, 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text(title.toUpperCase(), 15, y)
      drawLine(15, y + 1.5, pdfWidth - 15, 0.8, rgb.r, rgb.g, rgb.b)
      y += 6
    }

    const addSectionTechnical = (title) => {
      checkPage(15)
      pdf.setFillColor(rgb.r, rgb.g, rgb.b)
      pdf.rect(15, y - 4, pdfWidth - 30, 6, 'F')
      pdf.setFontSize(10)
      pdf.setFont(font, 'bold')
      pdf.setTextColor(255, 255, 255)
      pdf.text(title.toUpperCase(), 17, y)
      y += 6
      pdf.setTextColor(0, 0, 0)
    }

    const addSectionCompact = (title) => {
      checkPage(12)
      pdf.setFontSize(9)
      pdf.setFont(font, 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text(title.toUpperCase(), 12, y)
      drawLine(12, y + 1, pdfWidth - 12, 0.3, 0, 0, 0)
      y += 4
    }

    const addSummary = (sectionFn) => {
      if (!resumeData.summary) return
      checkPage(20)
      sectionFn('Professional Summary')
      const lines = pdf.splitTextToSize(resumeData.summary, pdfWidth - 30)
      pdf.setFont(font, 'normal')
      pdf.setFontSize(10)
      pdf.setTextColor(60, 60, 60)
      pdf.text(lines, 15, y)
      y += lines.length * 4.5 + 4
      pdf.setTextColor(0, 0, 0)
    }

    const addExperience = (sectionFn) => {
      if (!resumeData.experience || resumeData.experience.length === 0 || !resumeData.experience[0].title) return
      sectionFn('Work Experience')
      resumeData.experience.forEach((exp) => {
        checkPage(20)
        const dateStr = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`
        pdf.setFont(font, 'bold')
        pdf.setFontSize(10)
        pdf.text(exp.title || '', 15, y)
        pdf.setFont(font, 'normal')
        pdf.text(dateStr, pdfWidth - 15, y, { align: 'right' })
        y += 4.5
        pdf.setFont(font, 'italic')
        pdf.setFontSize(9)
        pdf.setTextColor(80, 80, 80)
        pdf.text(`${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`, 15, y)
        pdf.setTextColor(0, 0, 0)
        y += 4.5
        if (exp.bullets && exp.bullets.length > 0) {
          exp.bullets.forEach((bullet) => {
            if (bullet) {
              checkPage(8)
              const bulletLines = pdf.splitTextToSize('• ' + bullet, pdfWidth - 35)
              pdf.setFont(font, 'normal')
              pdf.setFontSize(9)
              pdf.text(bulletLines, 18, y)
              y += bulletLines.length * 3.8 + 0.5
            }
          })
        }
        y += 2
      })
    }

    const addEducation = (sectionFn) => {
      if (!resumeData.education || resumeData.education.length === 0 || !resumeData.education[0].degree) return
      sectionFn('Education')
      resumeData.education.forEach((edu) => {
        checkPage(15)
        pdf.setFont(font, 'bold')
        pdf.setFontSize(10)
        pdf.text(edu.degree || '', 15, y)
        pdf.setFont(font, 'normal')
        pdf.text(`${edu.startDate} - ${edu.endDate}`, pdfWidth - 15, y, { align: 'right' })
        y += 4.5
        pdf.setFont(font, 'italic')
        pdf.setFontSize(9)
        pdf.setTextColor(80, 80, 80)
        pdf.text(edu.school || '', 15, y)
        pdf.setTextColor(0, 0, 0)
        y += 5
      })
    }

    const addSkills = (sectionFn) => {
      if (!resumeData.skills || resumeData.skills.length === 0 || !resumeData.skills[0].category) return
      sectionFn('Skills')
      resumeData.skills.forEach((skill) => {
        if (skill.category && skill.items && skill.items.length > 0) {
          checkPage(8)
          pdf.setFont(font, 'bold')
          pdf.setFontSize(9)
          pdf.text(`${skill.category}: `, 15, y)
          pdf.setFont(font, 'normal')
          const skillsWidth = pdf.getTextWidth(`${skill.category}: `)
          const skillsText = skill.items.join(', ')
          const lines = pdf.splitTextToSize(skillsText, pdfWidth - 30 - skillsWidth)
          pdf.text(lines[0], 15 + skillsWidth, y)
          if (lines.length > 1) {
            y += 4
            lines.slice(1).forEach(line => {
              checkPage(6)
              pdf.text(line, 15, y)
              y += 4
            })
          }
          y += 4.5
        }
      })
    }

    if (template === 'creative') {
      // Creative: colored sidebar
      const sidebarWidth = 55
      pdf.setFillColor(rgb.r, rgb.g, rgb.b)
      pdf.rect(0, 0, sidebarWidth, pdfHeight, 'F')

      // Name in sidebar
      pdf.setFont(font, 'bold')
      pdf.setFontSize(18)
      pdf.setTextColor(255, 255, 255)
      const nameLines = pdf.splitTextToSize(resumeData.personal.name || 'Your Name', sidebarWidth - 16)
      pdf.text(nameLines, 8, 20)
      y = 20 + nameLines.length * 8

      // Title in sidebar
      pdf.setFont(font, 'normal')
      pdf.setFontSize(10)
      if (resumeData.personal.title) {
        const titleLines = pdf.splitTextToSize(resumeData.personal.title, sidebarWidth - 16)
        pdf.text(titleLines, 8, y + 2)
        y += 2 + titleLines.length * 4.5
      }

      // Contact in sidebar
      y += 8
      pdf.setFontSize(8)
      const contactItems = [
        resumeData.personal.email,
        resumeData.personal.phone,
        resumeData.personal.location,
        resumeData.personal.linkedin,
      ].filter(Boolean)
      contactItems.forEach(item => {
        const lines = pdf.splitTextToSize(item, sidebarWidth - 16)
        pdf.text(lines, 8, y)
        y += lines.length * 3.5 + 2
      })

      // Skills in sidebar
      if (resumeData.skills && resumeData.skills.length > 0) {
        y += 6
        pdf.setFont(font, 'bold')
        pdf.setFontSize(10)
        pdf.text('SKILLS', 8, y)
        y += 6
        resumeData.skills.forEach((skill) => {
          if (skill.category && skill.items && skill.items.length > 0) {
            pdf.setFont(font, 'bold')
            pdf.setFontSize(8)
            pdf.text(skill.category, 8, y)
            y += 4
            pdf.setFont(font, 'normal')
            skill.items.forEach(item => {
              const lines = pdf.splitTextToSize(item, sidebarWidth - 16)
              pdf.text(lines, 8, y)
              y += lines.length * 3.5 + 1
            })
            y += 2
          }
        })
      }

      // Main content on right
      const mainX = sidebarWidth + 8
      const mainWidth = pdfWidth - sidebarWidth - 23
      y = 20

      if (resumeData.summary) {
        pdf.setFont(font, 'bold')
        pdf.setFontSize(11)
        pdf.setTextColor(0, 0, 0)
        pdf.text('PROFESSIONAL SUMMARY', mainX, y)
        drawLine(mainX, y + 1.5, pdfWidth - 15, 0.3, rgb.r, rgb.g, rgb.b)
        y += 6
        const lines = pdf.splitTextToSize(resumeData.summary, mainWidth)
        pdf.setFont(font, 'normal')
        pdf.setFontSize(9)
        pdf.setTextColor(60, 60, 60)
        pdf.text(lines, mainX, y)
        y += lines.length * 4 + 5
      }

      if (resumeData.experience && resumeData.experience.length > 0 && resumeData.experience[0].title) {
        pdf.setFont(font, 'bold')
        pdf.setFontSize(11)
        pdf.setTextColor(0, 0, 0)
        pdf.text('EXPERIENCE', mainX, y)
        drawLine(mainX, y + 1.5, pdfWidth - 15, 0.3, rgb.r, rgb.g, rgb.b)
        y += 6
        resumeData.experience.forEach((exp) => {
          checkPage(20)
          const dateStr = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`
          pdf.setFont(font, 'bold')
          pdf.setFontSize(9)
          pdf.text(exp.title || '', mainX, y)
          pdf.setFont(font, 'normal')
          pdf.text(dateStr, pdfWidth - 15, y, { align: 'right' })
          y += 4
          pdf.setFont(font, 'italic')
          pdf.setFontSize(8)
          pdf.setTextColor(80, 80, 80)
          pdf.text(`${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`, mainX, y)
          pdf.setTextColor(0, 0, 0)
          y += 4
          if (exp.bullets && exp.bullets.length > 0) {
            exp.bullets.forEach((bullet) => {
              if (bullet) {
                checkPage(8)
                const bulletLines = pdf.splitTextToSize('• ' + bullet, mainWidth - 5)
                pdf.setFont(font, 'normal')
                pdf.setFontSize(8)
                pdf.text(bulletLines, mainX + 3, y)
                y += bulletLines.length * 3.5 + 0.5
              }
            })
          }
          y += 2
        })
      }

      if (resumeData.education && resumeData.education.length > 0 && resumeData.education[0].degree) {
        checkPage(15)
        pdf.setFont(font, 'bold')
        pdf.setFontSize(11)
        pdf.setTextColor(0, 0, 0)
        pdf.text('EDUCATION', mainX, y)
        drawLine(mainX, y + 1.5, pdfWidth - 15, 0.3, rgb.r, rgb.g, rgb.b)
        y += 6
        resumeData.education.forEach((edu) => {
          checkPage(12)
          pdf.setFont(font, 'bold')
          pdf.setFontSize(9)
          pdf.text(edu.degree || '', mainX, y)
          pdf.setFont(font, 'normal')
          pdf.text(`${edu.startDate} - ${edu.endDate}`, pdfWidth - 15, y, { align: 'right' })
          y += 4
          pdf.setFont(font, 'italic')
          pdf.setFontSize(8)
          pdf.setTextColor(80, 80, 80)
          pdf.text(edu.school || '', mainX, y)
          pdf.setTextColor(0, 0, 0)
          y += 5
        })
      }

    } else if (template === 'technical') {
      // Technical: colored section headers
      // Header
      pdf.setFont(font, 'bold')
      pdf.setFontSize(28)
      pdf.setTextColor(0, 0, 0)
      pdf.text(resumeData.personal.name || 'Your Name', 15, y + 2)
      y += 10
      pdf.setFont(font, 'normal')
      pdf.setFontSize(14)
      pdf.setTextColor(rgb.r, rgb.g, rgb.b)
      pdf.text(resumeData.personal.title || 'Your Title', 15, y)
      y += 7
      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)
      const contact = [resumeData.personal.email, resumeData.personal.phone, resumeData.personal.location, resumeData.personal.linkedin].filter(Boolean).join('  •  ')
      pdf.text(contact, 15, y)
      pdf.setTextColor(0, 0, 0)
      y += 8

      addSummary(addSectionTechnical)
      addExperience(addSectionTechnical)
      addEducation(addSectionTechnical)
      addSkills(addSectionTechnical)

    } else if (template === 'compact') {
      // Compact: tight spacing
      pdf.setFont(font, 'bold')
      pdf.setFontSize(20)
      pdf.text(resumeData.personal.name || 'Your Name', 12, y + 2)
      y += 8
      pdf.setFont(font, 'normal')
      pdf.setFontSize(11)
      pdf.setTextColor(rgb.r, rgb.g, rgb.b)
      pdf.text(resumeData.personal.title || 'Your Title', 12, y)
      y += 5
      pdf.setFontSize(8)
      pdf.setTextColor(80, 80, 80)
      pdf.text([resumeData.personal.email, resumeData.personal.phone, resumeData.personal.location, resumeData.personal.linkedin].filter(Boolean).join(' | '), 12, y)
      pdf.setTextColor(0, 0, 0)
      y += 6

      addSummary(addSectionCompact)
      addExperience(addSectionCompact)
      addEducation(addSectionCompact)
      addSkills(addSectionCompact)

    } else if (template === 'classic') {
      // Classic: centered, formal
      pdf.setFont(font, 'bold')
      pdf.setFontSize(28)
      pdf.text(resumeData.personal.name || 'Your Name', pdfWidth / 2, y + 2, { align: 'center' })
      y += 10
      pdf.setFont(font, 'normal')
      pdf.setFontSize(13)
      pdf.text(resumeData.personal.title || 'Your Title', pdfWidth / 2, y, { align: 'center' })
      y += 6
      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)
      pdf.text([resumeData.personal.email, resumeData.personal.phone, resumeData.personal.location, resumeData.personal.linkedin].filter(Boolean).join(' | '), pdfWidth / 2, y, { align: 'center' })
      pdf.setTextColor(0, 0, 0)
      y += 8

      addSummary(addSectionClassic)
      addExperience(addSectionClassic)
      addEducation(addSectionClassic)
      addSkills(addSectionClassic)

    } else if (template === 'minimal') {
      // Minimal: clean, left-aligned, light headers
      pdf.setFont(font, 'bold')
      pdf.setFontSize(24)
      pdf.text(resumeData.personal.name || 'Your Name', 15, y + 2)
      y += 9
      pdf.setFont(font, 'normal')
      pdf.setFontSize(12)
      pdf.setTextColor(rgb.r, rgb.g, rgb.b)
      pdf.text(resumeData.personal.title || 'Your Title', 15, y)
      y += 6
      pdf.setFontSize(9)
      pdf.setTextColor(120, 120, 120)
      pdf.text([resumeData.personal.email, resumeData.personal.phone, resumeData.personal.location, resumeData.personal.linkedin].filter(Boolean).join('  •  '), 15, y)
      pdf.setTextColor(0, 0, 0)
      y += 8

      addSummary(addSectionMinimal)
      addExperience(addSectionMinimal)
      addEducation(addSectionMinimal)
      addSkills(addSectionMinimal)

    } else if (template === 'executive') {
      // Executive: formal with colored header border
      drawLine(15, y, pdfWidth - 15, 1.5, rgb.r, rgb.g, rgb.b)
      y += 7
      pdf.setFont(font, 'bold')
      pdf.setFontSize(26)
      pdf.text(resumeData.personal.name || 'Your Name', pdfWidth / 2, y, { align: 'center' })
      y += 7
      pdf.setFont(font, 'normal')
      pdf.setFontSize(12)
      pdf.text(resumeData.personal.title || 'Your Title', pdfWidth / 2, y, { align: 'center' })
      y += 6
      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)
      pdf.text([resumeData.personal.email, resumeData.personal.phone, resumeData.personal.location, resumeData.personal.linkedin].filter(Boolean).join('  •  '), pdfWidth / 2, y, { align: 'center' })
      pdf.setTextColor(0, 0, 0)
      y += 8

      addSummary(addSectionExecutive)
      addExperience(addSectionExecutive)
      addEducation(addSectionExecutive)
      addSkills(addSectionExecutive)

    } else if (template === 'modern') {
      // Modern: bold title with centered layout
      pdf.setFont(font, 'bold')
      pdf.setFontSize(32)
      pdf.text(resumeData.personal.name || 'Your Name', pdfWidth / 2, y + 2, { align: 'center' })
      y += 10
      pdf.setFont(font, 'normal')
      pdf.setFontSize(16)
      pdf.setTextColor(rgb.r, rgb.g, rgb.b)
      pdf.text(resumeData.personal.title || 'Your Title', pdfWidth / 2, y, { align: 'center' })
      y += 7
      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)
      pdf.text([resumeData.personal.email, resumeData.personal.phone, resumeData.personal.location, resumeData.personal.linkedin].filter(Boolean).join(' | '), pdfWidth / 2, y, { align: 'center' })
      y += 10

      addSummary(addSectionModern)
      addExperience(addSectionModern)
      addEducation(addSectionModern)
      addSkills(addSectionModern)

    } else {
      // Default: Modern (fallback)
      pdf.setFont(font, 'bold')
      pdf.setFontSize(32)
      pdf.text(resumeData.personal.name || 'Your Name', pdfWidth / 2, y + 2, { align: 'center' })
      y += 10
      pdf.setFont(font, 'normal')
      pdf.setFontSize(16)
      pdf.setTextColor(rgb.r, rgb.g, rgb.b)
      pdf.text(resumeData.personal.title || 'Your Title', pdfWidth / 2, y, { align: 'center' })
      y += 7
      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)
      pdf.text([resumeData.personal.email, resumeData.personal.phone, resumeData.personal.location, resumeData.personal.linkedin].filter(Boolean).join(' | '), pdfWidth / 2, y, { align: 'center' })
      y += 10

      addSummary(addSectionModern)
      addExperience(addSectionModern)
      addEducation(addSectionModern)
      addSkills(addSectionModern)
    }

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Generate DOCX (use original fontFamily, not mapped)
    const doc = generateDocx(resumeData, color, template, fontFamily)
    const docxBuffer = await Packer.toBuffer(doc)

    // Create ZIP with both files
    const zip = new JSZip()
    zip.file(`${(resumeData.personal.name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`, pdfBuffer)
    zip.file(`${(resumeData.personal.name || 'Resume').replace(/\s+/g, '_')}_Resume.docx`, docxBuffer)
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    const fileName = `${(resumeData.personal.name || 'Resume').replace(/\s+/g, '_')}_Resume.zip`

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.send(zipBuffer)

  } catch (error) {
    console.error('PDF generation error:', error)
    res.status(500).json({ success: false, error: 'Failed to generate files' })
  }
}
