import { useNavigate, useParams } from "react-router-dom";
import { useCallback } from "react";

export function useWorkspaceNavigate() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const wsNavigate = useCallback(
    (path: string) => {
      if (path.startsWith("/admin") || path === "/") {
        navigate(path);
      } else {
        const cleanPath = path.startsWith("/") ? path.slice(1) : path;
        navigate(`/workspace/${slug}/${cleanPath}`);
      }
    },
    [navigate, slug]
  );

  return wsNavigate;
}

export function useWorkspacePath() {
  const { slug } = useParams<{ slug: string }>();
  return (path: string) => {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `/workspace/${slug}/${cleanPath}`;
  };
}
