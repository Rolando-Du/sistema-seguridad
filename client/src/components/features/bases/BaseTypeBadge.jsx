import {
  Building2,
  Landmark,
  MapPinHouse,
  Shield,
  ShieldCheck,
} from "lucide-react";

const baseTypeConfig = {
  COMISARIA: {
    label: "Comisaría",
    icon: ShieldCheck,
    className:
      "border-blue-400/40 bg-blue-500/10 text-blue-300 shadow-blue-500/10",
  },
  DESTACAMENTO: {
    label: "Destacamento",
    icon: MapPinHouse,
    className:
      "border-cyan-400/40 bg-cyan-500/10 text-cyan-300 shadow-cyan-500/10",
  },
  BASE_OPERATIVA: {
    label: "Base operativa",
    icon: Building2,
    className:
      "border-violet-400/40 bg-violet-500/10 text-violet-300 shadow-violet-500/10",
  },
  PUESTO_POLICIAL: {
    label: "Puesto policial",
    icon: Shield,
    className:
      "border-emerald-400/40 bg-emerald-500/10 text-emerald-300 shadow-emerald-500/10",
  },
  OTRO: {
    label: "Otro",
    icon: Landmark,
    className:
      "border-slate-400/40 bg-slate-500/10 text-slate-300 shadow-slate-500/10",
  },
};

const BaseTypeBadge = ({ type }) => {
  const config = baseTypeConfig[type] || baseTypeConfig.OTRO;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex min-w-33 items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] shadow-sm ${config.className}`}
      title={config.label}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{config.label}</span>
    </span>
  );
};

export default BaseTypeBadge;
