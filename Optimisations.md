### Potential System Optimizations
List:
1. Caching
	1. add Http cache
		- **ServerSync settings
		- **Salesforce metadata
		- **/api/v1.0/bootstrap**
		- **ACL (Access Control List)
		- **ServerSync Users (/api/users)
			- **/api/plans**
	1. add Storage cache
		1. person names
1. Reducing the number of preflight requests
	1. add `Access-Control-Max-Age` [[Access-Control-Max-Age|https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age]]
2. Reduce bundle size (lazy loading)
	1. https://revenuegrid.atlassian.net/browse/REVGRD-13786
3. Simplifying the "Provide Access" flow for Widgets
4. Simplifying username calculations
	1. cache names in Storage
5. Simplifying name resolution based on emails
	1. . cache names in Storage

Details
#### 1. Duplication of requests between Widgets

1.1 **What’s the Problem?**

- Each widget represents a separate part of the RG UI, composed of multiple elements:
    - **Core part:** Common to all widgets.
    - **Widget-Specific Part:** Relevant only to the particular widget.
- Since each widget requires the Core Component, it loads it separately. This results in redundant data requests when multiple widgets are present simultaneously, leading to inefficiency.

1.2 **How to Improve the Situation?**

- For common part: **cache shared data using HTTP caching** to avoid repeated loading.
- For specific part: `TODO`

1.2.1 **What Should Be Cached using HTTP?**

- **ServerSync settings
- **Salesforce metadata
- **/api/v1.0/bootstrap**
- **ACL (Access Control List)
- **ServerSync Users (/api/users)
- **/api/plans**

1.2.1 What should be cached using storage?
* User names (resolved by ids) 
* Person names (resolved by emails)
#### 2. Reducing the number of preflight Requests

2.1 **What’s the problem?**

- Currently, nearly all requests with a `Content-Type: application/json` trigger **Preflight requests** before the actual request is sent. This increases the load on the server and adds latency due to the additional round trips.

2.2 **How to solve the Issue?**

-  We can reduce the number of preflight requests by caching the results using the [[Access-Control-Max-Age|https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age]] header.

#### 3. Simplifying the "Provide Access" Flow for Widgets

3.1 **Proposed Changes**

- If **ServerSync** is configured to update credentials during widget initialization in Salesforce, the separate feature for providing access to widgets can be disabled.

3.2 **Benefits of This Approach**

- **Eliminates the need for `checkCredentials` calls**, simplifying the authentication process.
- **Removes the requirement to call `/bootstrap` globally**, limiting its use to specific cases where it is genuinely needed.

#### 4. Simplifying username calculations

4.1 **What’s the Problem?**

- The RG UI currently retrieves user information from multiple sources to compute usernames.
- **Data sources include:**
    - **Signals** (for converting one ID to another)
    - **Drip**
    - **ServerSync**
    - **Salesforce**

4.2 **Proposed Solution**

- Use **a single source** for username data, potentially **ServerSync**, to streamline the process. This change, however, may cause issues with displaying names for Salesforce users not present in ServerSync.

#### 5. Simplifying Name Resolution Based on Emails

5.1 **What’s the Problem?**

- Analytics data often contains participant emails, which need to be converted to names. The RG UI currently queries multiple services to fetch data associated with these emails before obtaining the names.
- **Data sources include:**
    - **Salesforce leads**
    - **Salesforce contacts**
    - **Salesforce users**
    - **Drip contacts**
    - **Drip users**

5.2 **Possible Improvements**

- TODO