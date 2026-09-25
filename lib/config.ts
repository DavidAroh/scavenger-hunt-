/**
 * Event-day config: prize rules, registration options, and copy.
 * The puzzle SCRIPT (stages, riddles, answers) lives in lib/stages.ts.
 *
 * Voice: RIL = witty, snappy, human. Keep it short.
 */

export const PRIZE = {
  description: "a bundle of comics + RIL merch",
  completionReward: "an RIL-branded completion item",
  rafflePrize: "a Nerd Work ticket and RIL merch bundle",
  /** The single fastest checkpoint-route finisher wins outright. */
  topN: 1,
  /** Every finisher gets one raffle entry in addition to any activity entries. */
  raffleForAll: true,
};

/** Shown as chips on the register screen. Optional for the participant. Grounded in RIL's course list. */
export const INTERESTS = [
  "Front-end",
  "Back-end",
  "Mobile",
  "UI/UX",
  "Digital Marketing",
  "Here for the comics",
];

/** Optional "which best describes you" chips (single-select on the register screen). */
export const ROLES = ["Developer", "Student", "Creator", "Entrepreneur"];

/** Optional age-range chips (single-select). */
export const AGE_RANGES = ["Under 18", "18-24", "25-34", "35-44", "45+"];

/** Consent for running the hunt/prize claim. Optional marketing opt-in is stored separately. */
export const CONSENT_REQUIRED = true;
export const CONSENT_TEXT =
  "I agree that RIL can use my contact details to run this hunt and contact me about my participation or prize.";
export const MARKETING_TEXT = "Optional: send me occasional RIL news, events and bootcamp updates. I can unsubscribe anytime.";

/** The "interested in RIL programs?" opt-in shown under consent. */
export const PROGRAMS_TEXT = "Yes, tell me about RIL bootcamps and programs.";

export const EVENT = {
  name: "The Director's Lost Treasure",
  tagline: "Recover the treasure before your rival does.",
  site: "renaissancelabs.org",
  siteUrl: "https://www.renaissancelabs.org",
  social: "@RxlabsHQ",
};

/** Event-day information lives here so the booth team can update it without changing page code. */
export const EXPERIENCE = {
  ticketUrl: "",
  merchUrl: "",
  bootcampUrl: "",
  projects: [
    { category: "AI & automation", title: "Community project showcase", description: "Meet the makers and see practical experiments built by people in the RIL community." },
    { category: "Games & web", title: "Playable ideas, made real", description: "Explore interactive prototypes and talk with the people who designed and built them." },
    { category: "Creative technology", title: "Where code meets creativity", description: "Discover projects that combine technology, design and hands-on problem solving." },
  ],
  bootcamp: {
    title: "Build something real.",
    description: "RIL bootcamps are hands-on learning experiences for people who want to build practical technology projects with a supportive community.",
    skills: ["Plan and prototype a digital product", "Build and present a practical project", "Learn with mentors and peers"],
    audience: "Beginners, students, developers and creators are welcome. Check the application page for current dates, eligibility and curriculum.",
  },
} as const;
