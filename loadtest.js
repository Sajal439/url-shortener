import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 2000, // 20 concurrent users
  duration: "1000s", // 10 second test
};

export default function () {
  // --- 1. THE WRITE PATH ---
  const payload = JSON.stringify({
    url: `https://example.com/unique-${__VU}-${__ITER}`,
  });

  const postRes = http.post(
    "http://host.docker.internal:3000/shorten",
    payload,
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  // Ensure it actually created the URL
  check(postRes, { "POST is 201 Created": (r) => r.status === 201 });

  // --- 2. THE READ PATH ---
  if (postRes.status === 201) {
    // Safely extract the generated code from the JSON body
    const { shortCode } = postRes.json();

    // Test the redirect GET endpoint.
    // We set redirects: 0 because we just want to verify our server returns a 302.
    // We don't want k6 to actually travel to example.com!
    const getRes = http.get(`http://host.docker.internal:3000/${shortCode}`, {
      redirects: 0,
    });

    check(getRes, { "GET is 302 Redirect": (r) => r.status === 302 });
  }

  // Small sleep to emulate human behavior
//   sleep(0.1);
}
