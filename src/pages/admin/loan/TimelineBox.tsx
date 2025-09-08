import React from "react";
import { Box, Typography } from "@mui/material";
import CommonService from "../../../service/CommonService";

interface TimelineEvent {
  date: string;
  from: string;
  to: string;
  status:string;
  desc:string;
}

const timelineEvents: TimelineEvent[] = [
  {
    date: new Date("2024-06-07").toISOString().split("T")[0],
    from: "Porter",
    to: "Anil Kumar",
    status:'Document Recieved',
    desc:'From Dealer'
  },
  {
    date: new Date("2024-08-27").toISOString().split("T")[0],
    from: "Anil Meher",
    to: "Divesh Mishra",
    status:'Handover',
    desc:'To TSC'
  },
   {
    date: new Date("2024-08-30").toISOString().split("T")[0],
    from: "Raj Kumar",
    to: "Jitendera Kumar",
    status:'Return Handover',
    desc:'To Return Handover'
  },
    {
    date: new Date("2024-09-01").toISOString().split("T")[0],
    from: "Lalit Karan",
    to: "Akash Kumar",
    status:'Handover',
    desc:'To Dealer'
  },
];

const TimelineBox: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
        Activities
      </Typography>

      <Box
        sx={{
          position: "relative",
          pl: 1,
          borderLeft: "1px solid #444",

        }}
      >
        {timelineEvents.map((event, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              mb: 2.5,
              pb: 1,
              pl:1,
              "&:last-child": {
                mb: 0,
              },
            }}
          >
            <Box
              sx={{
                content: '""',
                position: "absolute",
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: `2px solid ${
                 ["Document Recieved"].includes(event.status) ? "green" : "#444"
                }`,
                bgcolor: ["Document Recieved"].includes(event.status) ? "green" : "#fff",
                left: -16,
                top: index === 0? 0 : 3,
              }}
            />
            <Typography
              variant="body2"
              color="black.800"
            >
              {event.status}&nbsp;({event.desc})
            </Typography>
            <Typography
              variant="body2"
            >
             From:&nbsp;{event.from},&nbsp;To:&nbsp;{event.to}
            </Typography>
             <Typography
              variant="body2"

            >
            Date:&nbsp;{CommonService.formatDate(event.date)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TimelineBox;
