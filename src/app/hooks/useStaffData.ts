import { useCallback, useEffect, useState } from 'react';
import { api, type ApiStaffBooking, type ApiStaffDashboard, type ApiStaffProductJob, type ApiStaffTracker } from '../lib/api';

export type StaffData = {
  bookings: ApiStaffBooking[];
  trackers: ApiStaffTracker[];
  productJobs: ApiStaffProductJob[];
  dashboard: ApiStaffDashboard | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useStaffData(enabled: boolean): StaffData {
  const [bookings, setBookings] = useState<ApiStaffBooking[]>([]);
  const [trackers, setTrackers] = useState<ApiStaffTracker[]>([]);
  const [productJobs, setProductJobs] = useState<ApiStaffProductJob[]>([]);
  const [dashboard, setDashboard] = useState<ApiStaffDashboard | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    Promise.all([api.staffBookings(), api.staffTrackers(), api.staffProductJobs(), api.staffDashboard()])
      .then(([nextBookings, nextTrackers, nextJobs, nextDashboard]) => {
        setBookings(nextBookings);
        setTrackers(nextTrackers);
        setProductJobs(nextJobs);
        setDashboard(nextDashboard);
      })
      .catch(() => {
        setError('Không tải được dữ liệu từ server. Hãy chạy backend trên cổng 8000.');
      })
      .finally(() => setLoading(false));
  }, [enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { bookings, trackers, productJobs, dashboard, loading, error, reload };
}
