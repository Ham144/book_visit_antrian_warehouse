'use client'

import { Booking } from "@/types/booking.type";
import { useEffect, useState } from "react";

export const useProgressBarUnloading = (booking: Booking, updateInterval: number = 10000) => {
    const [progress, setProgress] = useState(0);
    const [remainingTime, setRemainingTime] = useState<string>('');
    
    useEffect(() => {
      if (!booking.actualStartTime || booking.status !== 'UNLOADING') {
        setProgress(0);
        setRemainingTime('');
        return;
      }
      
      const calculate = () => {
        const now = new Date();
        const start = new Date(booking.actualStartTime);
        const durasiBongkar = booking.Vehicle?.durasiBongkar || 0;
        const estimatedFinish = new Date(start.getTime() + durasiBongkar * 60000);
  
        if (isNaN(start.getTime()) || isNaN(estimatedFinish.getTime())) {
          setProgress(0);
          setRemainingTime('');
          return;
        }
  
        const totalDuration = estimatedFinish.getTime() - start.getTime();
        const elapsedTime = now.getTime() - start.getTime();
  
        // Calculate progress
        if (totalDuration <= 0) {
          setProgress(100);
          setRemainingTime('Selesai');
          return;
        }
        
        if (elapsedTime <= 0) {
          setProgress(0);
          setRemainingTime(`${durasiBongkar} menit`);
          return;
        }
        if (elapsedTime >= totalDuration) {
          setProgress(100);
          setRemainingTime('Selesai');
          return;
        }
  
        const calculatedProgress = (elapsedTime / totalDuration) * 100;
        setProgress(Math.min(100, Math.max(0, calculatedProgress)));
        
        // Calculate remaining time
        const remainingMs = estimatedFinish.getTime() - now.getTime();
        const remainingMinutes = Math.max(0, Math.ceil(remainingMs / 60000));
        setRemainingTime(`${remainingMinutes} menit lagi`);
      };
      
      calculate();
      const interval = setInterval(calculate, updateInterval);
      
      return () => clearInterval(interval);
    }, [booking.actualStartTime, booking.Vehicle?.durasiBongkar, booking.status, updateInterval]);
    
    return { progress, remainingTime };
  };