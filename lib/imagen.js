import { GoogleAuth } from 'google-auth-library';

const isLocal = !process.env.VERCEL;

const auth = new GoogleAuth(
  isLocal
    ? {
        keyFile: './service-account-key.json',
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      }
    : {
        credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      }
);

export async function generateImage(prompt) {
  try {
    console.log("Generating image with Vertex AI REST API, prompt:", prompt);

    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-west1';

    if (!projectId) {
      console.error("GOOGLE_CLOUD_PROJECT not found");
      return null;
    }

    // Get access token
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-fast-generate-001:predict`;

    const requestBody = {
      instances: [{
        prompt: prompt,
      }],
      parameters: {
        sampleCount: 1,
      },
    };

    console.log("Making API request to:", url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API request failed:", response.status, errorText);
      console.error("Error response text:", errorText);
      return null;
    }

    const result = await response.json();
    console.log("API response received");

    if (result && result.predictions && result.predictions.length > 0) {
      const prediction = result.predictions[0];
      console.log("Prediction keys:", Object.keys(prediction));

      // Check for image data
      if (prediction.bytesBase64Encoded) {
        const base64 = prediction.bytesBase64Encoded;
        console.log("Generated image (base64 length):", base64.length);
        return `data:image/png;base64,${base64}`;
      }
    }

    console.error("No image data found in response. Full response:", JSON.stringify(result, null, 2));
    return null;

  } catch (error) {
    console.error("Vertex AI REST API error:", error.message);
    console.error("Error details:", error);
    return null;
  }
}