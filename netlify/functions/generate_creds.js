const { VONAGE_APP_ID, VONAGE_PRIVATE_KEY64 } = process.env;
import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth";
import { Video } from "@vonage/video";
import { Client, AuthenticationType } from "@vonage/server-client";

exports.handler = async (event, context) => {
  const privateKey = Buffer.from(VONAGE_PRIVATE_KEY64, "base64");
  const applicationId = VONAGE_APP_ID;
  const credentials = {
    applicationId,
    privateKey,
  };

  const vonage = new Vonage(credentials);
  const video = new Video(credentials);
  vonage.video = video;

  // initialize client to make Conversation API calls
  const vonageClient = new Client(new Auth(credentials));
  vonageClient.authType = AuthenticationType.JWT;

  try {
    const session = await vonage.video.createSession({ mediaMode: "routed" });
    const conversation = await vonageClient.sendPostRequest(
      "https://api.nexmo.com/v0.3/conversations",
      {},
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        applicationId,
        sessionId: session.sessionId,
        conversationId: conversation.data.id,
      }),
    };
  } catch (error) {
    console.error("Error creating session: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "createSession error:" + error }),
    };
  }
};
