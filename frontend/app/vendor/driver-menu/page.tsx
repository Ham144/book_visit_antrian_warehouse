"use client";
import { BookingApi } from "@/api/booking.api";
import { useUserInfo } from "@/components/UserContext";
import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";

const DriverMenu = () => {
  const { userInfo } = useUserInfo();

  const { data: bookings } = useQuery({
    queryKey: ["bookings"],
    queryFn: () =>
      BookingApi.getAllBookingsList({
        date: new Date().toISOString(),
        page: 1,
        vendorName: userInfo?.vendorName,
        searchKey: "",
      }),
    enabled: !!userInfo,
  });

  const matchOTWBooking = bookings?.find((booking: Booking) => {
    return (
      booking.status == BookingStatus.IN_PROGRESS &&
      booking.status == BookingStatus.IN_PROGRESS &&
      booking.driverUsername == userInfo?.username
    );
  });

  const { data: onTheWayBooking } = useQuery({
    queryKey: ["booking-detail", matchOTWBooking?.id],
    queryFn: async () => await BookingApi.getDetailById(matchOTWBooking?.id),
    enabled: !!matchOTWBooking,
  });

  const { mutateAsync: togglingArrivedStatus } = useMutation({
    mutationKey: ["bookings", "update"],
    mutationFn: async () =>
      await BookingApi.updateBookingStatus({
        id: onTheWayBooking?.id,
        status: BookingStatus.IN_PROGRESS,
        actualArrivalTime: onTheWayBooking.actualArrivalTime
          ? null
          : new Date().toISOString(),
        actualFinishTime: null,
      }),
  });

  return <div></div>;
};

export default DriverMenu;
