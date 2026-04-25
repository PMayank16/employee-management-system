import { useEffect, useState } from "react";
import { employeesApi } from "@/services/api";
import { Card, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { formatINR } from "@/utils/currency";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await employeesApi.me();
        setMe(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card>
      <CardHeader title="My Profile" subtitle="Your account information" />
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <p className="text-sm"><span className="font-semibold">Name:</span> {me?.name}</p>
          <p className="text-sm"><span className="font-semibold">Email:</span> {me?.email}</p>
          <p className="text-sm"><span className="font-semibold">Role:</span> {me?.role}</p>
          <p className="text-sm"><span className="font-semibold">Salary Type:</span> {me?.salaryType}</p>
          <p className="text-sm">
            <span className="font-semibold">Salary Amount:</span> {formatINR(me?.salaryAmount ?? 0)}
          </p>
        </div>
      )}
    </Card>
  );
}
