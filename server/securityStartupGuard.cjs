if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error(
    "[Security] SESSION_SECRET is required in production; refusing to start with a fallback session secret.",
  );
}
