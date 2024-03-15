const { VONAGE_APP_ID, VONAGE_PRIVATE_KEY64 } = process.env;
import { Vonage } from "@vonage/server-sdk";
import { Video } from "@vonage/video";

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const privateKey = Buffer.from(VONAGE_PRIVATE_KEY64, "base64");
  const applicationId = VONAGE_APP_ID;
  const credentials = {
    applicationId,
    privateKey,
  };

  const vonage = new Vonage(credentials);
  const video = new Video(credentials);
  vonage.video = video;

  const params = JSON.parse(event.body);
  const sessionId = params.sessionId;
  const role = params.role.toLowerCase();

  try {
    // generate token
    const videoToken = vonage.video.generateClientToken(sessionId, { role });
    return {
      statusCode: 200,
      body: JSON.stringify({ videoToken }),
    };
  } catch (error) {
    console.error("Error generating tokens: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "generateTokens error:" + error }),
    };
  }
};
