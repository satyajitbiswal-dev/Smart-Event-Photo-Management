// import { Grid, Card, CardContent, Typography } from "@mui/material";
// import UploadPhoto from "../../components/RBAC/Photographer/UploadPhoto"; 
// import { useParams } from "react-router-dom";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../app/store";
// ye wo component hai jo hum pehle bana chuke hain

// type UserOption = {
//   id: string;
//   name: string;
// };

// type Props = {
//   eventName: string;
//   uploadedFiles: File[];
//   allUsers: UserOption[];
// };

// export default function PhotoDashboardDesktop() {
//   const { event_id }  = useParams()
//   const allEvents = useSelector((state : RootState) => state.event.events) || []
  
//   const newevent = allEvents.find((e)=>e.id === event_id)
//   if(!newevent) return <h4>Event Not Found</h4>


//   return (
//     <Grid container spacing={2}>
      
//       {/*  LEFT CARD  */}
//       <Grid sx={{md:4}}>
//       <UploadPhoto event_name ={`${newevent.event_name} - ${newevent.event_date}`}/>
//       </Grid>

//       {/* ========== RIGHT CARD (8 cols) ========== */}
//       <Grid  sx={{md:8}}>
//         <Card elevation={3} sx={{ height: "100%" }}>
//           <CardContent>
//             <Typography variant="h6" gutterBottom>
//               Dashboard & Analytics
//             </Typography>

//             <Typography variant="body2" color="text.secondary">
//                 • Total Photos  
//               • Views  
//               • Downloads  
//               • Charts  
//               • Recent Activity  
//             </Typography>

//             {/* 👇 yaha baad me tu charts / stats daalega */}
//           </CardContent>
//         </Card>
//       </Grid>

//     </Grid>
//   );
// }
