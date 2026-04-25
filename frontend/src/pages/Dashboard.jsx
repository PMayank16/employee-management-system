import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/AdminDashboard";
export default function Dashboard() {
  const { isAdmin } = useAuth();
  return <AdminDashboard isAdmin={isAdmin} />;
}
