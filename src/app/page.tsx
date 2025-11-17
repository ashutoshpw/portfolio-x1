import { EmailSignup } from "@/components/EmailSignup";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-12 px-6 py-16 sm:px-8">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Ashutosh Kumar
            </h1>
            <p className="text-xl text-foreground/80 sm:text-2xl">
              Full Stack Developer
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center border border-foreground/20 bg-background px-4 py-2 font-mono text-sm text-foreground/80">
              10+ years of experience
            </span>
          </div>

          <p className="max-w-2xl text-lg leading-8 text-foreground/70 sm:text-xl">
            Building scalable web applications and digital experiences.
            Portfolio coming soon.
          </p>
        </div>

        <div className="w-full">
          <EmailSignup />
        </div>
      </main>
    </div>
  );
}
