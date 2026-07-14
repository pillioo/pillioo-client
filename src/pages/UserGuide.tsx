import { Link } from 'react-router-dom'
import './UserGuide.css'

function UserGuide() {
  return (
    <div className="ug-workspace">
      <Link className="ug-back" to="/app">
        ← Back to Inbox
      </Link>

      <header className="ug-header">
        <h1 className="ug-title">Pillioo User Guide</h1>
        <p className="ug-subtitle">
          Pillioo is an AI-powered pharmaceutical recall analysis platform that helps you identify
          recalled medications and understand the associated risks. By automatically collecting,
          analyzing, and organizing official recall information, Pillioo provides clear, reliable,
          and easy-to-understand reports for healthcare professionals and the general public.
        </p>
        <p className="ug-subtitle">
          Whether you are a pharmacist, healthcare provider, researcher, or consumer, Pillioo helps
          you make informed decisions based on the latest recall information.
        </p>
      </header>

      <section className="ug-card">
        <h2 className="ug-card-title">Getting Started</h2>
        <p className="ug-lead">Using Pillioo is simple. Follow these steps to analyze a pharmaceutical recall.</p>

        <ol className="ug-steps">
          <li>
            <h3 className="ug-step-title">Search for a Product</h3>
            <p>Enter one of the following into the search bar:</p>
            <ul className="ug-list">
              <li>Drug Name</li>
              <li>NDC Number</li>
              <li>Recall Number</li>
              <li>LOT Number</li>
            </ul>
            <p>Click Search to begin the analysis.</p>
          </li>
          <li>
            <h3 className="ug-step-title">Review Product Information</h3>
            <p>Pillioo will display the basic information for the selected product, including:</p>
            <ul className="ug-list">
              <li>Drug Name</li>
              <li>Manufacturer</li>
              <li>NDC Number</li>
              <li>LOT Number</li>
              <li>Recall Classification</li>
              <li>Recall Status</li>
              <li>Recall Date</li>
            </ul>
            <p>This information is gathered from official recall data sources.</p>
          </li>
          <li>
            <h3 className="ug-step-title">AI Analysis</h3>
            <p>
              Once the recall information has been retrieved, Pillioo automatically analyzes the
              available data and generates a structured summary.
            </p>
            <p>The AI report includes:</p>
            <ul className="ug-list">
              <li>Recall reason</li>
              <li>Potential health risks</li>
              <li>Affected products</li>
              <li>Safety recommendations</li>
              <li>Suggested actions</li>
              <li>Important observations</li>
            </ul>
            <p>The analysis is designed to help users understand lengthy recall notices in just a few minutes.</p>
          </li>
          <li>
            <h3 className="ug-step-title">Review the Generated Report</h3>
            <p>Pillioo automatically generates a comprehensive report containing:</p>
            <ul className="ug-list">
              <li>Product Overview</li>
              <li>Recall Summary</li>
              <li>Risk Assessment</li>
              <li>Detailed Analysis</li>
              <li>Recommended Actions</li>
              <li>Supporting Evidence</li>
            </ul>
            <p>Reports are presented in a standardized format to ensure consistency and readability.</p>
          </li>
          <li>
            <h3 className="ug-step-title">Pharmacist Review (When Required)</h3>
            <p>For reports requiring professional validation, pharmacists can review the AI-generated content before final approval.</p>
            <p>Available actions include:</p>
            <ul className="ug-list">
              <li>Approve the report</li>
              <li>Request revisions</li>
              <li>Edit the report manually</li>
              <li>Reject the report</li>
            </ul>
            <p>This review process improves the reliability and accuracy of the final report.</p>
          </li>
        </ol>
      </section>

      <section className="ug-card">
        <h2 className="ug-card-title">Recall Classification</h2>
        <div className="ug-classification-grid">
          <div className="ug-classification-item">
            <span className="ug-badge ug-badge-danger">Class I</span>
            <p>
              A Class I recall represents the highest level of risk. Products in this category may
              cause serious adverse health consequences or death. Immediate action is strongly
              recommended.
            </p>
          </div>
          <div className="ug-classification-item">
            <span className="ug-badge ug-badge-warning">Class II</span>
            <p>
              A Class II recall involves products that may cause temporary or medically reversible
              health problems. Users should carefully review the recommendations provided in the
              report.
            </p>
          </div>
          <div className="ug-classification-item">
            <span className="ug-badge ug-badge-info">Class III</span>
            <p>
              A Class III recall applies to products that are unlikely to cause adverse health
              effects but violate manufacturing or regulatory standards. Users should follow the
              recommended recall procedures when applicable.
            </p>
          </div>
        </div>
      </section>

      <section className="ug-card">
        <h2 className="ug-card-title">Search Tips</h2>
        <ul className="ug-list">
          <li>Use the exact drug name whenever possible.</li>
          <li>Searching with an NDC Number provides more accurate results.</li>
          <li>LOT Numbers help identify specific production batches.</li>
          <li>Recall Numbers provide the fastest and most precise search.</li>
          <li>Both generic and brand names are supported.</li>
        </ul>
      </section>

      <section className="ug-card">
        <h2 className="ug-card-title">Understanding the Report</h2>
        <p className="ug-lead">Each report generated by Pillioo contains several sections:</p>
        <dl className="ug-definition-list">
          <div className="ug-definition-item">
            <dt>Product Information</dt>
            <dd>Basic details about the recalled pharmaceutical product.</dd>
          </div>
          <div className="ug-definition-item">
            <dt>Recall Summary</dt>
            <dd>A concise explanation of why the product was recalled.</dd>
          </div>
          <div className="ug-definition-item">
            <dt>Risk Assessment</dt>
            <dd>An evaluation of the potential health risks associated with the recall.</dd>
          </div>
          <div className="ug-definition-item">
            <dt>AI Analysis</dt>
            <dd>An AI-generated interpretation of the recall notice highlighting key findings and safety concerns.</dd>
          </div>
          <div className="ug-definition-item">
            <dt>Recommended Actions</dt>
            <dd>Suggested next steps for healthcare professionals and consumers.</dd>
          </div>
        </dl>
      </section>

      <section className="ug-card ug-notice">
        <h2 className="ug-card-title">Important Notice</h2>
        <p>
          Pillioo provides information based on publicly available recall data from official
          regulatory sources.
        </p>
        <p>
          While AI-generated summaries are designed to improve readability and efficiency, they
          should be considered informational only.
        </p>
        <p>
          For clinical decision-making, patient treatment, or regulatory compliance, users should
          always refer to the official recall notice and consult qualified healthcare
          professionals.
        </p>
      </section>

      <section className="ug-card">
        <h2 className="ug-card-title">Frequently Asked Questions</h2>
        <div className="ug-faq">
          <div className="ug-faq-item">
            <h3 className="ug-faq-question">Why can&apos;t I find my medication?</h3>
            <p>The product may not currently be listed in the recall database. Please verify the drug name, NDC Number, or Recall Number and try again.</p>
          </div>
          <div className="ug-faq-item">
            <h3 className="ug-faq-question">Does &quot;Not Recalled&quot; mean the product is completely safe?</h3>
            <p>&quot;Not Recalled&quot; simply indicates that no active recall has been identified in the available official data at the time of your search.</p>
          </div>
          <div className="ug-faq-item">
            <h3 className="ug-faq-question">Can AI analysis replace professional judgment?</h3>
            <p>No. Pillioo is designed to support healthcare professionals by providing faster access to structured information, not to replace medical expertise.</p>
          </div>
          <div className="ug-faq-item">
            <h3 className="ug-faq-question">Can reports be edited?</h3>
            <p>Yes. During the pharmacist review stage, reports may be revised, updated, or approved before becoming the final version.</p>
          </div>
        </div>
      </section>

      <section className="ug-card ug-help">
        <h2 className="ug-card-title">Need Help?</h2>
        <p>
          If you experience any issues while using Pillioo or have suggestions for improving the
          platform, please contact our support team.
        </p>
        <p>
          We are committed to providing accurate, reliable, and user-friendly pharmaceutical recall
          information to promote safer medication use for everyone.
        </p>
      </section>
    </div>
  )
}

export default UserGuide