import { AuthTokenType } from "@prisma/client";
import { db } from "./db";
import { sendWhatsAppMessage } from "./twilio";

type DeliveryUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type DeliveryResult = {
  channels: string[];
  previewUrl?: string;
};

function getAppUrl(path: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return new URL(path, baseUrl).toString();
}

function getAuthMessage(type: AuthTokenType, url: string, name: string) {
  if (type === AuthTokenType.PASSWORD_RESET) {
    return {
      title: "Reset your MaliLink password",
      body: `Hello ${name}, use this secure link to reset your MaliLink password: ${url}`,
    };
  }

  if (type === AuthTokenType.EMAIL_VERIFICATION) {
    return {
      title: "Verify your MaliLink email",
      body: `Hello ${name}, confirm your MaliLink email by opening this secure verification link: ${url}`,
    };
  }

  return {
    title: "Verify your MaliLink phone",
    body: `Hello ${name}, confirm your MaliLink phone number by opening this secure verification link: ${url}`,
  };
}

export function getAuthActionUrl(type: AuthTokenType, token: string) {
  if (type === AuthTokenType.PASSWORD_RESET) {
    return getAppUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  }

  const channel = type === AuthTokenType.EMAIL_VERIFICATION ? "email" : "phone";
  return getAppUrl(`/verify?type=${channel}&token=${encodeURIComponent(token)}`);
}

export async function deliverAuthLink(user: DeliveryUser, type: AuthTokenType, token: string): Promise<DeliveryResult> {
  const url = getAuthActionUrl(type, token);
  const message = getAuthMessage(type, url, user.name);
  const channels = ["notification"];

  await db.notification.create({
    data: {
      userId: user.id,
      title: message.title,
      body: message.body,
      type: "system",
      metadata: JSON.stringify({ type, url }),
    },
  });

  if (user.phone && (type === AuthTokenType.PASSWORD_RESET || type === AuthTokenType.PHONE_VERIFICATION)) {
    const sentMessage = await sendWhatsAppMessage(user.phone, message.body);
    if (sentMessage) {
      channels.push("whatsapp");
    }
  }

  if (type === AuthTokenType.EMAIL_VERIFICATION) {
    channels.push("email_provider_pending");
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      channels,
      previewUrl: url,
    };
  }

  return { channels };
}
