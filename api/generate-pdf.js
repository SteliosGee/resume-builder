import Stripe from 'stripe'
import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TabStopType, TabStopPosition, Table, TableRow, TableCell, WidthType, ShadingType, VerticalAlign, convertInchesToTwip } from 'docx'
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

  // Each template gets completely different structure
  if (template === 'compact') return generateDocxCompact(resumeData, color, font)
  if (template === 'minimal') return generateDocxMinimal(resumeData, color, font)
  if (template === 'creative') return generateDocxCreative(resumeData, color, font)
  if (template === 'technical') return generateDocxTechnical(resumeData, color, font)
  if (template === 'executive') return generateDocxExecutive(resumeData, color, font)
  if (template === 'classic') return generateDocxClassic(resumeData, color, font)
  return generateDocxModern(resumeData, color, font)
}

function buildDocx(children, margins) {
  return new Document({
    sections: [{
      properties: {
        page: {
          margin: margins || { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      children,
    }],
  })
}

function contactLine(personal, size, font, color) {
  return new Paragraph({
    children: [new TextRun({
      text: [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).join(' | '),
      size, font, color: color || '000000',
    })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  })
}

function addExperience(experience, children, bodySize, font, bulletChar, indent, beforeSpacing) {
  if (!experience || experience.length === 0 || !experience[0].title) return
  experience.forEach((exp) => {
    const dateStr = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: exp.title || '', bold: true, size: bodySize, font }),
          new TextRun({ text: `\t${dateStr}`, size: bodySize, font }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        spacing: { before: beforeSpacing || 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`, italics: true, size: bodySize, font })],
        spacing: { after: 60 },
      })
    )
    if (exp.bullets) {
      exp.bullets.forEach((bullet) => {
        if (bullet) {
          children.push(new Paragraph({
            children: [new TextRun({ text: `${bulletChar} ${bullet}`, size: bodySize, font })],
            indent: { left: indent || 720 },
            spacing: { after: 30 },
          }))
        }
      })
    }
  })
}

function addEducation(education, children, bodySize, font) {
  if (!education || education.length === 0 || !education[0].degree) return
  education.forEach((edu) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: edu.degree || '', bold: true, size: bodySize, font }),
          new TextRun({ text: `\t${edu.startDate} - ${edu.endDate}`, size: bodySize, font }),
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

function addProjects(projects, children, bodySize, font, bulletChar) {
  if (!projects || projects.length === 0 || !projects[0].name) return
  projects.forEach((proj) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: proj.name || '', bold: true, size: bodySize, font }),
          new TextRun({ text: proj.url ? ` - ${proj.url}` : '', size: bodySize, font, color: '0563C1' }),
        ],
        spacing: { before: 80 },
      })
    )
    if (proj.description) {
      children.push(new Paragraph({
        children: [new TextRun({ text: proj.description, size: bodySize, font })],
        spacing: { after: 30 },
      }))
    }
  })
}

function addCertifications(certifications, children, bodySize, font) {
  if (!certifications || certifications.length === 0 || !certifications[0].name) return
  certifications.forEach((cert) => {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${cert.name || ''}`, bold: true, size: bodySize, font }),
        new TextRun({ text: cert.issuer ? ` - ${cert.issuer}` : '', size: bodySize, font }),
        new TextRun({ text: cert.date ? ` (${cert.date})` : '', size: bodySize, font }),
      ],
      spacing: { after: 40 },
    }))
  })
}

function sectionHeaderModern(title, sectionSize, color, font) {
  return new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: sectionSize, color, font })],
    spacing: { before: 200, after: 80 },
    border: { bottom: { color, style: BorderStyle.SINGLE, size: 1 } },
  })
}

