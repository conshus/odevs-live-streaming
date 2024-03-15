const { VONAGE_APP_ID, VONAGE_PRIVATE_KEY64 } = process.env;
import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth";
import { tokenGenerate } from "@vonage/jwt";

// import { Video } from "@vonage/video";
import { Client, AuthenticationType } from "@vonage/server-client";

const privateKey = Buffer.from(VONAGE_PRIVATE_KEY64, "base64");
const applicationId = VONAGE_APP_ID;
const credentials = {
  applicationId,
  privateKey,
};

const vonage = new Vonage(credentials);
// const video = new Video(credentials);
// vonage.video = video;

// initialize client to make Conversation API calls
const vonageClient = new Client(new Auth(credentials));
vonageClient.authType = AuthenticationType.JWT;

async function createUser(name, display_name) {
  console.log("createUser: ", name, display_name);
  try {
    const user = await vonageClient.sendPostRequest(
      "https://api.nexmo.com/v1/users",
      { name, display_name },
    );
    console.log("user: ", user);
    return true;
  } catch (error) {
    console.log("create user error: ", error);
    return true;
  }
}

async function createMember(conversationId, display_name) {
  console.log("checkMember");
  const name = display_name.toLowerCase().replaceAll(" ", "-");
  console.log("name: ", name);
  try {
    // check if already a member, by trying to create a member
    const member = await vonageClient.sendPostRequest(
      `https://api.nexmo.com/v1/conversations/${conversationId}/members`,
      { state: "joined", user: { name: name }, channel: { type: "app" } },
    );
    // console.log("member: ", member);
    return true;

    // if not check if user exists, if does, create a member

    // if user doesn't exist, create one, then create a member
    // if (userExists(username)){

    // }
  } catch (error) {
    console.error("Error checking member: ", error.response.status);
    // console.error("error.response.data.invalid_parameters: ", error.response.data.invalid_parameters);
    // console.error("error.response.data.code: ", error.response.data.code);
    // if (error.response.data.code === "user:error:not-found") {
    if (error.response.status === 404) {
      console.log("member was not found, create a user");
      await createUser(name, display_name);
      // console.log("past createUser, createMember");
      await createMember(conversationId, display_name);
    } else if (
      // error.response.data.code === "conversation:error:member-already-joined"
      error.response.status === 400
    ) {
      console.log("member was found");
    }

    return true;
    // return {
    //     statusCode: 500,
    //     body: JSON.stringify({ error: 'createSession error:' + error }),
    // };
  }
}

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const params = JSON.parse(event.body);
  console.log("params: ", params);
  // const username = params.name.toLowerCase().replaceAll(" ", "-");

  try {
    // check if already a member, by trying to create a member
    await createMember(params.conversationId, params.name);
    console.log("everything worked!");
    // generate JWT
    const options = {
      application_id: process.env.APP_ID,
      sub: params.name.toLowerCase().replaceAll(" ", "-"),
      exp: Math.round(new Date().getTime() / 1000) + 86400,
      acl: {
        paths: {
          "/*/users/**": {},
          "/*/conversations/**": {},
          "/*/sessions/**": {},
          "/*/devices/**": {},
          "/*/image/**": {},
          "/*/media/**": {},
          "/*/applications/**": {},
          "/*/push/**": {},
          "/*/knocking/**": {},
          "/*/legs/**": {},
        },
      },
    };
    const chatToken = tokenGenerate(applicationId, privateKey, options);
    return {
      statusCode: 200,
      body: JSON.stringify({ chatToken }),
    };
    // const member = await vonageClient.sendPostRequest(`https://api.nexmo.com/v0.3/conversations/${params.conversationId}/members`,{"user":{"name":params.name}});
    // console.log("member: ", member);
    // return {
    //     statusCode: 200,
    //     body: JSON.stringify({member}),
    // };

    // if not check if user exists, if does, create a member

    // if user doesn't exist, create one, then create a member
    // if (userExists(username)){

    // }
  } catch (error) {
    console.error("Error joining chat room: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "JWT generation error:" + error }),
    };
  }

  // const privateKey = Buffer.from(VONAGE_PRIVATE_KEY64, 'base64');
  // const applicationId = VONAGE_APP_ID;
  // const credentials = {
  //     applicationId,
  //     privateKey,
  // };

  // const vonage = new Vonage(credentials);
  // const video = new Video(credentials);
  // vonage.video = video;

  // // initialize client to make Conversation API calls
  // const vonageClient = new Client (new Auth(credentials));
  // vonageClient.authType = AuthenticationType.JWT

  // try {
  //     const session = await vonage.video.createSession({ mediaMode:"routed" });
  //     const conversation = await vonageClient.sendPostRequest('https://api.nexmo.com/v0.3/conversations',{});
  //     console.log("conversation: ", conversation);

  //     // generate token
  //     // token = vonage.video.generateClientToken(session.sessionId);
  //     // res.setHeader('Content-Type', 'application/json');
  //     // res.send({
  //     //   applicationId: appId,
  //     //   sessionId: session.sessionId,
  //     //   token: token
  //     // });
  //     return {
  //         statusCode: 200,
  //         body: JSON.stringify({applicationId, sessionId: session.sessionId, conversationId: conversation.data.id}),
  //     };

  // } catch(error) {
  //     console.error("Error creating session: ", error);
  //     return {
  //         statusCode: 500,
  //         body: JSON.stringify({ error: 'createSession error:' + error }),
  //     };
  // }
};
