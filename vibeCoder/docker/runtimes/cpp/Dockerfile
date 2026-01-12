FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ make build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m runner && mkdir -p /workspace && chown -R runner:runner /workspace
RUN chmod -R 777 /workspace

WORKDIR /workspace

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER runner
ENTRYPOINT ["/entrypoint.sh"]
