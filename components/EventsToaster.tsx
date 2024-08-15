"use client";
import React, { useEffect } from "react";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";

type Props = {};

const EventsToaster = (props: Props) => {
  useEffect(() => {
    const evtSource = new EventSource("/api/sse-downloads", {
      withCredentials: true,
    });

    evtSource.onmessage = (e) => {
      toast.info(e.data);
    };
    return () => {
      evtSource.close();
    };
  }, []);
  return <Toaster />;
};

export default EventsToaster;
