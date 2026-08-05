import { TableHeading } from "@/lib/types";

export const dashboardHeadings : TableHeading[]= [{
    id: "dispute_id",
    title: "DISPUTE ID"
},
{
    id: "order_id",
    title: "ORDER ID"
},
{
    id: "issue_category",
    title: "ISSUE CATEGORY"
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
{ id: "date_time", title: "DATE & TIME" },
{ id: "msg_details", title: "MESSAGE DETAILS"},
{ id: "target",      title: "TARGET" },
{ id: "reach",       title: "REACH" },
{ id:"engagement",   title:"ENGAGEMENT" },
{ id:"created_by",   title:"CREATED BY" }
];

export const driverHeadings: TableHeading[] = [
  { id: "name",    title: "NAME"          },
  { id: "contact", title: "CONTACT"       },
  { id: "route",   title: "AREA"          },
  { id: "active",  title: "ACTIVE"        },
  { id: "online",  title: "ONLINE"        },
  { id: "offer" ,  title: "OFFER RESPONSE"},
  { id: "max_orders", title: "MAX ORDERS"  },
];

export const bannerHeadings: TableHeading[] = [
  { id: "order",   title: "ORDER"   },
  { id: "image",   title: "IMAGE"   },
  { id: "title",   title: "TITLE"   },
  { id: "action",  title: "ACTION"  },
  { id: "dates",   title: "DATES"   },
  { id: "active",  title: "ACTIVE"  },
  { id: "actions", title: "ACTIONS" },
];

export const businessHeadings: TableHeading[] = [
  { id: "name",      title: "BUSINESS"  },
  { id: "join_code", title: "JOIN CODE" },
  { id: "contact",   title: "CONTACT"   },
  { id: "members",   title: "MEMBERS"   },
  { id: "status",    title: "STATUS"    },
  { id: "actions",   title: "ACTIONS"   },
];

export const couponHeadings: TableHeading[] = [
  { id: "code",     title: "COUPON CODE"    },
  { id: "discount", title: "DISCOUNT"       },
  { id: "usage",    title: "USAGE"          },
  { id: "dates",    title: "EXPIRY DATE"    },
  { id: "status",   title: "STATUS"         },
  { id: "in_app",   title: "IN APP"         },
  { id: "actions",  title: ""               },
];

export const QUEUE_HEADINGS: TableHeading[] = [
  { id: "orderId",    title: "Order ID"    },
  { id: "issueType",  title: "Category"   },
  { id: "createdAt",  title: "Wait Time"  },
  { id: "priority",   title: "Priority"   },
  { id: "status",     title: "Status"     },
  { id: "assignedTo", title: "Assigned To"},
  { id: "actions",    title: "Actions"    },
];

export const RESOLVED_HEADINGS: TableHeading[] = [
  { id: "orderId",               title: "Order ID"    },
  { id: "issueType",             title: "Category"    },
  { id: "resolution_action",     title: "Resolution"  },
  { id: "resolution_resolvedBy", title: "Resolved By" },
  { id: "resolution_resolvedAt", title: "Resolved At" },
  { id: "status",                title: "Status"      },
  { id: "actions",               title: "Actions"    },
];

export const payoutHeadings: TableHeading[] = [
  { id: "user_name",        title: "User Name"         },
  { id: "contact_details",  title: "Contact Details"   },
  { id: "requested_amount", title: "Requested Amount"  },
  { id: "actions",          title: "Actions"           },
]

export const transactionHeadings: TableHeading[] = [
  { id: "transaction_id",   title: "Transaction ID"    },
  { id: "name",             title: "Name"              },
  { id: "type",             title: "Type"              },
  { id: "date",             title: "Date"              },
  { id: "requested_amount", title: "Amount"            },
  { id: "status",           title: "Status"            },
]

export const categoryHeadings : TableHeading[]= [
   {  id: "name", title: "NAME" },
   {  id: "photo", title: "PHOTO" },
   {  id: "searchTerms", title: "SEARCH TERMS" },
   {  id: "createdat", title: "CREATED AT" },
   {  id:"actions",title:"ACTIONS" }
]

export const serviceHeadings: TableHeading[] = [
  { id: "name", title: "NAME" },
  { id: "description", title: "DESCRIPTION" },
  { id: "price", title: "PRICE" },
  { id: "searchTerms", title: "SEARCH TERMS" },
  { id: "actions", title: "ACTIONS" },
];

export const userHeadings: TableHeading[] = [
  { id: "name",         title: "NAME"          },
  { id: "email",        title: "EMAIL"         },
  { id: "language",     title: "LANGUAGE"      },
  { id: "registeredAt", title: "REGISTERED AT" },
  { id: "status",       title: "STATUS"        },
];
