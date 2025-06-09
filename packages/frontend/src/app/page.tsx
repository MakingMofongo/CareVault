import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Users, FileText, Brain, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <Shield className="h-8 w-8 text-primary" />
          <span className="ml-2 text-2xl font-bold gradient-text">CareVault</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:text-primary transition-colors"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:text-primary transition-colors"
            href="#how-it-works"
          >
            How it Works
          </Link>
          <Link
            className="text-sm font-medium hover:text-primary transition-colors"
            href="#contact"
          >
            Contact
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Streamline Your Clinical Workflow with{' '}
                <span className="gradient-text">AI-Powered</span> Intelligence
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 dark:text-gray-400 md:text-xl">
                CareVault brings patient data, AI decision support, and shareable digital
                artifacts together in one secure platform. Transform how you prescribe,
                share, and manage patient care.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg" className="animate-fade-in">
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="animate-fade-in">
                <Link href="#demo">Watch Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
            Features that Transform Healthcare
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Brain className="h-10 w-10 text-primary" />}
              title="AI-Powered Safety Checks"
              description="Real-time drug interaction analysis powered by RxNav and GPT-4, ensuring safe prescriptions every time."
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-primary" />}
              title="Instant Digital Prescriptions"
              description="Generate secure, shareable prescriptions with QR codes and PDFs in seconds."
            />
            <FeatureCard
              icon={<Lock className="h-10 w-10 text-primary" />}
              title="Patient-Controlled Privacy"
              description="Patients can instantly revoke access to shared prescriptions, maintaining complete control."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-primary" />}
              title="Seamless Collaboration"
              description="Pharmacies and specialists can verify prescriptions instantly without creating accounts."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-primary" />}
              title="Lightning Fast"
              description="Built for speed with local-first architecture and intelligent caching."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-primary" />}
              title="Secure by Design"
              description="End-to-end encryption and audit trails ensure HIPAA compliance."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900"
      >
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
            How CareVault Works
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <StepCard
              step="1"
              title="Doctor Creates Prescription"
              description="Select medications with auto-complete and dosage recommendations"
            />
            <StepCard
              step="2"
              title="AI Reviews Safety"
              description="Instant analysis of drug interactions and patient allergies"
            />
            <StepCard
              step="3"
              title="Generate Secure QR"
              description="Create shareable QR code and PDF prescription"
            />
            <StepCard
              step="4"
              title="Patient Controls Access"
              description="Share with pharmacy or revoke access anytime"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Practice?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-600 dark:text-gray-400 md:text-xl">
                Join the future of healthcare with CareVault. Start your journey today.
              </p>
            </div>
            <Button asChild size="lg" className="animate-scale-in">
              <Link href="/login">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">CareVault POC</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 CareVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
        {step}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}