# Wuzzy API

Wuzzy is a decentralized web crawling and search system built on the AO (Actor Oriented) protocol. The system consists of two main components:

- **Wuzzy Nest**: The central index that stores and searches documents
- **Wuzzy Crawler**: Autonomous crawlers that fetch and process web content

## Overview

The Wuzzy system uses a distributed architecture where:
- A **Nest** acts as the central search index
- Multiple **Crawlers** can be spawned to crawl different domains
- Crawlers submit indexed content to the Nest
- Users can search the indexed content through the Nest

## Components

### Wuzzy Nest
The Nest is the central hub that:
- Maintains the document index
- Provides search functionality (simple and BM25)
- Manages crawler instances
- Handles crawl task distribution

### Wuzzy Crawler
Crawlers are autonomous processes that:
- Accept crawl tasks for specific domains
- Fetch and parse web content
- Extract links and follow them within allowed domains
- Submit processed documents to the Nest

## Authentication & Authorization

Both components use an Access Control List (ACL) system with roles:
- `owner`: Full administrative access
- `admin`: Administrative access
- Component-specific roles for granular permissions

---

## Wuzzy Nest Handlers

The Nest provides the following handlers for document indexing, search, and crawler management.

### Index-Document

Indexes a document in the search database.

**Action**: `Index-Document`

**Required Roles**: `owner`, `admin`, `Index-Document`

**Parameters**:
- `Document-URL` (string): The URL of the document to index, used as `Document-Id`
- `Document-Last-Crawled-At` (string): Timestamp when the document was crawled
- `Document-Content-Type` (string): MIME type of the document
- `data` (string): The content of the document
- `Document-Title` (string, optional): Title of the document
- `Document-Description` (string, optional): Description/summary of the document

**Response**:
```lua
{
  target = sender,
  action = 'Index-Document-Result',
  ['Document-Id'] = documentId, -- from Document-URL
  data = 'OK'
}
```

**Example**:
```lua
send({
  target = nestId,
  action = 'Index-Document',
  data = 'This is the content of my web page...',
  ['Document-URL'] = 'https://example.com/page', -- will be used as Document-Id
  ['Document-Last-Crawled-At'] = '1629123456',
  ['Document-Content-Type'] = 'text/html',
  ['Document-Title'] = 'Example Page',
  ['Document-Description'] = 'This is an example page'
})
```

### Remove-Document

Removes a document from the search index.

**Action**: `Remove-Document`

**Required Roles**: `owner`, `admin`, `Remove-Document`

**Parameters**:
- `Document-Id` (string): The ID of the document to remove, typically its URL

**Response**:
```lua
{
  target = sender,
  action = 'Remove-Document-Result',
  ['Document-Id'] = documentId, -- Document-URL
  data = 'OK'
}
```

### Search

Searches the document index for matching content.

**Action**: `Search`

**Required Roles**: None (public)

**Parameters**:
- `Query` or `query` (string): The search query
- `Search-Type` (string, optional): Search algorithm to use (`simple` or `bm25`, defaults to `simple`)

**Response**:
```lua
{
  target = sender,
  action = 'Search-Result',
  data = json.encode({
    SearchType = searchType,
    Hits = hits,
    TotalCount = totalCount
  })
}
```

**Example**:
```lua
send({
  target = nestId,
  action = 'Search',
  query = 'web crawling',
  ['Search-Type'] = 'bm25'
})
```

### Add-Crawl-Tasks

Adds URLs to the crawl task queue.

**Action**: `Add-Crawl-Tasks`

**Required Roles**: `owner`, `admin`, `Add-Crawl-Tasks`

**Parameters**:
- `data` (string): Newline-separated list of URLs to crawl (must use `arns://` or `ar://` protocols)

**Response**:
```lua
{
  target = sender,
  action = 'Add-Crawl-Tasks-Result',
  data = 'OK'
}
```

**Example**:
```lua
send({
  target = nestId,
  action = 'Add-Crawl-Tasks',
  data = 'arns://example.ar.io\nar://abc123def456'
})
```

### Remove-Crawl-Tasks

Removes URLs from the crawl task queue.

**Action**: `Remove-Crawl-Tasks`

**Required Roles**: `owner`, `admin`, `Remove-Crawl-Tasks`

**Parameters**:
- `data` (string): Newline-separated list of URLs to remove

**Response**:
```lua
{
  target = sender,
  action = 'Remove-Crawl-Tasks-Result',
  data = 'OK'
}
```

### Create-Crawler

Spawns a new crawler instance.

**Action**: `Create-Crawler`

**Required Roles**: `owner`, `admin`, `Create-Crawler`

**Parameters**:
- `Crawler-Name` (string, optional): Name for the crawler (defaults to "My Wuzzy Crawler")

**Response**:
```lua
{
  target = sender,
  action = 'Create-Crawler-Result',
  data = 'OK',
  ['X-Create-Crawler-Id'] = uniqueId
}
```

**Follow-up Response** (when crawler is spawned):
```lua
{
  target = sender,
  action = 'Crawler-Spawned',
  data = 'OK',
  ['Crawler-Id'] = crawlerId,
  ['X-Create-Crawler-Id'] = uniqueId
}
```

### Add-Crawler