function generateDocxModern(resumeData, color, font) {
  const { personal, summary, experience, education, skills, projects, certifications } = resumeData
  const children = []

  children.push(
    new Paragraph({ children: [new TextRun({ text: personal.name || 'Your Name', bold: true, size: 52, font })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
    new Paragraph({ children: [new TextRun({ text: personal.title || 'Your Title', size: 28, bold: true, color, font })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
    contactLine(personal, 18, font),
  )

  if (summary) {
    children.push(sectionHeaderModern('Professional Summary', 22, color, font))
    children.push(new Paragraph({ children: [new TextRun({ text: summary, size: 20, font })], spacing: { after: 150 } }))
  }

  if (experience && experience.length > 0 && experience[0].title) {
    children.push(sectionHeaderModern('Work Experience', 22, color, font))
    addExperience(experience, children, 20, font, '•')
  }

  if (education && education.length > 0 && education[0].degree) {
    children.push(sectionHeaderModern('Education', 22, color, font))
    addEducation(education, children, 20, font)
  }

  if (skills && skills.length > 0 && skills[0].category) {
    children.push(sectionHeaderModern('Skills', 22, color, font))
    skills.forEach((skill) => {
      if (skill.category && skill.items && skill.items.length > 0) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${skill.category}: `, bold: true, size: 20, font }),
            new TextRun({ text: skill.items.join(', '), size: 20, font }),
          ],
          spacing: { after: 60 },
        }))
      }
    })
  }

  addProjects(projects, children, 20, font)
  addCertifications(certifications, children, 20, font)
  return buildDocx(children)
}

function sectionHeaderClassic(title, sectionSize, font) {
  return new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: sectionSize, color: '000000', font })],
    spacing: { before: 240, after: 80 },
    border: { bottom: { color: '333333', style: BorderStyle.SINGLE, size: 2 } },
  })
}

function generateDocxClassic(resumeData, color, font) {
  const { personal, summary, experience, education, skills, projects, certifications } = resumeData
  const children = []

  children.push(
    new Paragraph({ children: [new TextRun({ text: personal.name || 'Your Name', bold: true, size: 52, font })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
    new Paragraph({ children: [new TextRun({ text: personal.title || 'Your Title', size: 26, font })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
    contactLine(personal, 18, font),
    new Paragraph({ children: [], border: { bottom: { color: '333333', style: BorderStyle.DOUBLE, size: 4 } }, spacing: { after: 200 } }),
  )

  if (summary) {
    children.push(sectionHeaderClassic('Professional Summary', 22, font))
    children.push(new Paragraph({ children: [new TextRun({ text: summary, size: 20, font })], spacing: { after: 150 } }))
  }

  if (experience && experience.length > 0 && experience[0].title) {
    children.push(sectionHeaderClassic('Work Experience', 22, font))
    addExperience(experience, children, 20, font, '•')
  }

  if (education && education.length > 0 && education[0].degree) {
    children.push(sectionHeaderClassic('Education', 22, font))
    addEducation(education, children, 20, font)
  }

  if (skills && skills.length > 0 && skills[0].category) {
    children.push(sectionHeaderClassic('Skills', 22, font))
    skills.forEach((skill) => {
      if (skill.category && skill.items && skill.items.length > 0) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${skill.category}: `, bold: true, size: 20, font }),
            new TextRun({ text: skill.items.join(', '), size: 20, font }),
          ],
          spacing: { after: 60 },
        }))
      }
    })
  }

  addProjects(projects, children, 20, font)
  addCertifications(certifications, children, 20, font)
  return buildDocx(children)
}

function sectionHeaderMinimal(title, sectionSize, font) {
  return new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), size: sectionSize, color: '999999', font })],
    spacing: { before: 280, after: 100 },
  })
}

function generateDocxMinimal(resumeData, color, font) {
  const { personal, summary, experience, education, skills, projects, certifications } = resumeData
  const children = []

  children.push(
    new Paragraph({ children: [new TextRun({ text: personal.name || 'Your Name', bold: true, size: 44, color: '333333', font })], alignment: AlignmentType.LEFT, spacing: { after: 80 } }),
    new Paragraph({ children: [new TextRun({ text: personal.title || 'Your Title', size: 24, color: '888888', font })], alignment: AlignmentType.LEFT, spacing: { after: 100 } }),
    new Paragraph({
      children: [new TextRun({
        text: [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).join('  ·  '),
        size: 16, font, color: '888888',
      })],
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
    }),
  )

  if (summary) {
    children.push(sectionHeaderMinimal('About', 20, font))
    children.push(new Paragraph({ children: [new TextRun({ text: summary, size: 18, color: '444444', font })], spacing: { after: 150 } }))
  }

  if (experience && experience.length > 0 && experience[0].title) {
    children.push(sectionHeaderMinimal('Experience', 20, font))
    experience.forEach((exp) => {
      const dateStr = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title || '', bold: true, size: 18, color: '333333', font }),
          ],
          spacing: { before: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`, size: 18, color: '666666', font }),
            new TextRun({ text: `\t${dateStr}`, size: 16, color: '999999', font }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: { after: 40 },
        })
      )
      if (exp.bullets) {
        exp.bullets.forEach((bullet) => {
          if (bullet) {
            children.push(new Paragraph({
              children: [new TextRun({ text: bullet, size: 18, color: '444444', font })],
              indent: { left: 360 },
              spacing: { after: 20 },
            }))
          }
        })
      }
    })
  }

  if (education && education.length > 0 && education[0].degree) {
    children.push(sectionHeaderMinimal('Education', 20, font))
    education.forEach((edu) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: edu.degree || '', bold: true, size: 18, color: '333333', font })],
          spacing: { before: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: edu.school || '', size: 18, color: '666666', font }),
            new TextRun({ text: `\t${edu.startDate} - ${edu.endDate}`, size: 16, color: '999999', font }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: { after: 60 },
        })
      )
    })
  }

  if (skills && skills.length > 0 && skills[0].category) {
    children.push(sectionHeaderMinimal('Skills', 20, font))
    skills.forEach((skill) => {
      if (skill.category && skill.items && skill.items.length > 0) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${skill.category}`, bold: true, size: 18, color: '666666', font }),
            new TextRun({ text: `  ${skill.items.join(' · ')}`, size: 18, color: '444444', font }),
          ],
          spacing: { after: 40 },
        }))
      }
    })
  }

  addProjects(projects, children, 18, font, '→')
  addCertifications(certifications, children, 18, font)
  return buildDocx(children, { top: 900, bottom: 900, left: 900, right: 900 })
}

