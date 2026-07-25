import sgMail from "@sendgrid/mail";

let ready = false;
export function getSendgrid() {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) throw new Error("Falta SENDGRID_API_KEY en las variables de entorno.");
  if (!ready) {
    sgMail.setApiKey(key);
    ready = true;
  }
  return sgMail;
}
