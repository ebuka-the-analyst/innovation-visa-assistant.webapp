import { useEffect } from "react";
import { Redirect } from "wouter";

export default function Signup() {
  // Redirect signup to login - Google OAuth handles both new and returning users
  useEffect(() => {
    window.location.href = "/login";
  }, []);

  return <Redirect to="/login" />;
}
