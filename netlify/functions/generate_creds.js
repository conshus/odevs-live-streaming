const { VONAGE_APP_ID, VONAGE_PRIVATE_KEY64 } = process.env;
import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth";
import { Video } from "@vonage/video";
import { Client, AuthenticationType } from "@vonage/server-client";

exports.handler = async (event, context) => {
  // // Only allow POST
  // if (event.httpMethod !== "POST") {
  // return { statusCode: 405, body: "Method Not Allowed" };
  // }

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
    console.log("conversation: ", conversation);

    // generate token
    // token = vonage.video.generateClientToken(session.sessionId);
    // res.setHeader('Content-Type', 'application/json');
    // res.send({
    //   applicationId: appId,
    //   sessionId: session.sessionId,
    //   token: token
    // });
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
