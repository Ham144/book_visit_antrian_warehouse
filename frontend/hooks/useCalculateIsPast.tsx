import { WarehouseApi } from "@/api/warehouse.api";
import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useCalculateIsPast = ({ booking }: { booking: Booking }) => {
  const [isPast, setIsPast] = useState<boolean>(false);
  const arrival = new Date(booking?.arrivalTime);

  const { data: warehouseDetail, isLoading } = useQuery({
    queryKey: ["warehouse-detail"],
    queryFn: async () =>
      await WarehouseApi.getWarehouseDetail(booking.warehouseId),
    enabled: !!booking?.warehouseId,
  });

  useEffect(() => {
    const now = new Date();
    const result =
      !isLoading &&
      arrival.getTime() + (warehouseDetail?.delayTolerance || 0) * 60_000 <
        now.getTime() &&
      (booking.status == BookingStatus.IN_PROGRESS ||
        booking.status == BookingStatus.PENDING) &&
      !booking?.actualArrivalTime;
    setIsPast(result);
  }, [booking]);

  return { isPast };
};