function sectionHeaderExecutive(title, sectionSize, color, font) {
  return new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: sectionSize, color: '000000', font })],
    spacing: { before: 240, after: 80 },
    border: { bottom: { color, style: BorderStyle.SINGLE, size: 3 } },
  })
}

function generateDocxExecutive(resumeData, color, font) {
  const { personal, summary, experience, education, skills, projects, certifications } = resumeData
  const children = []

  children.push(
    new Paragraph({ children: [], spacing: { after: 60 }, border: { bottom: { color: '333333', style: BorderStyle.SINGLE, size: 6 } } }),
    new Paragraph({ children: [new TextRun({ text: personal.name || 'Your Name', bold: true, size: 56, font, color: '1a1a1a' })], alignment: AlignmentType.CENTER, spacing: { before: 100, after: 60 } }),
    new Paragraph({ children: [new TextRun({ text: personal.title || 'Your Title', size: 26, font, color: '444444' })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
    contactLine(personal, 18, font, '444444'),
    new Paragraph({ children: [], spacing: { after: 200 }, border: { bottom: { color: '333333', style: BorderStyle.SINGLE, size: 6 } } }),
  )

  if (summary) {
    children.push(sectionHeaderExecutive('Executive Summary', 22, color, font))
    children.push(new Paragraph({ children: [new TextRun({ text: summary, size: 20, font })], spacing: { after: 150 } }))
  }

  if (experience && experience.length > 0 && experience[0].title) {
    children.push(sectionHeaderExecutive('Professional Experience', 22, color, font))
    addExperience(experience, children, 20, font, '▸', 720)
  }

  if (education && education.length > 0 && education[0].degree) {
    children.push(sectionHeaderExecutive('Education', 22, color, font))
    addEducation(education, children, 20, font)
  }

  if (skills && skills.length > 0 && skills[0].category) {
    children.push(sectionHeaderExecutive('Core Competencies', 22, color, font))
    skills.forEach((skill) => {
      if (skill.category && skill.items && skill.items.length > 0) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${skill.category}: `, bold: true, size: 20, font }),
            new TextRun({ text: skill.items.join('  |  '), size: 20, font }),
          ],
          spacing: { after: 60 },
        }))
      }
    })
  }

  addProjects(projects, children, 20, font)
  addCertifications(certifications, children, 20, font)
  return buildDocx(children)
}

function sectionHeaderTechnical(title, sectionSize, color, font) {
  return new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: sectionSize, color: 'FFFFFF', font })],
    spacing: { before: 200, after: 80 },
    shading: { type: ShadingType.CLEAR, fill: color, color: 'auto' },
  })
}

function generateDocxTechnical(resumeData, color, font) {
  const { personal, summary, experience, education, skills, projects, certifications } = resumeData
  const children = []

  children.push(
    new Paragraph({ children: [new TextRun({ text: personal.name || 'Your Name', bold: true, size: 52, font })], alignment: AlignmentType.LEFT, spacing: { after: 60 } }),
    new Paragraph({ children: [new TextRun({ text: personal.title || 'Your Title', size: 26, font, color, bold: true })], alignment: AlignmentType.LEFT, spacing: { after: 80 } }),
    new Paragraph({
      children: [new TextRun({
        text: [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).join(' | '),
        size: 18, font, color: '555555',
      })],
      alignment: AlignmentType.LEFT,
      spacing: { after: 60 },
    }),
    new Paragraph({ children: [], border: { bottom: { color, style: BorderStyle.SINGLE, size: 2 } }, spacing: { after: 200 } }),
  )

  if (summary) {
    children.push(sectionHeaderTechnical('Summary', 22, color, font))
    children.push(new Paragraph({ children: [new TextRun({ text: summary, size: 20, font })], spacing: { after: 150 } }))
  }

  if (skills && skills.length > 0 && skills[0].category) {
    children.push(sectionHeaderTechnical('Technical Skills', 22, color, font))
    skills.forEach((skill) => {
      if (skill.category && skill.items && skill.items.length > 0) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${skill.category}: `, bold: true, size: 20, font }),
            new TextRun({ text: skill.items.join(' | '), size: 20, font }),
          ],
          indent: { left: 360 },
          spacing: { after: 40 },
        }))
      }
    })
  }

  if (experience && experience.length > 0 && experience[0].title) {
    children.push(sectionHeaderTechnical('Experience', 22, color, font))
    addExperience(experience, children, 20, font, '▸', 480)
  }

  if (projects && projects.length > 0 && projects[0].name) {
    children.push(sectionHeaderTechnical('Projects', 22, color, font))
    projects.forEach((proj) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.name || '', bold: true, size: 20, font }),
            new TextRun({ text: proj.url ? ` - ${proj.url}` : '', size: 18, font, color: '0563C1' }),
          ],
          spacing: { before: 80 },
        })
      )
      if (proj.description) {
        children.push(new Paragraph({
          children: [new TextRun({ text: proj.description, size: 20, font })],
          spacing: { after: 30 },
        }))
      }
    })
  }

  if (education && education.length > 0 && education[0].degree) {
    children.push(sectionHeaderTechnical('Education', 22, color, font))
    addEducation(education, children, 20, font)
  }

  addCertifications(certifications, children, 20, font)
  return buildDocx(children)
}

