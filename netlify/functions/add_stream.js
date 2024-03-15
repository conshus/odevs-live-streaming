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
  console.log("params: ", params);
  const { archiveId, broadcastId } = event.queryStringParameters;
  console.log("archiveId: ", archiveId);
  console.log("broadcastId: ", broadcastId);
  if (params.status === "started") {
    try {
      await vonage.video.addArchiveStream(archiveId, params.streamId);
      if (broadcastId !== "no-rtmp-outputs") {
        await vonage.video.addStreamToBroadcast(broadcastId, params.streamId);
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success" }),
      };
    } catch (error) {
      console.error("Error adding stream: ", error);
      return {
        statusCode: 200, // hoping this stops the calls
        body: JSON.stringify({ error: "addArchiveStream error:" + error }),
      };
    }
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success" }),
    };
  }
};
