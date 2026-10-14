"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { fill } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { site } from "@/data/site";
import { mailtoHref, validateContact, type ContactField, type ContactInput } from "@/lib/contact";
import { SECTION_IDS } from "@/lib/routes";

type Status = "idle" | "sent";

export function Contact({ t }: { t: Dictionary }) {
  const c = t.contact;
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<ContactField[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  const read = (): ContactInput => {
    const data = new FormData(form.current ?? undefined);
    const text = (key: string) => String(data.get(key) ?? "");
    return { name: text("name"), email: text("email"), company: text("company"), topic: text("topic"), message: text("message") };
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const input = read();
    const found = validateContact(input);
    setErrors(found);
    if (found.length) {
      form.current?.querySelector<HTMLElement>(`[name="${found[0]}"]`)?.focus();
      return;
    }
    window.location.href = mailtoHref(site.email, fill(c.subject, { topic: input.topic }), input);
    setStatus("sent");
  };

  // Un error desapareix en quan el camp ja és correcte, sense esperar a tornar a enviar.
  const revalidate = (field: ContactField) => {
    if (!errors.includes(field)) return;
    if (!validateContact(read()).includes(field)) setErrors((current) => current.filter((f) => f !== field));
  };

  const field = (name: ContactField, label: string, input: React.ReactNode) => {
    const invalid = errors.includes(name);
    return (
      <div className="grid gap-2">
        <label htmlFor={`${id}-${name}`} className="text-sm font-semibold">
          {label}
        </label>
        {input}
        {invalid && (
          <p id={`${id}-${name}-error`} className="flex items-start gap-2 text-sm text-[#ffb08a]">
            <span aria-hidden="true">!</span>
            {c.errors[name]}
          </p>
        )}
      </div>
    );
  };

  const control =
    "w-full rounded-xl border border-calc/20 bg-forn/60 px-4 py-3 text-calc placeholder:text-calc/35 transition-colors hover:border-calc/40 focus:border-argila focus:outline-none aria-[invalid=true]:border-[#ffb08a]";
  const a11y = (name: ContactField) => ({
    "aria-invalid": errors.includes(name) || undefined,
    "aria-describedby": errors.includes(name) ? `${id}-${name}-error` : undefined,
  });

  return (
    <section id={SECTION_IDS.contact} aria-labelledby="contacte-titol" className="grain relative overflow-hidden bg-forn py-[clamp(5rem,11vw,9rem)]">
      <div className="container-x relative grid gap-14 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="eyebrow text-argila">{c.eyebrow}</p>
          <h2 id="contacte-titol" className="display mt-4 text-[clamp(2.6rem,6vw,5.6rem)]">
            {c.title}
          </h2>
          <p className="mt-5 max-w-md text-lg text-calc/75">{c.lead}</p>

          <dl className="mt-12 grid gap-6 text-sm">
            <div>
              <dt className="eyebrow text-fang">{c.address}</dt>
              <dd className="mt-2 leading-relaxed">
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.locality} ({site.address.region})
                <br />
                <a className="mt-1 inline-block text-argila underline-offset-4 hover:underline" href={site.mapsUrl} rel="noopener" target="_blank">
                  {c.map} ↗
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <dt className="eyebrow text-fang">{c.phone}</dt>
                <dd className="mt-2">
                  <a className="text-lg font-semibold hover:text-argila" href={site.phoneHref}>
                    {site.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-fang">{c.mail}</dt>
                <dd className="mt-2 break-all">
                  <a className="text-lg font-semibold hover:text-argila" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <form ref={form} noValidate onSubmit={onSubmit} className="grid gap-5 rounded-2xl border border-calc/10 bg-forn-2 p-6 sm:p-9" aria-describedby={`${id}-note`}>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("name", c.name, <input id={`${id}-name`} name="name" autoComplete="name" required className={control} onChange={() => revalidate("name")} {...a11y("name")} />)}
            {field(
              "email",
              c.email,
              <input id={`${id}-email`} name="email" type="email" autoComplete="email" inputMode="email" required className={control} onChange={() => revalidate("email")} {...a11y("email")} />,
            )}
          </div>
          <div className="grid gap-2">
            <label htmlFor={`${id}-company`} className="text-sm font-semibold">
              {c.company} <span className="font-normal text-calc/50">({c.optional})</span>
            </label>
            <input id={`${id}-company`} name="company" autoComplete="organization" className={control} />
          </div>
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-semibold">{c.topic}</legend>
            <div className="flex flex-wrap gap-2">
              {c.topics.map((topic, i) => (
                <label
                  key={topic}
                  className="cursor-pointer rounded-full border border-calc/20 px-4 py-2 text-sm transition-colors hover:border-calc/50 has-[:checked]:border-argila has-[:checked]:bg-argila has-[:checked]:text-forn has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-argila"
                >
                  <input type="radio" name="topic" value={topic} defaultChecked={i === 0} className="sr-only" />
                  {topic}
                </label>
              ))}
            </div>
          </fieldset>
          {field(
            "message",
            c.message,
            <textarea id={`${id}-message`} name="message" rows={5} required className={`${control} resize-y`} onChange={() => revalidate("message")} {...a11y("message")} />,
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" className="btn btn-primary justify-center">
              {c.send} <span aria-hidden="true">→</span>
            </button>
            <p id={`${id}-note`} className="text-xs text-calc/55 sm:max-w-[16rem] sm:text-right">
              {fill(c.sendNote, { email: site.email })}
            </p>
          </div>
          <p role="status" className="text-sm text-argila empty:hidden">
            {status === "sent" ? fill(c.sent, { email: site.email }) : ""}
          </p>
          <p className="text-xs text-calc/45">{c.privacy}</p>
        </form>
      </div>
    </section>
  );
}
