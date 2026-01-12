# FROM ubuntu:22.04
# ENV DEBIAN_FRONTEND=noninteractive

# # Update and install essential compilers, runtimes, and tools
# RUN apt-get update && apt-get install -y \
#     python3 python3-pip \
#     nodejs npm \
#     openjdk-17-jdk \
#     gcc g++ \
#     golang-go \
#     rustc cargo \
#     php \
#     ruby \
#     mono-complete \
#     bash build-essential curl git wget \
#     sqlite3 \
#     && rm -rf /var/lib/apt/lists/*

# # Create non-root user and workspace
# RUN useradd -m runner && mkdir -p /workspace && chown -R runner:runner /workspace

# USER runner
# WORKDIR /workspace


# # Environment defaults
# ENV USER_ID=none
# ENV PROJECT_ID=none
# ENV RUN_ID=none
# ENV CMD=""

# # Copy entrypoint script
# COPY --chown=runner:runner entrypoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh

# ENTRYPOINT ["/entrypoint.sh"]


# FROM ubuntu:22.04
# ENV DEBIAN_FRONTEND=noninteractive

# # Install runtimes, compilers & tools
# RUN apt-get update && apt-get install -y \
#     python3 python3-pip \
#     nodejs npm \
#     openjdk-17-jdk \
#     gcc g++ \
#     golang-go \
#     rustc cargo \
#     php \
#     ruby \
#     mono-complete \
#     bash build-essential curl git wget \
#     sqlite3 \
#     && rm -rf /var/lib/apt/lists/*

FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install required base tools only (no heavy build deps)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    bash \
    tini \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 (official NodeSource repo)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create writable sandbox workspace
RUN mkdir -p /workspace \
    && chmod -R 777 /workspace

WORKDIR /workspace

# Environment defaults
ENV USER_ID=none
ENV PROJECT_ID=none
ENV RUN_ID=none
ENV CMD=""

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# tini = proper PID1 + signal handling + no zombie processes
ENTRYPOINT ["/usr/bin/tini","--","/entrypoint.sh"]

