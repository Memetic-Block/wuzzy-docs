# Wuzzy Quickstart

Get started with Wuzzy, a decentralized web crawling and search system built on the AO (Actor Oriented) protocol. This guide will walk you through setting up your first search index and crawler.

## Prerequisites

- AOS Installed -> [AOS (Actor Oriented System)](https://cookbook_ao.arweave.net/)
- Node v22+
- An Arweave wallet
- [Wuzzy AO](https://github.com/memetic-block/wuzzy-ao) Repository

## Step 1: Setting Up Your Environment

First, clone the Wuzzy AO repository and install it:
```bash
git clone https://github.com/memetic-block/wuzzy-ao
cd wuzzy-ao
npm install
```

Next, we'll bundle the source code to prepare them for deployment:
```bash
npm run bundle
```
The `bundle` command creates a directory `dist` which contains the bundled lua code ready for deployment.

Then, start an AOS session in your terminal, filling in your hyperbeam node url of choice & giving the process a name:

```bash
aos myWuzzyNest --url https://some.hyperbeam.node
```

> **Important:** When prompted to choose a runtime environment, select **`hyper-aos`**. Wuzzy relies on the use of the `~relay@1.0` device to issue web requests.

This creates a new AO process that will serve as your **Wuzzy Nest** (search index).
Take note of the process ID as we'll need it later.

## Step 2: Deploy the Wuzzy Nest

Once aos has loaded and you see the prompt you can load the Wuzzy Nest lua code into your process:

```bash
.load dist/wuzzy-nest/process.lua
```

Your Nest is now initialized and ready to index documents from crawlers & provide search functionality!

## Step 3: Create Your First Crawler

In another terminal, open up another AOS process:

```bash
aos myWuzzyCrawler --url https://some.hyperbeam.node
```

Once aos has loaded and you see the prompt you can load the **Wuzzy Crawler** lua code into your process:

```bash
.load dist/wuzzy-crawler/process.lua
```

After the lua code has loaded, we'll need to set the crawler's `NestId` so that it knows where to submit documents it crawls.
```bash
send({ target = id, action = 'Set-Nest-Id', ['nest-id'] = '<wuzzy nest id from earlier>' })
```

Back in the **Wuzzy Nest** process, we'll have to grant permission for the new crawler to submit documents:
```bash
send({ target = id, action = 'Add-Crawler', ['crawler-id'] = '<wuzzy crawler id we just spawned>' })
```

You can repeat this step to spawn multiple crawlers.

## Step 4: Configure Crawl Tasks

Add URLs for your Crawler to process.  URLs can be http, https, arns, or ar protocol schemes:

```lua
send({ target = id, action = 'Add-Crawl-Tasks', data = 'https://cookbook_ao.arweave.net' })
```

Multiple tasks can be added by separating them with a newline.

**Supported URL formats:**
- `http://domain.com` - HTTP
- `https://secure-domain.com` - HTTPS
- `arns://domain.ar.io` - Arweave Name System domains
- `ar://transaction-id` - Direct Arweave transaction URLs

## Step 5: Start Crawling

As `Cron` is not currently available to `hyper-aos`, we can send these messages ourselves, or from an automated script.

For example, from inside the crawler process, you can trigger `Cron` manually:
```bash
send({ target = id, action = 'Cron' })
```

You'll see some output that your crawler has added its crawl tasks to the queue and has requested the first task from the relay device.

When receiving a `Cron` message, the Crawler will first check if there are any items in the Crawl Queue.
If there are no items in the Crawl Queue, the Crawler will populate the Crawl Queue with all items in its Crawl Tasks.
If there are items in the Crawl Queue, the Crawler will pop it from the queue and request the URL from the relay device.

When it receives a response from the relay device, the Crawler will parse the HTML for text content, meta description, title, and any links the page contains.
If a link is under a domain in a crawler's Crawl Tasks, it'll add it to the queue.

Currently the Crawler will index `text/html` and `text/plain` content types.
In a future update, the Crawler will be able to identify other content types and forward them to an appropriate Classifier for analysis (i.e. images, video, audio)
In another future update, the Crawler will be able to send scraped text content to LLM Classifiers, which can ssubsequently update the document in the Nest to include semantic descriptions, further empowering search capabilities.

## Step 6: Search Your Index

Once your Wuzzy Nest has some indexed content, you can search it by using Hyperbeam's HTTP API and the Wuzzy Nest view module.

View module id: `NWtLbRjMo6JHX1dH04PsnhbaDq8NmNT9L1HAPo_mtvc`

To issue a BM25 search for query "hyperbeam":
```bash
curl "https://some.hyperbeam.node/<YOUR WUZZY NEST ID>/now/~lua@5.3a&module=NWtLbRjMo6JHX1dH04PsnhbaDq8NmNT9L1HAPo_mtvc/search_bm25/serialize~json@1.0?query=hyperbeam
```

Search results are returned as a flat JSON structure:

```typescript
export interface WuzzyNestSearchResults {
  search_type: string
  total_hits: number
  has_more: 'true' | 'false'
  from: number
  page_size: number
  result_count: number

  [key: `${number}_docid`]: string
  [key: `${number}_title`]: string | undefined
  [key: `${number}_description`]: string | undefined
  [key: `${number}_content`]: string
  [key: `${number}_count`]: number
  [key: `${number}_score`]: number
}
```

By default only 10 results are returned, but you can request subsequent pages by adding the `from` query parameter:

```bash
curl "https://some.hyperbeam.node/<YOUR WUZZY NEST ID>/now/~lua@5.3a&module=NWtLbRjMo6JHX1dH04PsnhbaDq8NmNT9L1HAPo_mtvc/search_bm25/serialize~json@1.0?query=hyperbeam&from=10
```

Search queries are case-insensitive and will include the text context (typically ~100 chars before and after), as well as wrapping matches in html tags for highlighting in results.

## Step 7: Monitor Your Nest & Crawlers

### Check Nest Status

Using the Hyperbeam HTTP API, you can check the status of your nest using the same view module from the previous step & calling the `nest_info` function:

```bash
curl "https://some.hyperbeam.node/<YOUR WUZZY NEST ID>/now/~lua@5.3a&module=NWtLbRjMo6JHX1dH04PsnhbaDq8NmNT9L1HAPo_mtvc/nest_info/serialize~json@1.0
```

You'll get a flat JSON structure in response with information about the Nest's stats, its crawlers, and documents it contains:

```typescript
export interface WuzzyNestInfo {
  owner: string
  average_document_term_length: number
  total_content_length: number
  total_crawlers: number
  total_documents: number
  total_term_count: number

  [key: `crawler_${number}_creator`]: string
  [key: `crawler_${number}_id`]: string
  [key: `crawler_${number}_name`]: string
  [key: `crawler_${number}_owner`]: string

  [key: `document_${number}_id`]: string
  [key: `document_${number}_url`]: string
  [key: `document_${number}_title`]: string | undefined
  [key: `document_${number}_description`]: string | undefined
  [key: `document_${number}_content_length`]: number
  [key: `document_${number}_content_type`]: string
  [key: `document_${number}_term_count`]: number
  [key: `document_${number}_last_crawled_at`]: string
}
```

### Check Crawler Status

Similarly, you can use the Hyperbeam HTTP API with the crawler view module & calling the `crawler_info` function:

Crawler view module: `ZK1AXFffVJ2XNNIt5-s6NsI7r_nrsatoRdHyqSKs6xk`

```bash
curl "https://some.hyperbeam.node/<YOUR WUZZY CRAWLER ID>/now/~lua@5.3a&module=ZK1AXFffVJ2XNNIt5-s6NsI7r_nrsatoRdHyqSKs6xk/crawler_info/serialize~json@1.0
```

You'll get a flat JSON structure in response with information about the Crawler's info, its Crawl Tasks, the current Crawl Queue, and any Crawled URLs it is retaining in its Crawl Memory:

```typescript
export interface WuzzyCrawlerInfo {
  owner: string
  nest_id: string
  gateway: string
  total_crawl_tasks: number
  crawl_queue_size: number
  crawled_urls_memory_size: number

  [key: `crawl_queue_item_${number}_domain`]: string
  [key: `crawl_queue_item_${number}_url`]: string

  [key: `crawl_task_${number}_url`]: string
  [key: `crawl_task_${number}_added_by`]: string
  [key: `crawl_task_${number}_domain`]: string
  [key: `crawl_task_${number}_submitted_url`]: string

  [key: `crawled_url_${number}`]: string
}
```

## Advanced Configuration

### Access Control

Both the Wuzzy Nest and Wuzzy Crawler contain ACL functionality.  By default, the owner has access to all actions.  You can authorize another user or process to perform an action by sending an `Update-Roles` message to the Nest or Crawler:

```lua
-- Grant "Add-Crawl-Tasks" permission to a user or process id
send({
  target = id
  action = "Update-Roles",
  data = json.encode({
    Grant = {
      ["user address or process id"] = { "Add-Crawl-Tasks" }
    }
  })
})

-- Revoke "Add-Crawl-Tasks" permission from a user or process id
send({
  target = id,
  action = "Update-Roles",
  data = json.encode({
    Revoke = {
      ["user address or process id"] = { "Add-Crawl-Tasks" }
    }
  })
})
```

You can also add a user or process as an `admin` which allows them to perform all actions:

```lua
send({
  target = id,
  action = "Update-Roles",
  data = json.encode({
    Grant = {
      ['user address or process id'] = { 'admin' }
    }
  })
})
```

### Document Management

```lua
-- Remove specific documents from the index
send({
  target = id,
  action = "Remove-Document",
  ["document-id"] = "https://example.com/page"
})

-- Remove crawl tasks
send({
  target = id,
  action = "Remove-Crawl-Tasks",
  data = "arns://old-site.ar.io"
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

## Next Steps

- Explore the [full API documentation](../api/) for advanced features
- Set up monitoring dashboards for your crawlers
- Implement custom search interfaces
- Scale your system with multiple specialized crawlers
- Integrate with external data sources through AO's ecosystem
