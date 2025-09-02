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
- `document-url` (string): The URL of the document to index, used as `document-id`
- `document-last-crawled-at` (string): The `date` header from the relay device response
- `document-content-type` (string): MIME type of the document
- `data` (string): The content of the document
- `document-title` (string, optional): Title of the document
- `document-description` (string, optional): Description/summary of the document

**Response**:
```lua
{
  target = sender,
  action = 'Index-Document-Result',
  ['document-id'] = documentId, -- from document-url
  data = 'OK'
}
```

**Example**:
```lua
send({
  target = nestId,
  action = 'Index-Document',
  data = 'This is the content of my web page...',
  ['document-url'] = 'https://example.com/page', -- will be used as Document-Id
  ['document-last-crawled-at'] = '1629123456',
  ['document-content-type'] = 'text/html',
  ['document-title'] = 'Example Page',
  ['document-description'] = 'This is an example page'
})
```

### Remove-Document

Removes a document from the search index.

**Action**: `Remove-Document`

**Required Roles**: `owner`, `admin`, `Remove-Document`

**Parameters**:
- `document-id` (string): The ID of the document to remove, typically its URL

**Response**:
```lua
{
  target = sender,
  action = 'Remove-Document-Result',
  ['document-id'] = documentId, -- document-url
  data = 'OK'
}
```

### Search

Searches the document index for matching content.

**Action**: `Search`

**Required Roles**: None (public)

**Parameters**:
- `query` (string): The search query
- `search-type` (string, optional): Search algorithm to use (`simple` or `bm25`, defaults to `simple`)

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
  ['search-type'] = 'bm25'
})
```

### Add-Crawler

Registers an existing crawler with the Nest.

**Action**: `Add-Crawler`

**Required Roles**: `owner`, `admin`, `Add-Crawler`

**Parameters**:
- `crawler-id` (string): The process ID of the crawler to add
- `crawler-name` (string, optional): Name for the crawler, defaults to "My Wuzzy Crawler"

**Response**:
```lua
{
  target = sender,
  action = 'Crawler-Added',
  data = 'OK',
  ['crawler-id'] = crawlerId
}
```

### Remove-Crawler

Removes a crawler from the Nest.

**Action**: `Remove-Crawler`

**Required Roles**: `owner`, `admin`, `Remove-Crawler`

**Parameters**:
- `crawler-id` (string): The process ID of the crawler to remove

**Response**:
```lua
{
  target = sender,
  action = 'Crawler-Removed',
  data = 'OK',
  ['crawler-id'] = crawlerId
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
- `url` (string): The URL to crawl immediately

**Response**:
```lua
{
  target = sender,
  action = 'Request-Crawl-Result',
  data = result
}
```

### Add-Crawl-Tasks

Adds URLs to the crawl task queue.

**Action**: `Add-Crawl-Tasks`

**Required Roles**: `owner`, `admin`, `Add-Crawl-Tasks`

**Parameters**:
- `data` (string): Newline-separated list of URLs to crawl

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

### Set-Nest-Id

Configures which Nest the crawler should submit documents to.

**Action**: `Set-Nest-Id`

**Required Roles**: `owner`, `admin`, `Set-Nest-Id`

**Parameters**:
- `nest-id` (string): The process ID of the target Nest

**Response**:
```lua
{
  target = sender,
  action = 'Set-Nest-Id-Result',
  data = 'OK',
  ['nest-id'] = nestId
}
```

### Cron

Triggers the crawler's scheduled processing cycle.

**Action**: `Cron`

**Required Roles**: `owner`, `admin`, `Cron`

**Parameters**: None

**Behavior**:
- Processes crawl tasks if the queue is empty
- Crawls the next URL in the queue if available
- Updates the state cache

**Note**: This is typically called by a scheduler, not manually.

## State Management

Both components include built-in state management handlers:

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

Errors are returned as standard AO error responses with descriptive messages.
