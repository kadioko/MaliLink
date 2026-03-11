import crypto from "crypto";

type SnippeSessionRequest = {
  amount: number;
  customer: {
    name?: string | null;
    phone: string;
    email?: string | null;
  };
  description: string;
  metadata: Record<string, string>;
  redirectUrl: string;
  webhookUrl: string;
};

type SnippeSessionResponse = {
  id: string;
  reference: string;
  status: string;
  checkout_url: string;
  payment_link_url?: string;
  short_code?: string;
  expires_at?: string;
};

type SnippeWebhookData = {
  reference: string;
  external_reference?: string;
  status: string;
  amount: {
    value: number;
    currency: string;
  };
  customer?: {
    phone?: string;
    name?: string;
    email?: string;
  };
  metadata?: Record<string, string>;
  failure_reason?: string;
  completed_at?: string;
};

type SnippeWebhookEvent = {
  id: string;
  type: "payment.completed" | "payment.failed";
  api_version: string;
  created_at: string;
  data: SnippeWebhookData;
};

function getSnippeApiKey() {
  const apiKey = process.env.SNIPPE_API_KEY;
  if (!apiKey) {
    throw new Error("SNIPPE_API_KEY is not configured");
  }
  return apiKey;
}

export function getSnippeBaseUrl() {
  return process.env.SNIPPE_BASE_URL || "https://api.snippe.sh";
}

export function getSnippeWebhookSecret() {
  return process.env.SNIPPE_WEBHOOK_SECRET || "";
}

export async function createSnippePaymentSession(
  payload: SnippeSessionRequest,
  idempotencyKey: string
): Promise<SnippeSessionResponse> {
  const response = await fetch(`${getSnippeBaseUrl()}/v1/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getSnippeApiKey()}`,
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      amount: payload.amount,
      currency: "TZS",
      allowed_methods: ["mobile_money"],
      customer: payload.customer,
      redirect_url: payload.redirectUrl,
      webhook_url: payload.webhookUrl,
      description: payload.description,
      metadata: payload.metadata,
      expires_in: 3600,
    }),
  });

  const data = (await response.json()) as {
    code?: number;
    data?: SnippeSessionResponse;
    message?: string;
    error_code?: string;
  };

  if (!response.ok || !data.data) {
    throw new Error(data.message || "Failed to create Snippe payment session");
  }

  return data.data;
}

export function verifySnippeWebhookSignature(payload: string, signature: string | null) {
  const secret = getSnippeWebhookSecret();
  if (!secret || !signature) {
    return false;
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, expected);
}

export function parseSnippeWebhookEvent(payload: string): SnippeWebhookEvent {
  return JSON.parse(payload) as SnippeWebhookEvent;
}
