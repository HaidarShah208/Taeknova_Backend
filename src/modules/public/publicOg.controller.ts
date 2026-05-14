import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { env } from "@config/env";
import { ApiError } from "@common/exceptions/ApiError";
import { CatalogService } from "@modules/catalog/catalog.service";

const OG_SITE_NAME = "Tiknova";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function plainTextDescription(raw: string | undefined, max = 320): string {
  if (!raw) return "";
  const stripped = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (stripped.length <= max) return stripped;
  return `${stripped.slice(0, max - 1)}…`;
}

function absolutizeImageUrl(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  if (u.startsWith("https://") || u.startsWith("http://")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  const origin = env.APP_ORIGIN.replace(/\/$/, "");
  if (u.startsWith("/")) return `${origin}${u}`;
  return `${origin}/${u}`;
}

function shopProductUrl(slug: string): string {
  const origin = env.APP_ORIGIN.replace(/\/$/, "");
  return `${origin}/products/${encodeURIComponent(slug)}`;
}

export class PublicOgController {
  constructor(private readonly catalog = new CatalogService()) {}

  productOgPage = async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug ?? "");
    let product;
    try {
      product = await this.catalog.getBySlug(slug);
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === StatusCodes.NOT_FOUND) {
        res
          .status(StatusCodes.NOT_FOUND)
          .type("html")
          .send("<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Not found</title></head><body>Not found</body></html>");
        return;
      }
      throw e;
    }

    const title = product.name;
    const description = plainTextDescription(product.description);
    const canonicalShopUrl = shopProductUrl(product.slug);
    const imageAbs = absolutizeImageUrl(product.imageUrls?.[0]);

    const metaImage = imageAbs ? `\n  <meta property="og:image" content="${escapeHtml(imageAbs)}" />\n  <meta property="og:image:secure_url" content="${escapeHtml(imageAbs)}" />` : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonicalShopUrl)}" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalShopUrl)}" />
  <meta property="og:site_name" content="${escapeHtml(OG_SITE_NAME)}" />${metaImage}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${imageAbs ? `<meta name="twitter:image" content="${escapeHtml(imageAbs)}" />` : ""}
  <meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalShopUrl)}" />
</head>
<body>
  <p><a href="${escapeHtml(canonicalShopUrl)}">Continue to product</a></p>
</body>
</html>`;

    res.status(StatusCodes.OK).type("html").send(html);
  };
}
