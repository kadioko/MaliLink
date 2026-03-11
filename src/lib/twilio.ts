import twilio from "twilio";

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  return twilio(accountSid, authToken);
}

export async function sendWhatsAppMessage(toPhoneNumber: string, body: string) {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!client || !fromNumber) {
    return null;
  }

  const to = toPhoneNumber.startsWith("whatsapp:") ? toPhoneNumber : `whatsapp:${toPhoneNumber}`;
  const from = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;

  return client.messages.create({
    from,
    to,
    body,
  });
}
