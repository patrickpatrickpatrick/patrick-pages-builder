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
    console.log(JSON.stringify(body));
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

const someForm = html`<!DOCTYPE html>
  <html>
    <body>
      <form action="/" method="post">
        <div>
          <label for="message">Message:</label>
          <input id="message" name="message" type="text" />
        </div>
        <div>
          <button>Submit</button>
        </div>
      </form>
    </body>
  </html>`;

app.get("*", async (c) => {
  const url = c.req.url;

  if (url.includes("form")) {
    return c.html(someForm);
  }

  return c.text("The request was a GET");
});

app.post("*", async (c) => {
  const reqBody = await readRequestBody(c.req.raw);
  const retBody = `The request body sent in was ${reqBody}`;
  return c.text(retBody);
});

export default app;