import { Hono } from "hono";
import { html } from "hono/html";

const app = new Hono();

/**
 * readRequestBody reads in the incoming request body
 * @param {Request} request the incoming request to read from
 */
async function readRequestBody(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    return JSON.stringify(body);
  } else if (contentType.includes("application/text")) {
    return request.text();
  } else if (contentType.includes("text/html")) {
    return request.text();
  } else if (contentType.includes("form")) {
    const formData = await request.formData();
    const body: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      body[key] = value.toString();
    }
    return JSON.stringify(body);
  } else {
    // Perhaps some other type of data was submitted in the form
    // like an image, or some other binary data.
    return "a file";
  }
}

app.post("*", async (c) => {
  const reqBody = await readRequestBody(c.req.raw);

  const { type } = JSON.parse(reqBody)

  console.log(type)

  if (type == "page.content_updated") {
    console.log("Deploying Patworld...")
    const response = await fetch("https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/211ebbfd-6eb6-402b-b08e-8089523e7244", { method: "POST" })
    if (!response.ok) {
      c.status(500)
      return c.text("Failed to deploy Patworld")
    }
    c.status(200)
    return c.text("Sucessfully deployed Patworld")
  }
});

export default app;