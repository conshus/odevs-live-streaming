const { VONAGE_APP_ID, VONAGE_PRIVATE_KEY64 } = process.env;
import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth";
import { tokenGenerate } from "@vonage/jwt";

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
    return true;
  } catch (error) {
    console.error("Error checking member: ", error.response.status);
    // if (error.response.data.code === "user:error:not-found") {
    if (error.response.status === 404) {
      console.log("member was not found, create a user");
      await createUser(name, display_name);
      await createMember(conversationId, display_name);
    } else if (
      // error.response.data.code === "conversation:error:member-already-joined"
      error.response.status === 400
    ) {
      console.log("member was found");
    }

    return true;
  }
}

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const params = JSON.parse(event.body);

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
  } catch (error) {
    console.error("Error joining chat room: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "JWT generation error:" + error }),
    };
  }
};
