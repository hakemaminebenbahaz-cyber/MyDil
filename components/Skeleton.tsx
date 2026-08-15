export function Skeleton({
  width = "100%",
  height = 14,
  radius = 6,
  style = {},
}: {
  width?: string | number;
  height?: string | number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

/** Ligne de type "carte liste" (avatar/icône + 2 lignes de texte) — emprunts, projets, utilisateurs... */
export function SkeletonRow({ withBadge = true }: { withBadge?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
      background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9" }}>
      <Skeleton width={40} height={40} radius={10} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton width="40%" height={13} />
        <Skeleton width="60%" height={11} />
      </div>
      {withBadge && <Skeleton width={70} height={22} radius={20} />}
    </div>
  );
}

/** Carte de type "grille" — inventaire, projets vitrine */
export function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20,
      border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 12 }}>
      <Skeleton height={44} width={44} radius={12} />
      <Skeleton width="70%" height={13} />
      <Skeleton width="50%" height={11} />
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <Skeleton width={50} height={18} radius={20} />
        <Skeleton width={40} height={18} radius={20} />
      </div>
    </div>
  );
}

/** Tuile KPI — dashboard, statistiques */
export function SkeletonStat() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "24px 24px 20px",
      border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 14 }}>
      <Skeleton width={36} height={36} radius={10} />
      <Skeleton width="50%" height={28} />
      <Skeleton width="70%" height={12} />
    </div>
  );
}
