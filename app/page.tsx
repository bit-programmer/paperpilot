import Link from "next/link";
import { clientPaths } from "./utils/path.client";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="flex items-center justify-between px-6 py-4 lg:px-8 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            P
          </div>
          <span className="font-bold text-xl tracking-tight">PaperPilot</span>
        </div>
        <div className="flex gap-4">
          <Link 
            href={clientPaths.signin.getHref()} 
            className="text-sm font-semibold hover:text-primary transition-colors flex items-center justify-center px-4 py-2"
          >
            Sign in
          </Link>
          <Link 
            href={clientPaths.signup.getHref()} 
            className="text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl mb-6 text-foreground">
          Your Intelligent Workspace for Teams
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          PaperPilot helps organizations manage teams, collaborate effortlessly, and scale operations with a single cohesive platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href={clientPaths.signup.getHref()} 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            Get Started Free
          </Link>
          <Link 
            href={clientPaths.signin.getHref()} 
            className="bg-muted text-foreground hover:bg-muted/80 px-8 py-3 rounded-md font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
