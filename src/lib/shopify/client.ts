import "server-only"

/**
 * Thin Shopify Admin client. Gated by env vars so the redemption flow works
 * in dev without a real store — calls fall through to a mocked response that
 * still returns a unique "shopify id" the rest of the system can store.
 *
 * To wire up a real store set:
 *   SHOPIFY_STORE           = your-store.myshopify.com
 *   SHOPIFY_ADMIN_TOKEN     = shpat_*** (private app Admin API access token)
 *   SHOPIFY_API_VERSION     = 2024-10  (optional, defaults below)
 */

const STORE = process.env.SHOPIFY_STORE
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2024-10"

export function isShopifyConfigured(): boolean {
  return Boolean(STORE && TOKEN)
}

export type DiscountInput = {
  code: string
  discountType: "percentage" | "fixed_amount"
  discountValue: number
  expiresAt: Date
}

export type DiscountResult =
  | { ok: true; shopifyId: string; mocked: boolean }
  | { ok: false; error: string }

export async function createDiscountCode(
  input: DiscountInput,
): Promise<DiscountResult> {
  if (!isShopifyConfigured()) {
    return {
      ok: true,
      shopifyId: `mock:${input.code}`,
      mocked: true,
    }
  }

  const mutation = `
    mutation CreateDinkedinDiscount($input: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $input) {
        codeDiscountNode { id }
        userErrors { field message }
      }
    }
  `

  const variables = {
    input: {
      title: `Dinkedin redemption ${input.code}`,
      code: input.code,
      startsAt: new Date().toISOString(),
      endsAt: input.expiresAt.toISOString(),
      customerSelection: { all: true },
      customerGets: {
        value:
          input.discountType === "percentage"
            ? { percentage: input.discountValue / 100 }
            : {
                discountAmount: {
                  amount: input.discountValue,
                  appliesOnEachItem: false,
                },
              },
        items: { all: true },
      },
      usageLimit: 1,
      appliesOncePerCustomer: true,
    },
  }

  try {
    const res = await fetch(
      `https://${STORE}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": TOKEN!,
        },
        body: JSON.stringify({ query: mutation, variables }),
      },
    )

    if (!res.ok) {
      return { ok: false, error: `Shopify HTTP ${res.status}` }
    }

    const data = (await res.json()) as {
      data?: {
        discountCodeBasicCreate?: {
          codeDiscountNode?: { id: string }
          userErrors?: { field: string[] | null; message: string }[]
        }
      }
      errors?: { message: string }[]
    }

    if (data.errors?.length) {
      return { ok: false, error: data.errors[0].message }
    }
    const result = data.data?.discountCodeBasicCreate
    if (!result) {
      return { ok: false, error: "Shopify returned no result." }
    }
    if (result.userErrors?.length) {
      return { ok: false, error: result.userErrors[0].message }
    }
    if (!result.codeDiscountNode?.id) {
      return { ok: false, error: "Shopify did not return a discount id." }
    }
    return {
      ok: true,
      shopifyId: result.codeDiscountNode.id,
      mocked: false,
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Shopify request failed.",
    }
  }
}
