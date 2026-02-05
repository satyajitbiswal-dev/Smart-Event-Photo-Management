import { Button, CircularProgress } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useState } from "react";
import privateapi from "../../services/AxiosService";
import { toast } from "react-toastify";
import FolderZipIcon from '@mui/icons-material/FolderZip';

type Props = {
  event_id: string;
  eventName?: string;
};

export default function DownloadZIPPhotos({ event_id, eventName }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!event_id) return;

    try {
      setLoading(true);
      const response = await privateapi.post(`photos/events/${event_id}/download-zip/`,{},{
          responseType: "blob", 
        }
      );

      const blob = new Blob([response.data], {
        type: "application/zip",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `${eventName ?? "event"}_photos.zip`;

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Something went wrong!,Please Refresh the page")
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      startIcon={ loading ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon /> }
      disabled={loading}
      onClick={handleDownload}
    >
      {loading ? "Preparing ZIP..." : "Download All Photos"}
    </Button>
  );
}
