# The deployed version is written into this file rather than passed in: the
# cluster's Nomad does not support HCL2 variables, and the self-hosted runner
# that used to substitute it was decommissioned. `operations/stamp-sha.sh`
# rewrites it across both specs at once.
#
# Note the tag has no `sha-` prefix: this repository's CI publishes a bare
# commit sha, unlike the wuzzy monorepo's.

job "wuzzy-docs-static-live" {
  datacenters = ["mb-hel"]
  type = "batch"

  constraint {
    attribute = "${meta.env}"
    value     = "edge-worker"
  }

  reschedule {
    attempts = 0
  }

  group "wuzzy-docs-static-live-group" {
    count = 1

    task "wuzzy-docs-static-live-task" {
      driver = "docker"

      config {
        image = "ghcr.io/memetic-block/wuzzy-docs:fcc6cf5c5d9535987239e8b134a7c0fde4f42840"
        entrypoint = [ "/workdir/entrypoint.sh" ]
        mount {
          type = "bind"
          source = "local/entrypoint.sh"
          target = "/workdir/entrypoint.sh"
          readonly = true
        }
      }

      env {
        PHASE="live"
        HOSTNAME="docs.wuzzy.io"
        PROJECT_NAME="wuzzy-docs-live"
      }

      vault {
        policies = [
          "memeticblock-io-cloudflare-deployer"
        ]
      }

      template {
        data = <<-EOF
        {{- with secret "kv/memeticblock/cloudflare-deployer" }}
        CLOUDFLARE_ACCOUNT_ID={{ .Data.data.CLOUDFLARE_ACCOUNT_ID }}
        CLOUDFLARE_API_TOKEN={{ .Data.data.CLOUDFLARE_API_TOKEN }}
        {{- end }}
        EOF
        destination = "secrets/cloudflare.env"
        env = true
      }

      template {
        data = <<-EOF
        #!/bin/sh
        set -e

        echo "Generating static files"
        npm run build

        echo "Generating SEO files (sitemap.xml and robots.txt)"
        npm run generate:seo

        # Cloudflare Pages only. Arweave publishing was removed along with its
        # SDKs and deployer wallet; it can come back as its own step.
        echo "Deploying static site to Cloudflare Pages"
        npm run deploy:static

        echo "Static site deployment complete"
        EOF
        destination = "local/entrypoint.sh"
        perms = "0755"
      }

      restart {
        attempts = 0
        mode     = "fail"
      }

      resources {
        cpu    = 1024
        memory = 1024
      }
    }
  }
}
