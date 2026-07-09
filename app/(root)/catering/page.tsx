import { CateringHero } from '@/src/components/catering/catering-hero';
import { CateringInquiryForm } from '@/src/components/catering/catering-inquiry-form';
import { Reveal, Marquee } from '@/src/components/motion';

export const metadata = {
  title: 'Catering',
  description:
    'Private dinners, parties and corporate tables — cooked seasonal, tested, never fussy. Start an inquiry.',
};

const services = [
  {
    number: '01',
    title: 'Private dinners',
    description:
      'A set table for 6–24. A menu written for the occasion, cooked in your kitchen, served without theatre.',
  },
  {
    number: '02',
    title: 'Parties & events',
    description:
      'Standing food that holds up — plates people talk about, timed so you never queue for the good bits.',
  },
  {
    number: '03',
    title: 'Corporate tables',
    description:
      'Offsites, launches and long lunches. Reliable logistics, dietary cover, invoiced properly.',
  },
];

const process = [
  {
    number: '01',
    title: 'Tell us the shape of it',
    description: 'Date, headcount, place, appetite. The inquiry takes two minutes.',
  },
  {
    number: '02',
    title: 'Menu & quote',
    description:
      'A menu written for your event and a clear quote within two working days. One revision on the house.',
  },
  {
    number: '03',
    title: 'We cook, you host',
    description: 'Sourcing, prep, service and a spotless kitchen after. You stay at the table.',
  },
];

const sampleMenu = [
  'Slow lamb shoulder',
  'Charred hispi, anchovy cream',
  'Cornmeal-fried fish',
  'Saffron rice',
  'Burnt honey panna cotta',
  'Cajun pasta',
  'Seasonal & tested',
];

const faqs = [
  {
    question: 'How far do you travel?',
    answer:
      'Anywhere within two hours of London by default. Further afield is possible for larger events — ask, and we’ll be straight about the costs.',
  },
  {
    question: 'Can you handle allergies and dietary requirements?',
    answer:
      'Yes — every menu is written after we know your table. Vegetarian, vegan, halal, gluten-free and allergy-safe covers are part of the plan, not an afterthought.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'Private dinners typically start around £65 a head; parties and corporate work are quoted by scope. Every quote is itemised — no service-charge surprises.',
  },
  {
    question: 'How far ahead should I book?',
    answer:
      'Three to four weeks for dinners, six-plus for weddings and large events. Short notice? Send the inquiry anyway — gaps happen.',
  },
];

export default function CateringPage() {
  return (
    <>
      <CateringHero />

      {/* Sample menu marquee */}
      <div id="menus" className="border-y border-[var(--ink-line)] bg-[var(--parchment)] py-5">
        <Marquee speed={42}>
          {sampleMenu.map((item) => (
            <span key={item} className="mx-8 inline-flex items-center gap-8 whitespace-nowrap">
              <span className="font-serif text-2xl italic text-[var(--ink-75)]">{item}</span>
              <span className="inline-block h-1.5 w-1.5 bg-[var(--tomato)]" aria-hidden="true" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* Services */}
      <section className="wrapper py-20 lg:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <Reveal>
            <p className="eyebrow">What we cook for</p>
            <h2 className="display-s mt-3">Three ways to set the table.</h2>
          </Reveal>
          <Reveal stagger={0.12} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.number}
                data-reveal-child
                className="border-t border-[var(--ink)] pt-4"
              >
                <p className="mono-label text-[var(--tomato)]">{service.number}</p>
                <h3 className="heading mt-6 text-[2rem]">{service.title}</h3>
                <p className="body-sm mt-3">{service.description}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section className="bg-[var(--ink)] py-20 text-[var(--cream)] lg:py-28">
        <div className="wrapper flex flex-col gap-14">
          <Reveal>
            <p className="eyebrow-peach">How it works</p>
            <h2 className="mt-3 font-serif text-4xl font-normal leading-tight text-[var(--cream)] sm:text-5xl lg:text-6xl">
              From inquiry to <span className="italic text-[var(--peach)]">last plate</span>.
            </h2>
          </Reveal>
          <Reveal stagger={0.15} className="flex flex-col">
            {process.map((step) => (
              <div
                key={step.number}
                data-reveal-child
                className="grid grid-cols-[auto_1fr] items-baseline gap-8 border-t border-[var(--cream-15)] py-8 md:grid-cols-[auto_1fr_1.2fr]"
              >
                <span className="font-mono text-xs tracking-[0.2em] text-[var(--peach)]">
                  {step.number}
                </span>
                <h3 className="font-serif text-3xl text-[var(--cream)] md:text-4xl">
                  {step.title}
                </h3>
                <p className="col-start-2 max-w-xl text-sm leading-relaxed text-[var(--cream-70)] md:col-start-3">
                  {step.description}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Inquiry */}
      <section id="inquire" className="wrapper py-20 lg:py-28">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="flex flex-col gap-8 lg:sticky lg:top-32 lg:self-start">
            <span className="eyebrow-rule">The inquiry</span>
            <h2 className="display-l">
              Set the <span className="italic text-[var(--tomato)]">date</span>.
            </h2>
            <p className="body-lg text-[var(--ink-65)] max-w-md">
              Two minutes of detail is all the kitchen needs to come back with a menu and a quote.
              No deposit, no commitment — just a conversation about food.
            </p>
            <dl className="flex flex-col gap-4 max-w-md">
              <div className="flex items-baseline justify-between gap-6">
                <dt className="eyebrow">Replies</dt>
                <dd className="text-sm text-[var(--ink-75)]">Within two working days</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <dt className="eyebrow">Bookings</dt>
                <dd className="text-sm text-[var(--ink-75)]">3–4 weeks ahead for dinners</dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-[var(--ink)] pt-10">
            <CateringInquiryForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="wrapper pb-24">
        <div className="flex flex-col gap-10 max-w-3xl">
          <Reveal>
            <span className="eyebrow-rule">Questions</span>
            <h2 className="display-s mt-3">Before you ask</h2>
          </Reveal>
          <div className="flex flex-col">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="grid grid-cols-[auto_1fr] gap-6 border-t border-[var(--ink-line)] py-8"
              >
                <span className="mono-label pt-1">{String(index + 1).padStart(2, '0')}</span>
                <div className="flex flex-col gap-3">
                  <h3 className="font-serif text-2xl text-[var(--ink)]">{faq.question}</h3>
                  <p className="text-sm leading-relaxed text-[var(--ink-65)]">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
