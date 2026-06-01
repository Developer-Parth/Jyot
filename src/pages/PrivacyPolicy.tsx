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
        <p className="text-xs text-stone-500 mb-6">Last updated: June 2026</p>

        <div className="space-y-6 text-sm text-stone-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">1. Information We Collect</h2>
            <p className="mb-2">When you create an account and use Jyot, we collect the following information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name</li>
              <li>Mobile number</li>
              <li>Birth date</li>
              <li>City</li>
              <li>Password (stored as a secured, hashed value — never in plaintext)</li>
              <li>Spiritual preferences (primary deity, gotra, reminder time)</li>
              <li>Palm images uploaded for AI palm reading</li>
              <li>Jaap progress, streaks, and usage analytics</li>
              <li>Wish titles, descriptions, and dates</li>
              <li>Subscription and billing information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>User authentication and account management</li>
              <li>Personalization (city-based Panchang, deity-based recommendations, reminders)</li>
              <li>AI palm reading generation via Google Gemini</li>
              <li>Tracking jaap progress, streaks, and spiritual goals</li>
              <li>Private wish vault — wishes are stored for your eyes only</li>
              <li>Subscription management and payment processing</li>
              <li>Improving app functionality and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">3. AI Processing Disclosure</h2>
            <p className="mb-2">Jyot uses third-party AI providers (Google Gemini) to process palm images and generate palm reading results.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Palm images are sent to Google Gemini for analysis.</li>
              <li>Images are used solely for generating palm reading results and are not stored permanently on our servers.</li>
              <li>We do not sell, rent, or share palm images with third parties for marketing or advertising.</li>
              <li>Reading results (text only) are saved to your account for future reference.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">4. Wish Videos & Local Storage</h2>
            <p className="mb-2">The Wish Vault allows you to record personal video messages accompanying your wishes.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Wish metadata</strong> (titles, descriptions, dates) is stored on our servers and is only accessible to you when authenticated.</li>
              <li><strong>Wish video recordings are stored locally on your device</strong> in your browser or app's local storage (IndexedDB). They are not uploaded to our servers.</li>
              <li className="text-amber-800 font-medium">⚠️ Because videos are stored locally, they may be lost if you clear your browser data, uninstall the app, switch devices, use a different browser profile, or reset your device. Jyot cannot recover locally stored videos.</li>
              <li>There is no social feed, public sharing, or community discovery for wishes. They are completely private to you.</li>
              <li>When you delete a wish, the associated metadata is removed from our servers. Locally stored video may persist until you clear your device storage or browser data.</li>
            </ul>
            <p className="mt-2 text-xs text-stone-500">Note: If cloud video storage is added in the future, this policy will be updated and you will be notified accordingly.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">5. Data Storage & Security</h2>
            <p className="mb-2">Your data is stored as follows:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Server storage:</strong> User profiles, jaap progress, palm reading results, wish metadata, and subscription records are stored in a managed PostgreSQL database (Supabase).</li>
              <li><strong>Local storage:</strong> Wish video recordings are stored locally on your device. Some preferences (language, onboarding status) are stored in browser localStorage.</li>
              <li><strong>Password storage:</strong> Passwords are hashed using bcrypt (12 salt rounds) before storage. We never store plaintext passwords.</li>
              <li><strong>Retention:</strong> We retain your account data for as long as your account remains active. You may delete your account at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">6. Account Deletion</h2>
            <p className="mb-2">You have the right to permanently delete your account and all associated data at any time.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>How to delete:</strong> Go to Profile → Delete Account. Type "DELETE" to confirm permanent deletion.</li>
              <li><strong>What gets deleted:</strong> Your profile, authentication credentials, jaap history, palm reading history, wish metadata, subscription records, and all other user-related data.</li>
              <li><strong>What remains:</strong> Wish video recordings stored locally on your device are not affected by server-side account deletion. You must clear them manually through your device or browser settings.</li>
              <li><strong>Irreversibility:</strong> Account deletion is permanent and cannot be undone.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">7. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Right to access:</strong> View your profile data at any time from the Profile page.</li>
              <li><strong>Right to rectification:</strong> Update your profile information from the Profile page.</li>
              <li><strong>Right to deletion:</strong> Permanently delete your account from Profile → Delete Account.</li>
              <li><strong>Right to data portability:</strong> Contact us to request an export of your data.</li>
              <li><strong>Right to withdraw consent:</strong> You may stop using the app at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. If cloud video storage, new AI processing features, or other material changes are introduced, we will update this page and notify users through the app or via email. Continued use of Jyot after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">9. Contact</h2>
            <p>If you have questions about this Privacy Policy, wish to exercise your data rights, or need support, please contact us at:</p>
            <p className="mt-1 font-medium text-amber-800">parththukral16@gmail.com</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-stone-900 mb-2">10. Children's Privacy</h2>
            <p>Jyot is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.</p>
          </section>

        </div>

        <div className="mt-8 pt-6 border-t border-amber-200 space-y-3">
          <Link to="/terms" className="w-full inline-block text-center py-3 rounded-xl border border-amber-200 text-stone-700 font-medium text-sm hover:bg-amber-50 transition-colors">
            View Terms &amp; Conditions
          </Link>
          <Link to="/" className="w-full inline-block text-center py-3 rounded-xl bg-stone-950 text-amber-50 font-medium text-sm hover:bg-stone-800 transition-colors">
            Return to Jyot
          </Link>
        </div>
      </div>
    </div>
  );
}
