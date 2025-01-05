[Go to Log Analytics and run query](https://portal.azure.com#@d5564c63-fe88-47f5-bb3a-e857c6a12ad0/blade/Microsoft_OperationsManagementSuite_Workspace/Logs.ReactView/resourceId/%2Fsubscriptions%2Fa112f56e-a5f0-489a-845c-d3cb60827d85%2FresourceGroups%2FRG-Shared-Prod-Revenuegrid%2Fproviders%2Fmicrosoft.insights%2Fcomponents%2FRG-Shared-Prod-Revenuegrid/source/LogsBlade.AnalyticsShareLinkToQuery/q/H4sIAAAAAAAAAyvJzEnVSCktSizJzM%252FTUTA10FRIqlQoLU4tindMTs4vzSvxTAEAZ0vrBCQAAAA%253D/timespan/2024-10-01T10%3A20%3A24.000Z%2F2024-12-03T10%3A20%3A24.246Z/limit/M)

```
dependencies
| where name has "contacts/activityfeed/query"
| summarize percentile(duration, 50) by user_AccountId
```
