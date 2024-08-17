export const downloadsSseEvents = new EventSource("/api/sse-downloads", {
  withCredentials: true,
});

evtSource.onmessage = (e) => {
  toast.info(e.data);
};
return () => {
  evtSource.close();
};
