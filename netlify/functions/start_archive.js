const { VONAGE_APP_ID, VONAGE_PRIVATE_KEY64, URL } = process.env;
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
  const title = params.title;
  const timeInMs = params.timeInMs;
  const videoToken = vonage.video.generateClientToken(sessionId);
  const archiveOptions = {
    name: `${title}`,
    layout: {
      type: "bestFit",
    },
    resolution: "1920x1080",
    streamMode: "manual",
  };

  let broadcastId = "no-rtmp-outputs";

  const rtmpProviders = Object.keys(process.env)
    .filter((key) => key.startsWith("RTMP_") && key.endsWith("_URL"))
    .map((key) => key.split("RTMP_")[1].replace("_URL", ""));
  console.log("rtmpProviders: ", rtmpProviders);

  let broadcastOptions = {};

  if (rtmpProviders.length !== 0) {
    const rtmpArray = rtmpProviders.map((provider) => {
      return {
        id: provider,
        serverUrl: `${process.env["RTMP_" + provider + "_URL"]}`,
        streamName: `${process.env["RTMP_" + provider + "_KEY"]}`,
      };
    });
    console.log("rtmpArray: ", rtmpArray);

    broadcastOptions = {
      outputs: {
        hls: {},
        rtmp: rtmpArray,
      },
      resolution: "1920x1080",
      layout: {
        type: "bestFit",
      },
      streamMode: "manual",
    };
  }

  try {
    // start Archive
    const archive = await vonage.video.startArchive(sessionId, archiveOptions);

    if (rtmpProviders.length !== 0) {
      // start Broadcast
      const broadcast = await vonage.video.startBroadcast(
        sessionId,
        broadcastOptions,
      );
      broadcastId = broadcast.id;
    }
    // start Experience Composer render
    const experienceComposerOptions = {
      url: `${URL}/ec/${timeInMs}`,
      properties: {
        name: `Stream Preview`,
      },
      resolution: "1920x1080",
      statusCallbackUrl: `${URL}/.netlify/functions/add_stream?archiveId=${archive.id}&broadcastId=${broadcastId}`,
    };

    const ec = await vonage.video.startExperienceComposerRender(
      sessionId,
      videoToken,
      experienceComposerOptions,
    );

    console.log("sessionId: ", sessionId);
    console.log("archive.id: ", archive.id);
    console.log("broadcastId: ", broadcastId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ecId: ec.id,
        archiveId: archive.id,
        broadcastId,
      }),
    };
  } catch (error) {
    console.error("Error starting archive: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "startArchive error:" + error }),
    };
  }
};
