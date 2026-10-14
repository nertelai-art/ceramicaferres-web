import { describe, expect, it } from "vitest";
import { mailtoHref, validateContact, type ContactInput } from "./contact";

const valid: ContactInput = { name: "Anna", email: "anna@estudi.cat", company: "", topic: "Mostres", message: "Voldria mostres de Volta." };

describe("validateContact", () => {
  it("accepta una consulta completa", () => {
    expect(validateContact(valid)).toEqual([]);
  });
  it("assenyala cada camp que falta o és incorrecte", () => {
    expect(validateContact({ ...valid, name: " ", email: "anna@", message: "hola" })).toEqual(["name", "email", "message"]);
    expect(validateContact({ ...valid, email: "anna estudi.cat" })).toEqual(["email"]);
  });
});

describe("mailtoHref", () => {
  it("codifica l'assumpte i el cos, i no deixa línies buides de més", () => {
    const href = mailtoHref("contact@ceramicaferres.com", "Consulta: Mostres", valid);
    expect(href.startsWith("mailto:contact@ceramicaferres.com?subject=Consulta%3A%20Mostres&body=")).toBe(true);
    const body = decodeURIComponent(href.split("&body=")[1]!);
    expect(body).toBe("Voldria mostres de Volta.\n\n—\nAnna\nanna@estudi.cat");
  });
});
