const { VONAGE_APP_ID, VONAGE_PRIVATE_KEY64 } = process.env;
import { Vonage } from "@vonage/server-sdk";
import { Video } from "@vonage/video";

exports.handler = async (event, context) => {
  //   console.log("add_archive_stream context: ", context);
  //   console.log("add_archive_stream event: ", event);
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
  //   const { archiveId } = JSON.parse(event.queryStringParameters);
  const { archiveId, broadcastId } = event.queryStringParameters;
  console.log("archiveId: ", archiveId);
  console.log("broadcastId: ", broadcastId);
  //   console.log("params: ", params);
  //   const sessionId = params.sessionId;
  //   const role = params.role.toLowerCase();
  //   console.log("got event: ", params);
  //   console.log("got webhook event status: ", event.body.status);
  if (params.status === "started") {
    try {
      // send signal
      console.log("got experience composer started event: ", params);
      //   const sessionId = params.name; // had to use name as sessionId to get video session id and not experience composer session id
      await vonage.video.addArchiveStream(archiveId, params.streamId);
      await vonage.video.addStreamToBroadcast(broadcastId, params.streamId);
      //   console.log("Successfully sent signal:", signalResponse);
      // const session = await vonage.video.createSession({ mediaMode:"routed" });

      // generate token
      //   const videoToken = vonage.video.generateClientToken(sessionId, { role });
      // res.setHeader('Content-Type', 'application/json');
      // res.send({
      //   applicationId: appId,
      //   sessionId: session.sessionId,
      //   token: token
      // });
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

// export const config = {
//   path: "/travel-guide/:city/:country",
// };
