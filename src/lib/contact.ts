/**
 * Formulari de contacte sense servidor: es valida aquí i es prepara un correu (`mailto:`) perquè
 * l'enviï el programa de correu de qui escriu. Quan hi hagi un proveïdor d'enviament, només canvia
 * qui rep `ContactInput`; la validació es manté.
 */
export interface ContactInput {
  name: string;
  email: string;
  company: string;
  topic: string;
  message: string;
}

export type ContactField = "name" | "email" | "message";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(input: ContactInput): ContactField[] {
  const errors: ContactField[] = [];
  if (input.name.trim().length < 2) errors.push("name");
  if (!EMAIL.test(input.email.trim())) errors.push("email");
  if (input.message.trim().length < 10) errors.push("message");
  return errors;
}

export function mailtoHref(to: string, subject: string, input: ContactInput): string {
  const signature = [input.name, input.company, input.email].map((part) => part.trim()).filter(Boolean);
  const body = [input.message.trim(), "", "—", ...signature].join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
