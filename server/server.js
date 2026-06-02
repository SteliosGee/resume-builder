import dotenv from 'dotenv'
dotenv.config()

const express = (await import('express')).default
const cors = (await import('cors')).default
const { default: createCheckoutSession } = await import('../api/create-checkout-session.js')
const { default: generatePdf } = await import('../api/generate-pdf.js')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.post('/api/create-checkout-session', createCheckoutSession)
app.post('/api/generate-pdf', generatePdf)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