function sectionHeaderCompact(title, sectionSize, font) {
  return new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: sectionSize, color: '333333', font })],
    spacing: { before: 160, after: 60 },
    border: { bottom: { color: 'cccccc', style: BorderStyle.SINGLE, size: 1 } },
  })
}

function generateDocxCompact(resumeData, color, font) {
  const { personal, summary, experience, education, skills, projects, certifications } = resumeData
  const children = []

  const contactParts = [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean)
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: personal.name || 'Your Name', bold: true, size: 40, font }),
        new TextRun({ text: `   |   ${personal.title || 'Your Title'}`, size: 20, font, color: '666666' }),
        new TextRun({ text: `   |   ${contactParts.join('   |   ')}`, size: 16, font, color: '888888' }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 60 },
    }),
    new Paragraph({ children: [], border: { bottom: { color: '333333', style: BorderStyle.SINGLE, size: 1 } }, spacing: { after: 160 } }),
  )

  if (summary) {
    children.push(new Paragraph({ children: [new TextRun({ text: summary, size: 18, font })], spacing: { after: 100 } }))
  }

  if (experience && experience.length > 0 && experience[0].title) {
    children.push(sectionHeaderCompact('Experience', 18, font))
    experience.forEach((exp) => {
      const dateStr = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.title || ''}`, bold: true, size: 18, font }),
            new TextRun({ text: ` at ${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`, size: 18, font }),
            new TextRun({ text: `\t${dateStr}`, size: 16, font, color: '888888' }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: { before: 60 },
        })
      )
      if (exp.bullets) {
        exp.bullets.forEach((bullet) => {
          if (bullet) {
            children.push(new Paragraph({
              children: [new TextRun({ text: `- ${bullet}`, size: 18, font })],
              indent: { left: 360 },
              spacing: { after: 20 },
            }))
          }
        })
      }
    })
  }

  if (education && education.length > 0 && education[0].degree) {
    children.push(sectionHeaderCompact('Education', 18, font))
    education.forEach((edu) => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: edu.degree || '', bold: true, size: 18, font }),
          new TextRun({ text: `, ${edu.school || ''}`, size: 18, font }),
          new TextRun({ text: `\t${edu.startDate} - ${edu.endDate}`, size: 16, font, color: '888888' }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        spacing: { after: 40 },
      }))
    })
  }

  if (skills && skills.length > 0 && skills[0].category) {
    children.push(sectionHeaderCompact('Skills', 18, font))
    skills.forEach((skill) => {
      if (skill.category && skill.items && skill.items.length > 0) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${skill.category}: `, bold: true, size: 18, font }),
            new TextRun({ text: skill.items.join(', '), size: 18, font }),
          ],
          spacing: { after: 30 },
        }))
      }
    })
  }

  addProjects(projects, children, 18, font, '-')
  addCertifications(certifications, children, 18, font)
  return buildDocx(children, { top: 600, bottom: 600, left: 600, right: 600 })
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

    const hex = color.replace('#', '')
    const rgb = {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    }

    // Map user fonts to jsPDF supported fonts
    const fontMap = {
      'Inter': 'helvetica', 'Arial': 'helvetica', 'Helvetica': 'helvetica', 'Calibri': 'helvetica',
      'Georgia': 'times', 'Times New Roman': 'times', 'Garamond': 'times', 'Palatino': 'times',
    }
    const font = fontMap[fontFamily] || 'helvetica'

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
