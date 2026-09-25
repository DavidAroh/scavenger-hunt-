import Link from "next/link";
import { Shell } from "@/components/Shell";
import { EXPERIENCE, EVENT } from "@/lib/config";

function OfferAction({ href, children }: { href: string; children: string }) {
  if (!href) return <p className="mt-4 text-sm text-fog-300">Ask the RIL team at the booth for current details.</p>;
  return <a className="btn btn-paper mt-4 w-full" href={href} target="_blank" rel="noreferrer">{children} <span aria-hidden>↗</span></a>;
}

export default function ExperiencePage() {
  return (
    <Shell>
      <p className="label text-sky">Inside RIL</p>
      <h1 className="display mt-3">People come here to build.</h1>
      <p className="mt-4 text-lg text-fog-200 font-light">Everything happens inside the RIL booth: meet the makers, try a challenge, solve the hunt and find a next step that fits you.</p>

      <section className="mt-10" aria-labelledby="showcase-heading">
        <p className="label text-fog-300">Community showcase</p>
        <h2 id="showcase-heading" className="mt-2 text-2xl font-bold">Ideas made tangible</h2>
        <div className="mt-4 space-y-3">
          {EXPERIENCE.projects.map((project) => (
            <article key={project.category} className="border-3 border-paper p-4">
              <p className="label text-sky">{project.category}</p>
              <h3 className="mt-2 text-xl font-bold">{project.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fog-200">{project.description}</p>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs text-fog-400">The exhibition lineup is event-specific. Ask a RIL team member to introduce you to the featured builders.</p>
      </section>

      <section className="mt-10 border-3 border-blue p-5 shadow-hard" aria-labelledby="bootcamp-heading">
        <p className="label text-sky">RIL Tech Bootcamp</p>
        <h2 id="bootcamp-heading" className="display mt-2">{EXPERIENCE.bootcamp.title}</h2>
        <p className="mt-3 text-fog-200 leading-relaxed">{EXPERIENCE.bootcamp.description}</p>
        <h3 className="mt-5 label text-fog-300">What you can expect to learn and build</h3>
        <ul className="mt-3 space-y-2">
          {EXPERIENCE.bootcamp.skills.map((skill) => <li key={skill} className="flex gap-3"><span className="font-mono text-green">+</span><span>{skill}</span></li>)}
        </ul>
        <p className="mt-4 text-sm text-fog-300">{EXPERIENCE.bootcamp.audience}</p>
        <OfferAction href={EXPERIENCE.bootcampUrl}>
          Explore the bootcamp
        </OfferAction>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Nerd Work offers">
        <article className="panel p-4">
          <p className="label text-sky">Nerd Work tickets</p>
          <h2 className="mt-2 text-xl font-bold">A special rate for the RIL community</h2>
          <p className="mt-2 text-sm text-fog-200">Ask about the RIL community ticket offer and eligibility at the booth.</p>
          <OfferAction href={EXPERIENCE.ticketUrl}>Get event tickets</OfferAction>
        </article>
        <article className="panel p-4">
          <p className="label text-sky">RIL merchandise</p>
          <h2 className="mt-2 text-xl font-bold">Take a little RIL home</h2>
          <p className="mt-2 text-sm text-fog-200">See current merchandise and bundle availability with the RIL team.</p>
          <OfferAction href={EXPERIENCE.merchUrl}>Browse merchandise</OfferAction>
        </article>
      </section>

      <section className="mt-10" aria-labelledby="activations-heading">
        <p className="label text-fog-300">At the booth</p>
        <h2 id="activations-heading" className="mt-2 text-2xl font-bold">Pick your challenge</h2>
        <div className="mt-4 space-y-3">
          <article className="border-3 border-paper p-4"><p className="label text-green">Head-to-head</p><h3 className="mt-1 text-xl font-bold">RIL Versus</h3><p className="mt-2 text-sm text-fog-200">Challenge another attendee on the booth laptops. Staff will explain the game, manage the queue and announce each winner.</p></article>
          <article className="border-3 border-paper p-4"><p className="label text-green">Optional demo</p><h3 className="mt-1 text-xl font-bold">VR and creative tech</h3><p className="mt-2 text-sm text-fog-200">Check with the team for scheduled demonstrations and any available VR sessions.</p></article>
          <article className="border-3 border-paper p-4"><p className="label text-green">Raffle</p><h3 className="mt-1 text-xl font-bold">Every completed hunt counts</h3><p className="mt-2 text-sm text-fog-200">Finish the hunt to receive a raffle entry. The fastest checkpoint route wins the completion prize.</p></article>
        </div>
      </section>

      <div className="mt-10 space-y-3">
        <Link href="/play" className="btn btn-blue w-full">Return to the hunt <span aria-hidden>›</span></Link>
        <Link href="/leaderboard" className="btn btn-paper w-full">See the leaderboard <span aria-hidden>›</span></Link>
        <p className="text-center text-sm text-fog-400">{EVENT.site} · {EVENT.social}</p>
      </div>
    </Shell>
  );
}
