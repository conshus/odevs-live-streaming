const {
  ADMIN_PASSWORD,
  GITHUB_PAT,
  GUEST_PASSWORD,
  HOST_PASSWORD,
  NETLIFY_PAT,
  VONAGE_APP_ID,
  VONAGE_PRIVATE_KEY64,
} = process.env;

exports.handler = async (event, context) => {
  let ADMIN_PASSWORDset = ADMIN_PASSWORD ? true : false;
  let GITHUB_PATset = GITHUB_PAT ? true : false;
  let GUEST_PASSWORDset = GUEST_PASSWORD ? true : false;
  let HOST_PASSWORDset = HOST_PASSWORD ? true : false;
  let NETLIFY_PATset = NETLIFY_PAT ? true : false;
  let VONAGE_APP_IDset = VONAGE_APP_ID ? true : false;
  let VONAGE_PRIVATE_KEY64set = VONAGE_PRIVATE_KEY64 ? true : false;

  return {
    statusCode: 200,
    body: JSON.stringify({
      ADMIN_PASSWORDset,
      GITHUB_PATset,
      GUEST_PASSWORDset,
      HOST_PASSWORDset,
      NETLIFY_PATset,
      VONAGE_APP_IDset,
      VONAGE_PRIVATE_KEY64set,
    }),
  };
};
