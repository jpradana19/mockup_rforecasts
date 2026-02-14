import { d as defineEventHandler, r as readBody, c as createError } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

var users = [
	{
		username: "admin",
		password: "admin"
	}
];
const usersConfig = {
	users: users
};

const auth_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("Login attempt:", body);
  console.log("Users config loaded:", usersConfig);
  const { username, password } = body;
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username and password are required"
    });
  }
  const user = usersConfig.users.find((u) => u.username === username && u.password === password);
  if (user) {
    return {
      token: "mock-jwt-token-for-demo",
      user: { username: user.username }
    };
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials"
    });
  }
});

export { auth_post as default };
//# sourceMappingURL=auth.post.mjs.map
