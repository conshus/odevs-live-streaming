const { ADMIN_PASSWORD, HOST_PASSWORD, GUEST_PASSWORD } = process.env;

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const params = JSON.parse(event.body);
  console.log("params: ", params);
  const password = params.password;
  const role = params.role.toLowerCase();
  let authorized = false;
  switch (role) {
    case "admin":
      authorized = password === ADMIN_PASSWORD;
      break;
    case "host":
      authorized = password === HOST_PASSWORD;
      break;
    case "guest":
      authorized = password === GUEST_PASSWORD;
      break;
    default:
      authorized = false;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ authorized }),
  };
};
