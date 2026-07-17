import { createStartHandler } from "@tanstack/react-start/server";

export default createStartHandler(({ router, responseHeaders }) => {
  return new Response(null, { headers: responseHeaders });
});
