import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  Download,
  ExternalLink,
  Github,
  HelpCircle,
  Package,
  Server,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';

const quickFacts = [
  'Works for macOS and Windows',
  'Offers two token paths: BYOK and ClawLite Tokens',
  'Designed to reduce setup friction before activation',
  'Manual install options remain available for advanced users',
];

const setupSteps = [
  {
    title: 'Download the installer',
    body: 'Start with the ClawLite installer if you want the simplest path to an OpenClaw-based setup.',
  },
  {
    title: 'Log in',
    body: 'Your login connects the installer path, account state, token choice, and activation flow.',
  },
  {
    title: 'Choose BYOK or ClawLite Tokens',
    body: 'Choose the token path that best matches your experience level, setup preference, and budget.',
  },
  {
    title: 'Finish activation and first run',
    body: 'Complete the remaining setup steps and reach your first successful run with less friction than a fully manual path.',
  },
];

const bestFor = [
  'Users who want the easiest way to start with OpenClaw',
  'Users who want less setup confusion',
  'Users choosing between BYOK and a simpler token path',
  'Users who want a faster route to activation',
  'Users on macOS or Windows who want a guided setup path',
];

const lessIdealFor = [
  'Users who want full manual control from the beginning',
  'Users who prefer source-only installation',
  'Advanced operators who want to configure every installation step themselves',
];

const pathChoices = [
  {
    title: 'Bring Your Own API Key (BYOK)',
    description:
      'Best for users who already have API keys, already know which provider or model stack they want, and want more control over usage and provider choice.',
    bullets: ['More control', 'Use your own provider keys', 'Better for advanced users', 'More setup decisions'],
  },
  {
    title: 'ClawLite Tokens',
    description:
      'Best for users who want the simplest setup path, fewer setup decisions, and a faster route to activation.',
    bullets: ['Faster to start', 'Fewer setup decisions', 'Simpler activation path', 'Often easier for first-time users'],
  },
];

const blockers = [
  {
    title: 'Login confusion',
    body: 'Some users expect downloading and activation to be the same step. In practice, login is what unlocks the correct setup path.',
  },
  {
    title: 'Token path uncertainty',
    body: 'A common setup blocker is not knowing whether to choose BYOK or ClawLite Tokens.',
  },
  {
    title: 'Downloaded but not activated',
    body: 'Getting the installer is not the same as completing setup. Many users drop off in between.',
  },
  {
    title: 'Manual setup becomes a side project',
    body: 'A setup flow that should take minutes can become hours of debugging if the path is too manual.',
  },
];

const faqs = [
  {
    question: 'What is ClawLite setup?',
    answer:
      'ClawLite setup is the guided path for installing and activating an OpenClaw-based environment with less friction than a fully manual setup.',
  },
  {
    question: 'What is the easiest way to install OpenClaw?',
    answer:
      'For most users, the easiest way to install OpenClaw is to use the ClawLite installer instead of a manual setup path.',
  },
  {
    question: 'Is ClawLite the same as OpenClaw?',
    answer:
      'No. OpenClaw is the underlying system, while ClawLite is the easier installation and activation path around it.',
  },
  {
    question: 'Do I need my own API key to use ClawLite?',
    answer:
      'Not always. You can choose BYOK if you already have your own API keys, or choose ClawLite Tokens for a simpler setup path.',
  },
  {
    question: 'Should I choose BYOK or ClawLite Tokens?',
    answer:
      'If you already know your preferred provider and want full control, choose BYOK. If you want a simpler and faster setup path, choose ClawLite Tokens.',
  },
  {
    question: 'How long does setup usually take?',
    answer:
      'The ClawLite installer path is designed to help users finish setup much faster than a manual OpenClaw installation.',
  },
  {
    question: 'What operating systems does ClawLite support?',
    answer: 'ClawLite currently focuses on supported setup paths for macOS and Windows.',
  },
  {
    question: 'Can I still install OpenClaw manually?',
    answer: 'Yes. Manual install options are still available through NPM, Docker, and source installation.',
  },
  {
    question: 'What is the difference between ClawLite installer and manual OpenClaw setup?',
    answer:
      'The ClawLite installer is easier and more guided. Manual OpenClaw setup gives more control, but usually requires more troubleshooting and more setup responsibility.',
  },
  {
    question: 'What should I do if I get stuck during setup?',
    answer: 'If you do not want to troubleshoot setup alone, use Remote Implementation for more direct help.',
  },
];