Registers an existing crawler with the Nest.

**Action**: `Add-Crawler`

**Required Roles**: `owner`, `admin`, `Add-Crawler`

**Parameters**:
- `Crawler-Id` (string): The process ID of the crawler to add
- `Crawler-Name` (string, optional): Name for the crawler

**Response**:
```lua
{
  target = sender,
  action = 'Crawler-Added',
  data = 'OK',
  ['Crawler-Id'] = crawlerId
}
```

### Remove-Crawler

Removes a crawler from the Nest.

**Action**: `Remove-Crawler`

**Required Roles**: `owner`, `admin`, `Remove-Crawler`

**Parameters**:
- `Crawler-Id` (string): The process ID of the crawler to remove

**Response**:
```lua
{
  target = sender,
  action = 'Crawler-Removed',
  data = 'OK',
  ['Crawler-Id'] = crawlerId
}
```

---

## Wuzzy Crawler Handlers

The Crawler provides handlers for managing crawl tasks and processing web content.

### Request-Crawl

Requests immediate crawling of a specific URL.

**Action**: `Request-Crawl`

**Required Roles**: `owner`, `admin`, `Request-Crawl`

**Parameters**:
- `URL` (string): The URL to crawl immediately

**Response**:
```lua
{
  target = sender,
  action = 'Request-Crawl-Result',
  data = result
}
```

### Add-Crawl-Tasks

Adds URLs to the crawler's task list.

**Action**: `Add-Crawl-Tasks`

**Required Roles**: `owner`, `admin`, `Add-Crawl-Tasks`

**Parameters**:
- `data` (string): Newline-separated list of URLs to add to crawl tasks

**Response**:
```lua
{
  target = sender,
  action = 'Add-Crawl-Tasks-Result',
  data = 'OK'
}
```

**Example**:
```lua
send({
  target = crawlerId,
  action = 'Add-Crawl-Tasks',
  data = 'https://example.com\nhttps://another-site.com'
})
```

### Remove-Crawl-Tasks

Removes URLs from the crawler's task list.

**Action**: `Remove-Crawl-Tasks`

**Required Roles**: `owner`, `admin`, `Remove-Crawl-Tasks`

**Parameters**:
- `data` (string): Newline-separated list of URLs to remove

**Response**:
```lua
{
  target = sender,
  action = 'Remove-Crawl-Tasks-Result',
  data = 'OK'
}
```

### Set-Nest-Id

Configures which Nest the crawler should submit documents to.

**Action**: `Set-Nest-Id`

**Required Roles**: `owner`, `admin`, `Set-Nest-Id`

**Parameters**:
- `Nest-Id` (string): The process ID of the target Nest

**Response**:
```lua
{
  target = sender,
  action = 'Set-Nest-Id-Result',
  data = 'OK',
  ['Nest-Id'] = nestId
}
```

### Cron

Triggers the crawler's scheduled processing cycle.

**Action**: `Cron`

**Required Roles**: Must be called by the first authority in the authorities list

**Parameters**: None

**Behavior**:
- Processes crawl tasks if the queue is empty
- Crawls the next URL in the queue if available
- Updates the state cache

**Note**: This is typically called by a scheduler, not manually.

### Relay-Result

Internal handler for processing crawled content.

**Action**: `Relay-Result`

**Required Roles**: Must be called by the crawler process itself

**Parameters**:
- `relay-path` (string): The original URL that was crawled
- `content-type` (string): MIME type of the content
- `body` (string): The content body
- `block-timestamp` (string): Timestamp of when the content was fetched

**Behavior**:
- For HTML: Parses content, extracts links, and discovers new URLs to crawl
- For plain text: Indexes the content directly
- Submits processed documents to the configured Nest

**Note**: This is an internal handler used by the relay system.

---

## State Management

Both components include built-in state management handlers:

### Get-State

Retrieves the current state of the component.

**Action**: `Get-State`

**Required Roles**: `owner`, `admin`, `Get-State`

**Response**: Returns the complete state object

### Get-Info

Retrieves basic information about the component.

**Action**: `Get-Info`

**Required Roles**: None (public)

**Response**: Returns component info and statistics

---

## ACL (Access Control List) Handlers

Both components support ACL management:

### Update-Roles

Updates user roles and permissions.

**Action**: `Update-Roles`

**Required Roles**: `owner`, `admin`

**Parameters**:
- Role update object with `Grant` and/or `Revoke` operations

### Get-Roles

Retrieves current role assignments.

**Action**: `Get-Roles`

**Required Roles**: `owner`, `admin`, `Get-Roles`

---

## Supported Protocols

### Crawler Protocols
- `http://` and `https://` - Standard web protocols
- `arns://` - Arweave Name System URLs
- `ar://` - Direct Arweave transaction URLs

### Nest Protocols  
- `arns://` - Arweave Name System URLs
- `ar://` - Direct Arweave transaction URLs

**Note**: HTTP/HTTPS support may be limited in the Nest depending on configuration.

---

## Error Handling

All handlers include comprehensive error checking and will respond with assertion errors if:
- Required parameters are missing
- Invalid data formats are provided
- Permission checks fail
- Resource constraints are violated

Errors are returned as standard AO error responses with descriptive messages.
