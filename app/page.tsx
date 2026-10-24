import Link from "next/link";
import Icon from "@/components/Icon";

export default function HomePage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link href="/" className="app-brand">
          <span className="brand-mark">s</span>
          <span>social</span>
        </Link>
        <nav>
          <Link href="/login" className="landing-signin">Sign in</Link>
          <Link href="/register" className="button button-primary">Join the network</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <span className="hero-spark" aria-hidden="true">✳</span>
          <h1>Your whole world,<br />in one <span>feed.</span></h1>
          <p>Friends, colleagues, and the ideas you share — all in a network that feels like yours.</p>
          <div className="landing-actions">
            <Link href="/register" className="button button-primary button-large">
              Create your account <Icon name="arrow" />
            </Link>
            <Link href="/login" className="landing-secondary">I already have an account</Link>
          </div>
          <div className="landing-proof"><span className="proof-dot" /> Your connections. Your updates. Your choice.</div>
        </div>

        <div className="landing-art" role="img" aria-label="Illustration of a connected social feed">
          <div className="art-orbit art-orbit-one" />
          <div className="art-orbit art-orbit-two" />
          <div className="art-node art-node-one"><Icon name="users" /></div>
          <div className="art-node art-node-two"><Icon name="briefcase" /></div>
          <div className="art-node art-node-three"><Icon name="heart" /></div>
          <div className="art-core"><span className="brand-mark">s</span><span>your network</span></div>
          <span className="art-dot art-dot-one" />
          <span className="art-dot art-dot-two" />
          <span className="art-dot art-dot-three" />
        </div>
      </section>

      <section className="landing-features">
        <article>
          <span className="feature-icon"><Icon name="users" /></span>
          <h2>Make room for every connection</h2>
          <p>Keep up with the people in your life and the people you work alongside.</p>
        </article>
        <article>
          <span className="feature-icon"><Icon name="image" /></span>
          <h2>Share what matters to you</h2>
          <p>Post a thought or a photo, and choose who gets to see it.</p>
        </article>
        <article>
          <span className="feature-icon"><Icon name="heart" /></span>
          <h2>Keep the conversation going</h2>
          <p>React, comment, and share the updates that bring people together.</p>
        </article>
      </section>
      <footer className="landing-footer">A space for every side of your social life.</footer>
    </div>
  );
}
