FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ make build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

USER root
RUN apt-get update \
 && apt-get install -y --no-install-recommends time \
 && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash runner
RUN mkdir -p /workspace && chown -R runner:runner /workspace
WORKDIR /workspace
USER runner
