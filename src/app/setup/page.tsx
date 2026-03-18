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
  'Best for people who want the easiest way to install OpenClaw and reach first value faster.',
  'Typical setup path: download installer → login → choose token path → finish activation.',
  'ClawLite reduces setup friction with one-click install, cheaper token options, and faster activation guidance.',
];

const setupSteps = [
  {
    title: 'Download the installer',
    body: 'Start with the ClawLite installer instead of manual OpenClaw setup if you want the fastest path to a working environment.',
  },
  {
    title: 'Log in to unlock your setup path',
    body: 'Login unlocks downloads, coupon access, and guided setup so your install flow is tied to the right account state.',
  },
  {
    title: 'Choose your token path',
    body: 'Pick BYOK if you already have API keys, or use the ClawLite token coupon path if you want a cheaper and simpler start.',
  },
  {
    title: 'Finish activation and first run',
    body: 'Complete the remaining setup steps, confirm your configuration, and reach your first successful run faster.',
  },
];

const prerequisites = [
  'A supported macOS or Windows machine',
  'An email login for your ClawLite account',
  'A token path decision: BYOK or ClawLite Tokens',
  'Roughly 5–15 minutes for the guided setup path',
];

const pathChoices = [
  {
    title: 'Bring Your Own API Key (BYOK)',
    description:
      'Best if you already know which provider you want and prefer to manage your own usage directly.',
  },
  {
    title: 'ClawLite Tokens',
    description:
      'Best if you want a cheaper starting path, less setup confusion, and a faster route from signup to activation.',
  },
];

const blockers = [
  {
    title: 'Login confusion',
    body: 'Users often expect download and activation to be the same step. In practice, login is what unlocks the correct installer, coupon, and post-download path.',
  },
  {
    title: 'Token path uncertainty',
    body: 'A lot of setup friction comes from not knowing whether to use BYOK or the ClawLite coupon path. This page should make that choice obvious.',
  },
  {
    title: 'Installer expectations',
    body: 'Users need a plain-language explanation of what the installer does, what it does not do, and what success should look like after setup.',
  },
  {
    title: 'Activation drop-off',
    body: 'Most friction happens after signup but before first value. The setup page should focus on reducing that gap, not just on download clicks.',
  },
];

const faqs = [
  {
    question: 'What is the easiest way to install ClawLite?',
    answer:
      'For most users, the easiest path is to use the ClawLite installer, log in, choose your token path, and complete the guided activation flow.',
  },
  {
    question: 'Is ClawLite the same as OpenClaw?',
    answer:
      'No. ClawLite is the easier install and activation path around OpenClaw, designed to reduce setup friction and help users reach first value faster.',
  },
  {
    question: 'Do I need my own API key?',
    answer:
      'Not always. You can choose BYOK if you already have your own API key, or use the ClawLite token path if you want a simpler and often cheaper starting option.',
  },
  {
    question: 'How long does setup usually take?',
    answer:
      'The guided installer path is intended to get most users through setup much faster than a manual OpenClaw installation, typically in a short session instead of a long troubleshooting cycle.',
  },
  {
    question: 'What operating systems are supported?',
    answer:
      'ClawLite currently focuses on the installer path for macOS and Windows. If you want more control, manual install options are also available.',
  },
  {
    question: 'What if I do not want to do setup myself?',
    answer:
      'If you want a faster done-with-you path, use Remote Implementation instead of forcing a DIY setup that may stall before activation.',
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

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_32%,#f8fafc_100%)] text-gray-900">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Setup guide</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            The easiest way to set up ClawLite and OpenClaw faster
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600 md:text-xl">
            ClawLite setup is the fastest guided path for people who want easier OpenClaw installation,
            cheaper token options, faster activation, and less setup friction before the first successful run.
          </p>

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

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 text-left md:grid-cols-3">
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Quick answer</p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 md:text-3xl">What setup includes</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900">What ClawLite setup is</h3>
              <p className="mt-3 text-base leading-7 text-gray-600">
                ClawLite setup is the guided path that helps users go from interest to a working OpenClaw-based
                environment faster, with a clearer install path, a token choice, and a shorter route to first value.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Who this page is for</h3>
              <p className="mt-3 text-base leading-7 text-gray-600">
                This page is best for people who want the easiest install path, want to understand BYOK versus coupon
                setup, and want fewer blockers between signup and activation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">What you need before setup</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {prerequisites.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <BadgeCheck className="mt-0.5 h-5 w-5 text-blue-600" />
                <p className="text-base text-gray-700">{item}</p>
              </div>
            ))}
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
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 md:text-3xl">BYOK or ClawLite Tokens?</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {pathChoices.map((choice) => (
              <div key={choice.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">{choice.title}</h3>
                <p className="mt-3 text-base leading-7 text-gray-600">{choice.description}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-gray-500 md:text-base">
            If you want pricing details or coupon logic, continue to the pricing and downloads path after login.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">Common setup blockers</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {blockers.map((blocker) => (
              <div key={blocker.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">{blocker.title}</h3>
                <p className="mt-3 text-base leading-7 text-gray-600">{blocker.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="manual-install" className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Advanced path</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900 md:text-3xl">Manual install options</h2>
            <p className="mt-3 text-base text-gray-600 md:text-lg">
              If you want more control and more setup responsibility, you can still install manually. The installer is the
              best option for most users, but manual paths remain available for advanced use cases.
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
              <h2 className="mt-2 text-2xl font-semibold text-gray-900 md:text-3xl">Use Remote Implementation if you want less setup work</h2>
              <p className="mt-3 text-base leading-7 text-gray-700">
                If you do not want to manage setup yourself, Remote Implementation is the better path. It is designed for
                people who want faster activation without turning installation into a side project.
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
              <h2 className="mt-1 text-2xl font-semibold text-gray-900 md:text-3xl">Setup FAQ</h2>
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

          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm leading-7 text-gray-500">
            Last updated: March 2026. This page is intended to explain the ClawLite setup path clearly enough for users,
            search engines, and AI answer systems to understand how installation, activation, token choice, and setup
            help fit together.
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-gray-900 px-6 py-12 text-center text-white shadow-xl md:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
            <Wrench className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-semibold md:text-4xl">Ready to start setup?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 md:text-lg">
            Choose the faster setup path, reduce activation friction, and get to your first real ClawLite result sooner.
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
        </div>
      </section>
    </main>
  );
}
