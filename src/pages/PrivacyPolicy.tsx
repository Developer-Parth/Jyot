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
              <li>Password (stored as a secured, hashed value — never in plaintext)</li>
              <li>Spiritual preferences (primary deity, gotra)</li>
              <li>Palm images uploaded for AI palm reading</li>
              <li>Jaap progress and usage analytics</li>
              <li>Wish titles, descriptions, and video recordings (stored locally on your device)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">2. Purpose of Collection</h2>
            <p className="mb-2">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>User authentication and account management</li>
              <li>User personalization (city-based Panchang, deity preferences)</li>
              <li>AI palm reading generation</li>
              <li>Panchang and spiritual guidance features</li>
              <li>Tracking jaap progress and streaks</li>
              <li>Private wish vault — wishes are stored for your eyes only</li>
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
            <h2 className="text-lg font-serif text-stone-900 mb-2">4. Wishes Privacy</h2>
            <p className="mb-2">The Wish Vault feature is designed with your privacy as a core principle:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Wishes are completely private.</strong> No other user can view, search, or access your wishes.</li>
              <li><strong>Wish metadata</strong> (titles, descriptions, dates) is stored on our server but is only accessible to you when authenticated.</li>
              <li><strong>Wish video recordings</strong> are stored locally in your browser's IndexedDB storage. They are never uploaded to our servers.</li>
              <li>There is no social feed, public sharing, or community discovery for wishes.</li>
              <li>When you delete a wish, all associated data — including locally stored video — is permanently removed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">5. Data Storage</h2>
            <p className="mb-2">Your data is stored in the following ways:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Server storage:</strong> User profiles, jaap progress, palm reading results, and wish metadata are stored on our server (hosted on Vercel). Palm reading data persists in ephemeral storage for the duration of a serverless function instance.</li>
              <li><strong>Local storage:</strong> Wish video recordings are stored locally in your browser's IndexedDB. Some preferences and session data are stored in browser localStorage.</li>
              <li><strong>Password storage:</strong> Passwords are never stored in plaintext. They are hashed using bcrypt with a high work factor (12 salt rounds) before storage.</li>
              <li><strong>Retention:</strong> We retain your account data for as long as your account remains active. You may delete your account at any time from the Profile page.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">6. Account Deletion</h2>
            <p className="mb-2">You have the right to permanently delete your account and all associated data at any time.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>How to delete:</strong> Go to Profile → Delete Account. Type "DELETE" to confirm permanent deletion.</li>
              <li><strong>What gets deleted:</strong> Your profile, authentication credentials, jaap history, palm reading history, wish metadata, subscription records, and any other user-related data.</li>
              <li><strong>What remains:</strong> Wish video recordings stored locally in your browser's IndexedDB may persist until you clear your browser data.</li>
              <li><strong>Irreversibility:</strong> Account deletion is permanent and cannot be undone. Download any data you wish to keep before deleting.</li>
              <li><strong>Processing:</strong> Deletion is processed immediately upon confirmation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">7. Security</h2>
            <p className="mb-2">We implement reasonable security measures to protect your information, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Passwords hashed with bcrypt (12 salt rounds) — never stored in plaintext.</li>
              <li>API keys stored exclusively in server-side environment variables, never in client-side code.</li>
              <li>HTTPS encryption for all data transmitted between your device and our servers.</li>
              <li>No exposure of sensitive credentials in the frontend bundle or APK.</li>
              <li>Rate limiting on authentication and palm reading endpoints to prevent abuse.</li>
              <li>Input validation and sanitization on all API endpoints to prevent injection attacks.</li>
            </ul>
            <p className="mt-2">However, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security of your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">8. Your Rights</h2>
            <p className="mb-2">As a user of Jyot, you have the following rights regarding your data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Right to access:</strong> You can view your profile data at any time from the Profile page.</li>
              <li><strong>Right to rectification:</strong> You can update your profile information from the Profile page.</li>
              <li><strong>Right to deletion:</strong> You can permanently delete your account and all associated data from Profile → Delete Account.</li>
              <li><strong>Right to data portability:</strong> Contact us to request an export of your data.</li>
              <li><strong>Right to withdraw consent:</strong> You may stop using the app at any time. Your data is retained only while your account is active.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">9. Feedback & Suggestions</h2>
            <p className="mb-2">We welcome feedback, ideas, bug reports, and feature requests.</p>
            <p>You may contact us at:</p>
            <p className="mt-1 font-medium text-amber-800">parththukral16@gmail.com</p>
            <p className="mt-2 text-xs text-stone-500">We review all submissions but may not be able to respond individually to every message.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">10. Contact</h2>
            <p>If you have questions about this Privacy Policy, wish to exercise your data rights, or need support, please contact us at:</p>
            <p className="mt-1 font-medium text-amber-800">parththukral16@gmail.com</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify users of significant changes through the app or via the email address associated with your account. Continued use of Jyot after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">12. Children's Privacy</h2>
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
