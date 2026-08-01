"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      // Marca la verificación completada una sola vez tras montar.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        role="status"
        aria-label="Verificando autenticación"
      >
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <span className="spinner" style={{ borderTopColor: '#6b7280', borderColor: 'rgba(107,114,128,0.3)' }} aria-hidden="true" />
          <span className="text-sm">Verificando sesión…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
