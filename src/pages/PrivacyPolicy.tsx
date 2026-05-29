import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col max-w-md mx-auto relative overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 bg-[#fff8ea]/90 backdrop-blur-md m-4 my-4 rounded-3xl shadow-xl border border-amber-200/70">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="text-2xl font-serif text-stone-900 mb-2">Privacy Policy</h1>
        <p className="text-xs text-stone-500 mb-6">Last updated: May 2026</p>

        <div className="space-y-6 text-sm text-stone-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">1. Information We Collect</h2>
            <p className="mb-2">When you create an account and use Jyot, we may collect the following information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name</li>
              <li>Mobile number</li>
              <li>Birth date</li>
              <li>City</li>
              <li>Spiritual preferences (primary deity, gotra)</li>
              <li>Palm images uploaded for AI palm reading</li>
              <li>Jaap progress and usage analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">2. Purpose of Collection</h2>
            <p className="mb-2">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>User personalization and account management</li>
              <li>AI palm reading generation</li>
              <li>Panchang and spiritual guidance features (tailored to your city)</li>
              <li>Tracking jaap progress and streaks</li>
              <li>Improving app functionality and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">3. AI Processing Disclosure</h2>
            <p className="mb-2">Jyot uses third-party AI providers (Google Gemini) to process palm images and generate palm reading results.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Palm images are sent to Google Gemini for analysis.</li>
              <li>Images are used solely for generating palm reading results.</li>
              <li>We do not sell, rent, or share palm images with third parties for marketing or advertising.</li>
              <li>Images are not stored permanently on our servers beyond the time needed to generate your reading.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">4. Data Storage</h2>
            <p className="mb-2">Your data is stored in the following ways:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Server storage:</strong> User profiles, jaap progress, and palm reading results are stored on our server (hosted on Vercel). Palm reading data persists in ephemeral storage for the duration of a serverless function instance.</li>
              <li><strong>Local storage:</strong> Some preferences and session data are stored locally in your browser or device storage.</li>
              <li><strong>Retention:</strong> We retain your account data for as long as your account remains active. You may request deletion at any time.</li>
              <li><strong>Deletion requests:</strong> To request deletion of your data, contact us at the email below. We will process your request within 30 days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">5. Security</h2>
            <p className="mb-2">We implement reasonable security measures to protect your information, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>API keys stored exclusively in server-side environment variables, never in client-side code.</li>
              <li>HTTPS encryption for all data transmitted between your device and our servers.</li>
              <li>No exposure of sensitive credentials in the frontend bundle or APK.</li>
            </ul>
            <p className="mt-2">However, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security of your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">6. Contact</h2>
            <p>If you have questions about this Privacy Policy or wish to request data deletion, please contact us at:</p>
            <p className="mt-1 font-medium text-amber-800">parththukral16@gmail.com</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify users of significant changes through the app or via the email address associated with your account. Continued use of Jyot after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">8. Children's Privacy</h2>
            <p>Jyot is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information. If you believe a child under 13 has provided us with personal data, please contact us immediately.</p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-amber-200">
          <Link to="/" className="w-full inline-block text-center py-3 rounded-xl bg-stone-950 text-amber-50 font-medium text-sm hover:bg-stone-800 transition-colors">
            Return to Jyot
          </Link>
        </div>
      </div>
    </div>
  );
}
