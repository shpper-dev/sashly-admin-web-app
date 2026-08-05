import { AlertTriangle, HelpCircle, PackageX, RefreshCcw, Shirt, UserX,
} from "lucide-react";

export const ISSUE_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  missing_item: {
    label: "Missing Item",
    icon: <PackageX className="h-3.5 w-3.5" />,
    className: "bg-orange-50 text-orange-600",
  },
  damaged: {
    label: "Damaged",
    icon: <Shirt className="h-3.5 w-3.5" />,
    className: "bg-red-50 text-red-600",
  },
  wrong_service: {
    label: "Wrong Service",
    icon: <RefreshCcw className="h-3.5 w-3.5" />,
    className: "bg-blue-50 text-blue-600",
  },
  driver_behavious: {
    label: "Driver Behavior",
    icon: <UserX className="h-3.5 w-3.5" />,
    className: "bg-yellow-50 text-yellow-700",
  },
  delivery_problem: {
    label: "Delivery Problem",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    className: "bg-amber-50 text-amber-600",
  },
  other: {
    label: "Other",
    icon: <HelpCircle className="h-3.5 w-3.5" />,
    className: "bg-slate-100 text-slate-500",
  },
};