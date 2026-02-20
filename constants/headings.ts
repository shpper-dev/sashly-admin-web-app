import { TableHeading } from "@/lib/types";

export const dashboardHeadings : TableHeading[]= [{
    id: "issue_id",
    title: "ISSUE ID"
},
{
    id: "order_id",
    title: "ORDER ID"
},
{
    id: "flag_reason",
    title: "FLAG REASON"
},
{
    id: "time_elapsed",
    title: "TIME ELAPSED"
},
{
    id: "action",
    title: ""
}
];

export const broadcastHeadings : TableHeading[]= [
{
    id: "date_time",
    title: "DATE & TIME"
},
{
    id: "msg_details",
    title: "MESSAGE DETAILS"
},
{
    id: "target",
    title: "TARGET"
},
{
    id: "reach",
    title: "REACH"
},
{
    id:"engagement",
    title:"ENGAGEMENT"
},
{
  id:"actions",
  title:""
}
];

export const disputeHeadings : TableHeading[]= [
{
    id: "order_id",
    title: "ORDER ID"
},
{
    id: "issue_category",
    title: "ISSUE CATEGORY"
},
{
    id: "wait_time",
    title: "WAIT TIME"
},
{
    id: "last_activity",
    title: "LAST ACTIVITY"
},
{
    id:"status_disputes",
    title:"STATUS"
},
];

export const driverHeadings : TableHeading[]= [
{
    id: "driver_id",
    title: "DRIVER ID"
},
{
    id: "name",
    title: "NAME"
},
{
    id: "contact",
    title: "CONTACT"
},
{
    id: "status",
    title: "STATUS"
},
{
    id:"active_orders",
    title:"ACTIVE ORDERS"
},
{
  id:"pending_payout",
  title:"PENDING PAYOUT"
},
{
  id:"actions",
  title:""
}
]