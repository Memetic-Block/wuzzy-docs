# Wuzzy Quickstart

Get started with Wuzzy, a decentralized web crawling and search system built on the AO (Actor Oriented) protocol. This guide will walk you through setting up your first search index and crawler.

## Prerequisites

- Access to [AOS (Actor Oriented System)](https://cookbook_ao.arweave.net/)
- Basic understanding of Lua and AO message passing
- An AO wallet with some tokens for spawning processes

## Step 1: Setting Up Your Environment

First, start an AOS session in your terminal:

```bash
aos myWuzzyNest --url https://some.hyperbeam.node
```

> **Important:** When prompted to choose a runtime environment, select **`hyper-aos`**. Wuzzy relies on the use of the `~relay@1.0` device to issue web requests.

This creates a new AO process that will serve as your Wuzzy Nest (search index).

## Step 2: Deploy the Wuzzy Nest

Load the Wuzzy Nest contract into your process:

```lua
-- Load the Wuzzy Nest module
.load-blueprint wuzzy-nest
```

Your Nest is now initialized and ready to:
- Index documents from crawlers
- Provide search functionality
- Manage crawler instances
- Handle crawl task distribution

## Step 3: Create Your First Crawler

You can create a crawler in two ways:

### Option A: Spawn a New Crawler (Recommended)

Let the Nest automatically spawn and configure a new crawler:

```lua
-- Create a new crawler
Send({
  Target = ao.id,  -- Send to your Nest process
  Action = "Create-Crawler",
  ["Crawler-Name"] = "My First Crawler"
})
```

Wait for the response to get your crawler ID:

```lua
-- Check for the spawned crawler response
Inbox[#Inbox]
-- Look for action = "Crawler-Spawned" and note the Crawler-Id
```

### Option B: Add an Existing Crawler

If you already have a crawler process, register it with your Nest:

```lua
Send({
  Target = ao.id,
  Action = "Add-Crawler",
  ["Crawler-Id"] = "your-crawler-process-id",
  ["Crawler-Name"] = "My Existing Crawler"
})
```

## Step 4: Configure Crawl Tasks

Add URLs for your crawler to process. Currently, Wuzzy supports Arweave-based URLs:

```lua
-- Add crawl tasks to your Nest
Send({
  Target = ao.id,
  Action = "Add-Crawl-Tasks",
  Data = "arns://example.ar.io\nar://abc123def456ghi789"
})
```

**Supported URL formats:**
- `arns://domain.ar.io` - Arweave Name System domains
- `ar://transaction-id` - Direct Arweave transaction URLs

## Step 5: Configure Your Crawler

If you spawned a new crawler, connect to it and add specific crawl tasks:

```lua
-- Start a new AOS session for your crawler
-- aos myCrawler --process-id your-crawler-id

-- Or send messages to configure it remotely
Send({
  Target = "your-crawler-id",
  Action = "Set-Nest-Id",
  ["Nest-Id"] = ao.id  -- Your Nest process ID
})

-- Add specific crawl tasks to the crawler
Send({
  Target = "your-crawler-id",
  Action = "Add-Crawl-Tasks",
  Data = "https://example.com\nhttps://another-site.com"
})
```

## Step 6: Start Crawling

Trigger the crawling process manually or set up automated crawling:

### Manual Crawling

```lua
-- Request immediate crawl of a specific URL
Send({
  Target = "your-crawler-id",
  Action = "Request-Crawl",
  URL = "https://example.com"
})
```

### Automated Crawling (Recommended)

Set up cron-based crawling for continuous operation:

```bash
# Start your crawler with cron scheduling
aos myCrawler --process-id your-crawler-id --cron 5-minutes
```

This will automatically trigger the crawler every 5 minutes to process its crawl queue.

## Step 7: Search Your Index

Once your crawler has indexed some content, you can search it:

```lua
-- Simple text search
Send({
  Target = ao.id,  -- Your Nest process
  Action = "Search",
  Query = "web crawling",
  ["Search-Type"] = "simple"
})

-- Advanced BM25 search (better relevance ranking)
Send({
  Target = ao.id,
  Action = "Search",
  Query = "decentralized search",
  ["Search-Type"] = "bm25"
})

-- Check the search results
Inbox[#Inbox].Data
-- This will contain JSON with your search results
```

### Search Response Format

Search results are returned as JSON:

```json
{
  "SearchType": "bm25",
  "Hits": [
    {
      "DocumentId": "https://example.com/page",
      "Title": "Example Page",
      "Description": "This is an example page",
      "URL": "https://example.com/page",
      "Score": 1.25,
      "Content": "Page content..."
    }
  ],
  "TotalCount": 1
}
```

## Step 8: Monitor Your System

### Check Nest Status

```lua
-- Get overall system state
Send({
  Target = ao.id,
  Action = "Get-State"
})

-- Get basic info and statistics
Send({
  Target = ao.id,
  Action = "Get-Info"
})
```

### Check Crawler Status

```lua
-- Get crawler state
Send({
  Target = "your-crawler-id",
  Action = "Get-State"
})
```

## Advanced Configuration

### Setting Up Multiple Crawlers

Scale your crawling by adding multiple crawlers for different domains:

```lua
-- Create specialized crawlers
Send({ Target = ao.id, Action = "Create-Crawler", ["Crawler-Name"] = "Documentation Crawler" })
Send({ Target = ao.id, Action = "Create-Crawler", ["Crawler-Name"] = "Blog Crawler" })
Send({ Target = ao.id, Action = "Create-Crawler", ["Crawler-Name"] = "News Crawler" })
```

### Access Control

Manage who can perform various operations:

```lua
-- Grant search permissions to specific users
Send({
  Target = ao.id,
  Action = "Update-Roles",
  Data = json.encode({
    Grant = {
      ["user-process-id"] = { "Search", "Get-Info" }
    }
  })
})

-- Grant crawler management permissions
Send({
  Target = ao.id,
  Action = "Update-Roles",
  Data = json.encode({
    Grant = {
      ["admin-process-id"] = { "Create-Crawler", "Add-Crawl-Tasks" }
    }
  })
})
```

### Document Management

```lua
-- Remove specific documents from the index
Send({
  Target = ao.id,
  Action = "Remove-Document",
  ["Document-Id"] = "https://example.com/page"
})

-- Remove crawl tasks
Send({
  Target = ao.id,
  Action = "Remove-Crawl-Tasks",
  Data = "arns://old-site.ar.io"
})
```

## Troubleshooting

### Common Issues

1. **Crawler not indexing content:**
   - Check that the crawler has the correct Nest ID configured
   - Verify the crawler has permission to submit documents to the Nest
   - Ensure URLs are in supported formats

2. **Search returns no results:**
   - Confirm documents have been indexed (check Nest state)
   - Try different search terms or search types
   - Verify the content was successfully crawled

3. **Permission errors:**
   - Check ACL roles and permissions
   - Ensure messages are being sent from authorized processes

### Debugging Commands

```lua
-- Check recent messages
Inbox[#Inbox]

-- View process state
ao.result()

-- Check crawler queue status
Send({ Target = "crawler-id", Action = "Get-State" })
```

## Next Steps

- Explore the [full API documentation](../api/) for advanced features
- Set up monitoring dashboards for your crawlers
- Implement custom search interfaces
- Scale your system with multiple specialized crawlers
- Integrate with external data sources through AO's ecosystem

## Example: Complete Setup Script

Here's a complete script to set up a basic Wuzzy instance:

```lua
-- 1. Load Wuzzy Nest
.load-blueprint wuzzy-nest

-- 2. Create a crawler
Send({ Target = ao.id, Action = "Create-Crawler", ["Crawler-Name"] = "Main Crawler" })

-- Wait for response, then note the Crawler-Id

-- 3. Add crawl tasks
Send({
  Target = ao.id,
  Action = "Add-Crawl-Tasks",
  Data = "arns://cookbook.ao.arweave.net\nar://your-content-txid"
})

-- 4. Configure the crawler (replace with actual crawler ID)
local crawlerId = "your-crawler-process-id"
Send({ Target = crawlerId, Action = "Set-Nest-Id", ["Nest-Id"] = ao.id })

-- 5. Start crawling
Send({ Target = crawlerId, Action = "Request-Crawl", URL = "arns://cookbook.ao.arweave.net" })

-- 6. Search after content is indexed
Send({ Target = ao.id, Action = "Search", Query = "ao cookbook", ["Search-Type"] = "bm25" })
```

This quickstart guide gets you up and running with a basic Wuzzy search system. For production deployments, consider implementing proper monitoring, error handling, and scalability planning.
