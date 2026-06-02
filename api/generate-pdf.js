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

function generateDocx(resumeData, accentColor) {
  const { personal, summary, experience, education, skills, projects, certifications } = resumeData

  const children = []

  // Header
  children.push(
    new Paragraph({
      children: [new TextRun({ text: personal.name || 'Your Name', bold: true, size: 64, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: personal.title || 'Your Title', size: 32, color: accentColor.replace('#', ''), font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).join(' | '),
        size: 20,
        font: 'Calibri'
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  )

  // Summary
  if (summary) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'PROFESSIONAL SUMMARY', bold: true, size: 24, color: accentColor.replace('#', ''), font: 'Calibri' })],
        spacing: { before: 200, after: 100 },
        border: { bottom: { color: accentColor.replace('#', ''), style: BorderStyle.SINGLE, size: 1 } },
      }),
      new Paragraph({
        children: [new TextRun({ text: summary, size: 20, font: 'Calibri' })],
        spacing: { after: 200 },
      })
    )
  }

  // Experience
  if (experience && experience.length > 0 && experience[0].title) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'WORK EXPERIENCE', bold: true, size: 24, color: accentColor.replace('#', ''), font: 'Calibri' })],
        spacing: { before: 200, after: 100 },
        border: { bottom: { color: accentColor.replace('#', ''), style: BorderStyle.SINGLE, size: 1 } },
      })
    )

    experience.forEach((exp) => {
      const dateStr = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title || '', bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: `\t${dateStr}`, size: 20, font: 'Calibri' }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: { before: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`, italics: true, size: 20, font: 'Calibri' })],
          spacing: { after: 100 },
        })
      )

      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach((bullet) => {
          if (bullet) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: `• ${bullet}`, size: 20, font: 'Calibri' })],
                indent: { left: 720 },
                spacing: { after: 50 },
              })
            )
          }
        })
      }
    })
  }

  // Education
  if (education && education.length > 0 && education[0].degree) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'EDUCATION', bold: true, size: 24, color: accentColor.replace('#', ''), font: 'Calibri' })],
        spacing: { before: 200, after: 100 },
        border: { bottom: { color: accentColor.replace('#', ''), style: BorderStyle.SINGLE, size: 1 } },
      })
    )

    education.forEach((edu) => {
      const dateStr = `${edu.startDate} - ${edu.endDate}`
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree || '', bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: `\t${dateStr}`, size: 20, font: 'Calibri' }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: { before: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: edu.school || '', italics: true, size: 20, font: 'Calibri' })],
          spacing: { after: 100 },
        })
      )
    })
  }

  // Skills
  if (skills && skills.length > 0 && skills[0].category) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'SKILLS', bold: true, size: 24, color: accentColor.replace('#', ''), font: 'Calibri' })],
        spacing: { before: 200, after: 100 },
        border: { bottom: { color: accentColor.replace('#', ''), style: BorderStyle.SINGLE, size: 1 } },
      })
    )

    skills.forEach((skill) => {
      if (skill.category && skill.items && skill.items.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${skill.category}: `, bold: true, size: 20, font: 'Calibri' }),
              new TextRun({ text: skill.items.join(', '), size: 20, font: 'Calibri' }),
            ],
            spacing: { after: 100 },
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
    const { sessionId, resumeData, accentColor } = req.body

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'No session ID provided' })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(403).json({ success: false, error: 'Payment not completed' })
    }

    const color = accentColor || '#2563eb'
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 37, g: 99, b: 235 }
    }
    const rgb = hexToRgb(color)

    // Generate PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    pdf.setFontSize(32)
    pdf.setFont('helvetica', 'bold')
    pdf.text(resumeData.personal.name || 'Your Name', pdfWidth / 2, 20, { align: 'center' })

    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(rgb.r, rgb.g, rgb.b)
    pdf.text(resumeData.personal.title || 'Your Title', pdfWidth / 2, 28, { align: 'center' })

    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)

    const contact = [
      resumeData.personal.email,
      resumeData.personal.phone,
      resumeData.personal.location,
      resumeData.personal.linkedin,
    ].filter(Boolean).join(' | ')
    pdf.text(contact, pdfWidth / 2, 35, { align: 'center' })

    let y = 45

    const addSection = (title, content) => {
      if (!content || content.length === 0) return y
      if (y > pdfHeight - 30) {
        pdf.addPage()
        y = 20
      }
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(rgb.r, rgb.g, rgb.b)
      pdf.text(title, 15, y)
      pdf.setDrawColor(rgb.r, rgb.g, rgb.b)
      pdf.line(15, y + 2, pdfWidth - 15, y + 2)
      y += 8
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      return y
    }

    if (resumeData.summary) {
      addSection('PROFESSIONAL SUMMARY', resumeData.summary)
      const lines = pdf.splitTextToSize(resumeData.summary, pdfWidth - 30)
      pdf.setFont('helvetica', 'normal')
      pdf.text(lines, 15, y)
      y += lines.length * 5 + 5
    }

    if (resumeData.experience && resumeData.experience.length > 0) {
      addSection('WORK EXPERIENCE', resumeData.experience)
      resumeData.experience.forEach((exp) => {
        if (y > pdfHeight - 30) { pdf.addPage(); y = 20 }
        pdf.setFont('helvetica', 'bold')
        pdf.text(exp.title || '', 15, y)
        pdf.setFont('helvetica', 'normal')
        const dateStr = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`
        pdf.text(dateStr, pdfWidth - 15, y, { align: 'right' })
        y += 5
        pdf.setFont('helvetica', 'italic')
        pdf.text(`${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`, 15, y)
        y += 5
        if (exp.bullets && exp.bullets.length > 0) {
          exp.bullets.forEach((bullet) => {
            if (bullet) {
              const bulletLines = pdf.splitTextToSize('• ' + bullet, pdfWidth - 35)
              pdf.setFont('helvetica', 'normal')
              pdf.text(bulletLines, 18, y)
              y += bulletLines.length * 4 + 1
            }
          })
        }
        y += 3
      })
    }

    if (resumeData.education && resumeData.education.length > 0) {
      addSection('EDUCATION', resumeData.education)
      resumeData.education.forEach((edu) => {
        if (y > pdfHeight - 30) { pdf.addPage(); y = 20 }
        pdf.setFont('helvetica', 'bold')
        pdf.text(edu.degree || '', 15, y)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`${edu.startDate} - ${edu.endDate}`, pdfWidth - 15, y, { align: 'right' })
        y += 5
        pdf.setFont('helvetica', 'italic')
        pdf.text(edu.school || '', 15, y)
        y += 5
      })
    }

    if (resumeData.skills && resumeData.skills.length > 0) {
      addSection('SKILLS', resumeData.skills)
      resumeData.skills.forEach((skill) => {
        if (skill.category && skill.items && skill.items.length > 0) {
          pdf.setFont('helvetica', 'bold')
          pdf.text(`${skill.category}: `, 15, y)
          pdf.setFont('helvetica', 'normal')
          const skillsText = skill.items.join(', ')
          const skillsWidth = pdf.getTextWidth(`${skill.category}: `)
          pdf.text(skillsText, 15 + skillsWidth, y)
          y += 5
        }
      })
    }

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Generate DOCX
    const doc = generateDocx(resumeData, color)
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
