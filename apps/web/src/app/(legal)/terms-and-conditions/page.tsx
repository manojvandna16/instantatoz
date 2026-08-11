import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Instantatoz',
  description:
    'Read the complete Terms and Conditions governing your use of the Instantatoz on-demand workforce marketplace platform.',
};

const LAST_UPDATED = '10 August 2026';

export default function TermsAndConditionsPage() {
  return (
    <div className="px-6 sm:px-10 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Legal Document
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
        <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Legal counsel notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Legal Notice:</span> This document is for informational
          purposes. We strongly recommend that all Users and Workers review these Terms with
          qualified legal counsel before using the Platform. These Terms constitute a legally
          binding agreement.
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        {/* 1. Definitions */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Definitions</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            For the purposes of these Terms and Conditions, the following terms shall have the
            meanings ascribed to them below:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-none pl-0">
            <li><span className="font-semibold">&quot;Platform&quot;</span> means the Instantatoz mobile application, website ({siteConfig.url}), and all associated services, features, and technology offered by the Company.</li>
            <li><span className="font-semibold">&quot;Company&quot; / &quot;We&quot; / &quot;Us&quot;</span> means the entity operating the Instantatoz Platform.</li>
            <li><span className="font-semibold">&quot;User&quot; / &quot;Customer&quot;</span> means any individual or entity that accesses the Platform to post job requests and hire Workers.</li>
            <li><span className="font-semibold">&quot;Worker&quot; / &quot;Service Provider&quot;</span> means any verified individual who registers on the Platform to offer services and accept job requests.</li>
            <li><span className="font-semibold">&quot;Job&quot;</span> means a time-bound, task-specific engagement posted by a User and accepted by a Worker through the Platform.</li>
            <li><span className="font-semibold">&quot;OTP Work Start&quot;</span> means the One-Time Password based confirmation mechanism used to formally record the commencement of a Job at the work site.</li>
            <li><span className="font-semibold">&quot;Commission&quot;</span> means the platform service fee deducted by the Company from the total amount payable for each completed Job.</li>
            <li><span className="font-semibold">&quot;Account&quot;</span> means the registered profile of a User or Worker on the Platform.</li>
            <li><span className="font-semibold">&quot;Services&quot;</span> means the technology intermediary services offered by the Platform to facilitate matching between Users and Workers.</li>
            <li><span className="font-semibold">&quot;Applicable Law&quot;</span> means all laws, regulations, notifications, and orders applicable in India, including the Information Technology Act, 2000.</li>
          </ul>
        </section>

        {/* 2. Nature of Platform */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Nature of the Platform — Intermediary Status</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Instantatoz is a <span className="font-semibold">technology marketplace and intermediary platform</span>{' '}
            as defined under the Information Technology Act, 2000 and the Information Technology
            (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. The Company does
            not employ Workers, and the relationship between a User and a Worker is that of an
            independent contractor, not employer-employee.
          </p>
          <p className="text-gray-700 leading-relaxed mb-3">
            The Company does not control, direct, supervise, or manage the manner in which Workers
            perform their services. Workers are solely responsible for the quality, timeliness, and
            legality of the services they render. Instantatoz facilitates the discovery,
            communication, scheduling, and payment between Users and Workers but is not a party to
            the underlying service agreement between them.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Nothing in these Terms shall be construed to create any partnership, joint venture,
            agency, or employment relationship between the Company and any Worker or User.
          </p>
        </section>

        {/* 3. Eligibility */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Eligibility</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            To access and use the Platform, you must:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Be at least 18 years of age.</li>
            <li>Be a citizen or legal resident of India, or a legally authorised entity incorporated in India.</li>
            <li>Possess the legal capacity to enter into a binding contract under the Indian Contract Act, 1872.</li>
            <li>Not be disqualified from receiving services under any Applicable Law.</li>
            <li>Provide accurate, truthful, and complete information during registration and at all times thereafter.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            By creating an Account, you represent and warrant that you meet all of the above
            eligibility requirements. The Company reserves the right to verify eligibility at any
            time and to suspend or terminate Accounts that do not meet these requirements.
          </p>
        </section>

        {/* 4. Account Registration */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Account Registration</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Registration on the Platform is done via a mobile number linked to a valid Indian SIM
            card, verified through an OTP-based authentication system (Firebase Authentication).
            You agree to:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Maintain the confidentiality of your Account credentials and OTPs.</li>
            <li>Accept full responsibility for all activities conducted under your Account.</li>
            <li>Notify the Company immediately at {siteConfig.supportEmail} of any unauthorised access or breach.</li>
            <li>Not create multiple Accounts for the same identity or purpose.</li>
            <li>Not transfer your Account to any third party.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            The Company will not be liable for any loss arising from your failure to maintain the
            security of your Account credentials.
          </p>
        </section>

        {/* 5. Job Posting */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Job Posting</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Users may post job requests on the Platform by specifying the category of work required,
            the estimated duration, the location, the date and time of engagement, and any relevant
            instructions. By posting a Job, the User:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Warrants that the Job description is accurate, lawful, and does not violate any Applicable Law or these Terms.</li>
            <li>Agrees to pay the applicable hourly rate and platform commission for services rendered.</li>
            <li>Acknowledges that job acceptance is subject to Worker availability and verification status.</li>
            <li>Agrees not to request Workers to perform services outside the scope of the posted Job without prior arrangement through the Platform.</li>
          </ul>
        </section>

        {/* 6. Matching */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Matching Process</h2>
          <p className="text-gray-700 leading-relaxed">
            The Platform uses a technology-based algorithm to match Job requests with available
            verified Workers based on proximity, skill category, availability, and platform ratings.
            The Company does not guarantee that a match will always be found. Matching is subject to
            real-time availability and is conducted on a best-effort basis. The Company does not
            make any representation regarding the specific skill levels, experience, or capabilities
            of any Worker beyond what is displayed on their profile.
          </p>
        </section>

        {/* 7. OTP Work Start */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. OTP-Based Work Start Mechanism</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The commencement of any Job shall be formally recorded only upon the User sharing a
            one-time password (OTP) with the Worker at the work site, and the Worker entering the
            same on the Platform. This OTP Work Start mechanism:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Serves as the official timestamp for the start of billable hours.</li>
            <li>Constitutes the User's confirmation of the Worker's physical presence at the work site.</li>
            <li>Cannot be reversed once entered. Users must not share the OTP if they are not satisfied with the Worker's arrival.</li>
            <li>The OTP for Work Start must not be shared via phone calls, messages, or any medium other than in person at the work site.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            Hourly billing begins from the moment the OTP Work Start is confirmed on the Platform.
          </p>
        </section>

        {/* 8. Hourly Billing */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Hourly Billing</h2>
          <p className="text-gray-700 leading-relaxed">
            Jobs on Instantatoz are billed on an hourly basis. The applicable hourly rate is
            determined by the service category and is displayed to the User before confirming a Job
            request. Time is tracked from OTP Work Start to the formal work-end confirmation. Any
            additional hours beyond the originally requested duration must be agreed upon by both
            parties and are subject to the same hourly rate and commission. The Company reserves
            the right to revise hourly rates from time to time upon reasonable notice.
          </p>
        </section>

        {/* 9. Payments */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Payments</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            All payments on the Platform are processed through integrated third-party payment
            gateways. By making a payment, you agree to:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>The applicable charges, platform commission, and any applicable taxes.</li>
            <li>The payment gateway's own terms and conditions.</li>
            <li>Not make any direct cash payments to Workers for services booked through the Platform.</li>
            <li>Not share OTPs, card numbers, CVVs, or any payment credentials with Workers or any third party.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            The Company is not a banking or financial institution. Payments are facilitated on
            behalf of the User and disbursed to Workers after deduction of the applicable platform
            commission.
          </p>
        </section>

        {/* 10. Platform Fees and Commission */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">10. Platform Fees and Commission</h2>
          <p className="text-gray-700 leading-relaxed">
            The Company charges a platform service commission on each completed Job. This commission
            is deducted from the total amount collected from the User before disbursement to the
            Worker. The applicable commission rate is displayed within the Platform and may vary by
            service category. The Company reserves the right to revise commission rates upon 30 days
            prior notice. Workers acknowledge and agree to the applicable commission structure at the
            time of registration.
          </p>
        </section>

        {/* 11. Cancellation */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">11. Cancellation</h2>
          <p className="text-gray-700 leading-relaxed">
            Cancellation of Jobs is governed by the Cancellation Policy available at{' '}
            <a href="/cancellation-policy" className="text-orange-600 hover:underline">
              /cancellation-policy
            </a>
            . In summary: cancellations made before Worker acceptance are generally eligible for
            a full refund. Cancellations after Worker acceptance or arrival may attract charges.
            Cancellations after OTP Work Start are generally non-refundable for hours already
            worked. Repeated cancellations by Users or Workers may result in account penalties.
          </p>
        </section>

        {/* 12. Refund */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">12. Refund Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            Refunds are subject to the Refund Policy available at{' '}
            <a href="/refund-policy" className="text-orange-600 hover:underline">
              /refund-policy
            </a>
            . Refunds are not guaranteed for Jobs that have commenced via OTP Work Start except in
            cases of verified disputes resolved in the User's favour.
          </p>
        </section>

        {/* 13. Dispute Resolution */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">13. Dispute Resolution</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            In the event of a dispute between a User and a Worker, the parties shall first attempt
            to resolve the dispute amicably by contacting Instantatoz support at{' '}
            {siteConfig.supportEmail}. The Company will endeavour to assist in dispute resolution
            on a best-effort basis, but is not obligated to adjudicate or guarantee any particular
            outcome.
          </p>
          <p className="text-gray-700 leading-relaxed">
            If a dispute cannot be resolved amicably, it shall be subject to arbitration under the
            Arbitration and Conciliation Act, 1996 of India, with the seat of arbitration in
            Bengaluru, Karnataka. The language of arbitration shall be English.
          </p>
        </section>

        {/* 14. Ratings */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">14. Ratings and Reviews</h2>
          <p className="text-gray-700 leading-relaxed">
            Upon completion of a Job, Users and Workers may rate and review each other. Ratings
            must be honest, fair, and based on the actual experience. Submitting false, malicious,
            or defamatory reviews is prohibited and may result in account suspension. The Company
            reserves the right to remove reviews that violate these guidelines. Ratings directly
            influence Worker visibility and eligibility for Jobs on the Platform.
          </p>
        </section>

        {/* 15. Prohibited Activities */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">15. Prohibited Activities</h2>
          <p className="text-gray-700 leading-relaxed mb-3">You agree not to:</p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>Use the Platform for any unlawful, fraudulent, or deceptive purpose.</li>
            <li>Harass, threaten, or discriminate against any User, Worker, or Company staff.</li>
            <li>Circumvent the Platform to transact directly with Workers you discovered through the Platform, thereby evading applicable platform commission.</li>
            <li>Post false, misleading, or defamatory job descriptions or reviews.</li>
            <li>Attempt to gain unauthorised access to the Platform or any related systems.</li>
            <li>Scrape, crawl, or extract data from the Platform without express written consent.</li>
            <li>Use the Platform to facilitate any illegal activity, including but not limited to human trafficking, child labour, or forced labour.</li>
            <li>Impersonate any person or entity or misrepresent your identity or affiliations.</li>
          </ul>
        </section>

        {/* 16. Account Suspension */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">16. Account Suspension and Termination</h2>
          <p className="text-gray-700 leading-relaxed">
            The Company reserves the right, in its sole discretion, to suspend, restrict, or
            permanently terminate any Account at any time and without prior notice, if it believes
            that the Account holder has violated these Terms, Applicable Law, or poses a risk to
            other Platform users or the Company. Suspended Users may contact{' '}
            {siteConfig.supportEmail} to appeal such decisions. The Company's decision on appeals
            shall be final.
          </p>
        </section>

        {/* 17. Intellectual Property */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">17. Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed">
            All content, trademarks, service marks, logos, trade names, and other intellectual
            property on the Platform are the exclusive property of the Company or its licensors.
            Nothing in these Terms grants you any right to use the Company's intellectual property
            without prior written permission. You may not reproduce, distribute, modify, or create
            derivative works from any content on the Platform.
          </p>
        </section>

        {/* 18. Limitation of Liability */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">18. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            To the maximum extent permitted by Applicable Law:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm leading-relaxed list-disc pl-6">
            <li>The Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.</li>
            <li>The Company's aggregate liability for any claim arising out of these Terms shall not exceed the amount you paid to the Platform in the three (3) months preceding the claim.</li>
            <li>The Company is not liable for the quality, safety, legality, or fitness for purpose of any services performed by Workers.</li>
            <li>The Company does not guarantee the availability, accuracy, or reliability of the Platform at all times.</li>
          </ul>
        </section>

        {/* 19. Governing Law */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">19. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms and Conditions are governed by and construed in accordance with the laws of
            India. The parties expressly agree that the courts and tribunals of Bengaluru,
            Karnataka, India shall have exclusive jurisdiction over any disputes arising from or
            relating to these Terms, subject to the arbitration clause in Section 13.
          </p>
        </section>

        {/* 20. Jurisdiction */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">20. Jurisdiction</h2>
          <p className="text-gray-700 leading-relaxed">
            For the avoidance of doubt, any legal proceedings not subject to arbitration shall be
            exclusively brought before the competent courts located in Bengaluru, Karnataka, India.
            Both parties consent to the exclusive jurisdiction of these courts and waive any
            objection based on venue or inconvenient forum.
          </p>
        </section>

        {/* 21. Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">21. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            For questions, concerns, or grievances related to these Terms and Conditions, please
            contact us at:
          </p>
          <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
            <p><span className="font-semibold">Platform:</span> {siteConfig.name}</p>
            <p><span className="font-semibold">Website:</span> {siteConfig.url}</p>
            <p>
              <span className="font-semibold">Email:</span>{' '}
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-orange-600 hover:underline">
                {siteConfig.supportEmail}
              </a>
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
