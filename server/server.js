import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'
import { config } from 'dotenv'
import { jsPDF } from 'jspdf'

config()

const app = express()
const PORT = process.env.PORT || 3001

const stripeKey = process.env.STRIPE_SECRET_KEY
if (!stripeKey || stripeKey === 'sk_test_demo') {
  console.error('ERROR: STRIPE_SECRET_KEY not configured!')
  console.error('Please create server/.env and add your Stripe secret key.')
  console.error('Get your key at: https://dashboard.stripe.com/apikeys')
  process.exit(1)
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
})

app.use(cors())
app.use(express.json())

// Store completed payment IDs
const completedPayments = new Set()

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { resumeName } = req.body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Resume PDF Download',
              description: `Resume: ${resumeName || 'Professional Resume'}`,
            },
            unit_amount: 100, // €1.00
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/?cancelled=true`,
      metadata: {
        resumeName: resumeName || 'Resume',
      },
    })

    res.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    res.status(500).json({
      error: error.message || 'Failed to create checkout session',
    })
  }
})

// Verify payment and generate PDF
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { sessionId, resumeData } = req.body

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'No session ID provided',
      })
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(403).json({
        success: false,
        error: 'Payment not completed',
      })
    }

    // Check if already used
    if (completedPayments.has(sessionId)) {
      return res.status(403).json({
        success: false,
        error: 'This download link has already been used',
      })
    }

    // Mark as used
    completedPayments.add(sessionId)

    // Generate PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Header
    pdf.setFontSize(32)
    pdf.setFont('helvetica', 'bold')
    pdf.text(resumeData.personal.name || 'Your Name', pdfWidth / 2, 20, { align: 'center' })

    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(37, 99, 235)
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
      pdf.setTextColor(37, 99, 235)
      pdf.text(title, 15, y)
      pdf.setDrawColor(37, 99, 235)
      pdf.line(15, y + 2, pdfWidth - 15, y + 2)
      y += 8
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      return y
    }

    // Summary
    if (resumeData.summary) {
      addSection('PROFESSIONAL SUMMARY', resumeData.summary)
      const lines = pdf.splitTextToSize(resumeData.summary, pdfWidth - 30)
      pdf.setFont('helvetica', 'normal')
      pdf.text(lines, 15, y)
      y += lines.length * 5 + 5
    }

    // Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      addSection('WORK EXPERIENCE', resumeData.experience)
      resumeData.experience.forEach((exp) => {
        if (y > pdfHeight - 30) {
          pdf.addPage()
          y = 20
        }
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

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      addSection('EDUCATION', resumeData.education)
      resumeData.education.forEach((edu) => {
        if (y > pdfHeight - 30) {
          pdf.addPage()
          y = 20
        }
        pdf.setFont('helvetica', 'bold')
        pdf.text(edu.degree || '', 15, y)
        pdf.setFont('helvetica', 'normal')
        const dateStr = `${edu.startDate} - ${edu.endDate}`
        pdf.text(dateStr, pdfWidth - 15, y, { align: 'right' })
        y += 5
        pdf.setFont('helvetica', 'italic')
        pdf.text(edu.school || '', 15, y)
        y += 5
      })
    }

    // Skills
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

    const pdfBuffer = pdf.output('arraybuffer')

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${(resumeData.personal.name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf"`)
    res.send(Buffer.from(pdfBuffer))

  } catch (error) {
    console.error('PDF generation error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF',
    })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
