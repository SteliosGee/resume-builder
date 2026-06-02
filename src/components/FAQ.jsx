import { useState } from 'react'

const faqData = [
  {
    question: 'How do I create my resume?',
    answer: 'Fill in the form on the left side with your personal information, work experience, education, and skills. The preview on the right updates in real-time as you type.'
  },
  {
    question: 'Can I save my resume?',
    answer: 'Yes! Your data is automatically saved to your browser\'s local storage. You can also export your resume as a JSON file to import it later or on another device.'
  },
  {
    question: 'How do I download my resume?',
    answer: 'Click the "Download" button in the top right corner. After completing the payment, you\'ll receive a ZIP file containing both PDF and DOCX formats of your resume.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards through our secure payment processor Stripe. Your card information is never stored on our servers.'
  },
  {
    question: 'Can I change the color of my resume?',
    answer: 'Yes! Use the color picker in the toolbar to select any accent color. The color is applied to headings, borders, and other design elements across all templates.'
  },
  {
    question: 'Which template should I choose?',
    answer: 'Modern is great for most industries. Classic is better for traditional fields like law or finance. Creative has a sidebar layout for design roles. Technical is optimized for engineers. Choose based on your industry and preference.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. All data stays in your browser and is never sent to our servers except during PDF generation. We don\'t store or track your personal information.'
  },
  {
    question: 'Can I import an existing resume?',
    answer: 'Yes! Click "Import JSON" in the toolbar to load a previously exported resume file. This allows you to continue editing where you left off.'
  }
]

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="faq-section">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqData.map((faq, index) => (
          <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
            <button className="faq-question" onClick={() => toggleFAQ(index)}>
              <span>{faq.question}</span>
              <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
            </button>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default FAQ
