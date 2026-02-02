import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkLogin } from "@features/user/api/userApi.ts";

export function RequireAuth() {
  const location = useLocation();
  const [checked, setChecked] = useState<boolean>(false);
  const [authed, setAuthed] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const { userId } = await checkLogin();
        setAuthed(userId != "");
      } catch {
        setAuthed(false);
      } finally {
        setChecked(true);
      }
    })();
  }, []);

  if (!checked) return null;

  if (!authed) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}
