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
  const archiveId = params.archiveId;
  const broadcastId = params.broadcastId;
  const ecId = params.ecId;

  try {
    // stop Archive
    const archive = await vonage.video.stopArchive(archiveId);
    if (broadcastId !== "no-rtmp-outputs") {
      // stop Broadcast
      const broadcast = await vonage.video.stopBroadcast(broadcastId);
    }
    // stop Experience Composer render
    const ec = await vonage.video.stopExperienceComposerRender(ecId);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "stopped" }),
      //   body: JSON.stringify({ ecId: ec.id, archiveId: archive.id }),
    };
  } catch (error) {
    console.error("Error stopping archive: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "stopArchive error:" + error }),
    };
  }
};
