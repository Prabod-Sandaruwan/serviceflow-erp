export const actionStyles: Record<string, { bg: string; dot: string }> = {
  LOGIN: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-500",
  },
  LOGOUT: {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  USER_CREATED: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-500",
  },
  CLIENT_CREATED: {
    bg: "bg-blue-50 text-blue-700 border-blue-200/80",
    dot: "bg-blue-500",
  },
  ROLE_CHANGED: {
    bg: "bg-amber-50 text-amber-700 border-amber-200/80",
    dot: "bg-amber-500",
  },
  PASSWORD_RESET: {
    bg: "bg-rose-50 text-rose-700 border-rose-200/80",
    dot: "bg-rose-500",
  },
};

export const defaultActionStyle = {
  bg: "bg-blue-50 text-blue-700 border-blue-200/80",
  dot: "bg-blue-500",
};

export function getActorInfo(log: any) {
  const actor =
    log.actor?.email ||
    log.actorRole ||
    (log.actorUserId ? `User #${log.actorUserId}` : "System");
  const roleInitial = (log.actorRole?.[0] || actor[0] || "S").toUpperCase();
  const actorBg =
    roleInitial === "A"
      ? "bg-purple-100 text-purple-700"
      : roleInitial === "M"
        ? "bg-blue-100 text-blue-700"
        : "bg-emerald-100 text-emerald-700";
  return { actor, roleInitial, actorBg };
}

export function getMetaText(log: any): string {
  if (log.ipAddress) return `IP: ${log.ipAddress}`;
  if (log.requestId) return `Req: ${log.requestId}`;
  return log.action === "LOGIN"
    ? "Successful authentication"
    : "Operation recorded";
}