const manualOptions = [
  {
    title: 'Install with NPM',
    href: 'https://www.npmjs.com/search?q=openclaw',
    icon: Package,
  },
  {
    title: 'Install with Docker',
    href: 'https://hub.docker.com/search?q=openclaw',
    icon: Server,
  },
  {
    title: 'Install from source',
    href: 'https://github.com/X-RayLuan/OpenClaw',
    icon: Github,
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_32%,#f8fafc_100%)] text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">OpenClaw setup guide</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            How to Install OpenClaw with ClawLite
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600 md:text-xl">
            <strong>ClawLite is an easier installation and activation layer for OpenClaw.</strong> This page explains the
            fastest way to install OpenClaw with ClawLite, choose between BYOK and ClawLite Tokens, and reduce setup
            friction before your first successful run.
          </p>
          <p className="mt-4 text-sm font-medium text-gray-500">Last updated: March 2026</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="w-full px-8 py-6 text-lg sm:w-auto" asChild>
              <Link href="/downloads">
                <Download className="mr-2 h-5 w-5" />
                Download Installer
              </Link>
            </Button>
            <Button size="lg" variant="secondary" className="w-full px-8 py-6 text-lg sm:w-auto" asChild>
              <Link href="/remote-implementation">
                <Wrench className="mr-2 h-5 w-5" />
                Need Setup Help?
              </Link>
            </Button>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 text-left md:grid-cols-4">
            {quickFacts.map((fact) => (
              <div key={fact} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm leading-6 text-gray-700">{fact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Entity definition</p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 md:text-3xl">What is ClawLite setup?</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-base leading-7 text-gray-600">
                ClawLite setup is the guided installation and activation path for people who want to use OpenClaw without
                handling every setup step manually.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-base leading-7 text-gray-600">
                For most users, ClawLite setup means downloading the installer, logging in, choosing BYOK or ClawLite
                Tokens, and reaching a working OpenClaw-based environment faster.
              </p>
            </div>
          </div>

          <p className="mt-6 text-base leading-7 text-gray-600">
            ClawLite is not the same product as OpenClaw itself. Instead, ClawLite is the easier path around OpenClaw
            for users who want less setup friction, faster activation, and a clearer route to first value.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">What is the easiest way to install OpenClaw?</h2>
          <p className="mt-4 text-base leading-7 text-gray-600 md:text-lg">
            For most users, the easiest way to install OpenClaw is to start with the <strong>ClawLite installer</strong>{' '}
            instead of a manual OpenClaw setup.
          </p>
          <p className="mt-4 text-base leading-7 text-gray-600">
            The installer path is easier because it combines installer access, login flow, token path choice, and
            activation guidance into one setup path. A manual OpenClaw installation may still be the right fit for
            advanced users, but for most people the installer path is faster, simpler, and easier to finish successfully.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">Who should use ClawLite setup?</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Best for</h3>
              <ul className="mt-4 space-y-3 text-base text-gray-700">
                {bestFor.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-5 w-5 text-blue-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Less ideal for</h3>
              <ul className="mt-4 space-y-3 text-base text-gray-700">
                {lessIdealFor.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <HelpCircle className="mt-0.5 h-5 w-5 text-gray-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Step by step</p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 md:text-3xl">How ClawLite setup works</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {setupSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Step {index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Choose your path</p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 md:text-3xl">BYOK vs ClawLite Tokens</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {pathChoices.map((choice) => (
              <div key={choice.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">{choice.title}</h3>
                <p className="mt-3 text-base leading-7 text-gray-600">{choice.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  {choice.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900 md:text-base">
            <strong>Recommended default:</strong> If you are not sure which token path to choose, start with ClawLite
            Tokens. They are the simpler option for most new users.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">ClawLite installer vs manual OpenClaw setup</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full text-left text-sm md:text-base">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="px-4 py-4 font-semibold">Setup path</th>
                  <th className="px-4 py-4 font-semibold">Best for</th>
                  <th className="px-4 py-4 font-semibold">Speed</th>
                  <th className="px-4 py-4 font-semibold">Complexity</th>
                  <th className="px-4 py-4 font-semibold">Token choice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                <tr>
                  <td className="px-4 py-4 font-medium text-gray-900">ClawLite installer</td>
                  <td className="px-4 py-4">Most users</td>
                  <td className="px-4 py-4">Faster</td>
                  <td className="px-4 py-4">Lower</td>
                  <td className="px-4 py-4">BYOK or ClawLite Tokens</td>
                </tr>
                <tr>
                  <td className="px-4 py-4 font-medium text-gray-900">Manual OpenClaw setup</td>
                  <td className="px-4 py-4">Advanced users</td>
                  <td className="px-4 py-4">Slower</td>
                  <td className="px-4 py-4">Higher</td>
                  <td className="px-4 py-4">Self-managed</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-base leading-7 text-gray-600">
            The ClawLite installer is designed to reduce setup friction before activation. Manual OpenClaw setup gives
            more control, but usually requires more time, more decisions, and more troubleshooting.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">Common setup blockers</h2>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Many users do not struggle because OpenClaw is uninteresting. They struggle because setup friction appears
            before first value.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {blockers.map((blocker) => (
              <div key={blocker.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">{blocker.title}</h3>
                <p className="mt-3 text-base leading-7 text-gray-600">{blocker.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-base leading-7 text-gray-600">
            ClawLite is designed to reduce these blockers before they stop activation.
          </p>
        </div>
      </section>

      <section id="manual-install" className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Advanced path</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900 md:text-3xl">Manual install options</h2>
            <p className="mt-3 text-base text-gray-600 md:text-lg">
              Users who want more control can still choose manual setup options. Manual setup remains available, but for
              most users the ClawLite installer is the simpler path.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {manualOptions.map((option) => {
              const Icon = option.icon;
              return (
                <a
                  key={option.title}
                  href={option.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-gray-200 bg-gray-50 p-6 transition hover:border-gray-300 hover:bg-white"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-700 shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{option.title}</h3>
                  <div className="mt-3 inline-flex items-center text-sm font-medium text-blue-600">
                    Open option
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl rounded-3xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm md:p-10">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Need help?</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900 md:text-3xl">What if I do not want to do setup myself?</h2>
              <p className="mt-3 text-base leading-7 text-gray-700">
                If you do not want to manage setup alone, use <strong>Remote Implementation</strong> instead of forcing a
                fully DIY path. It is the better option for users who want less setup work, more hands-on help, and
                faster activation without solo troubleshooting.
              </p>
            </div>
            <div className="flex md:justify-end">
              <Button size="lg" className="w-full md:w-auto" asChild>
                <Link href="/remote-implementation">
                  See Remote Implementation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">FAQ</p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 md:text-3xl">OpenClaw setup FAQ</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-3 text-base leading-7 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-gray-900 px-6 py-12 text-center text-white shadow-xl md:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
            <Wrench className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-semibold md:text-4xl">Ready to install OpenClaw with less setup friction?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 md:text-lg">
            Use the ClawLite installer to choose the easier setup path, reduce activation drop-off, and get to your
            first successful run faster.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="w-full bg-white px-8 py-6 text-lg text-gray-900 hover:bg-gray-100 sm:w-auto" asChild>
              <Link href="/downloads">
                <Download className="mr-2 h-5 w-5" />
                Download Installer
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full border border-white/30 bg-transparent px-8 py-6 text-lg text-white hover:bg-white/10 hover:text-white sm:w-auto"
              asChild
            >
              <Link href="/remote-implementation">Get Setup Help</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
            <Link href="/downloads" className="hover:text-white">
              Downloads
            </Link>
            <Link href="/login" className="hover:text-white">
              Login
            </Link>
            <Link href="/pricing" className="hover:text-white">
              Pricing
            </Link>
            <Link href="/troubleshoot" className="hover:text-white">
              Troubleshoot
            </Link>
            <Link href="/docs" className="hover:text-white">
              Docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
