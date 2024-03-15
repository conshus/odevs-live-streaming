const { VONAGE_APP_ID, VONAGE_PRIVATE_KEY64 } = process.env;
import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth";
import { Client, AuthenticationType } from "@vonage/server-client";

const privateKey = Buffer.from(VONAGE_PRIVATE_KEY64, "base64");
const applicationId = VONAGE_APP_ID;
const credentials = {
  applicationId,
  privateKey,
};

const vonage = new Vonage(credentials);

// initialize client to make Conversation API calls
const vonageClient = new Client(new Auth(credentials));
vonageClient.authType = AuthenticationType.JWT;

exports.handler = async (event, context) => {
  // Only allow GET
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // get all archives
    const archives = await vonageClient.sendGetRequest(
      `https://video.api.vonage.com/v2/project/${applicationId}/archive`,
    );
    return {
      statusCode: 200,
      body: JSON.stringify(archives.data.items),
    };
  } catch (error) {
    console.error("Error gettng archives: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error gettng archives:" + error }),
    };
  }
};
