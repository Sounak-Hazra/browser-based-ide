FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

# Update and install essential compilers, runtimes, and tools
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    nodejs npm \
    openjdk-17-jdk \
    gcc g++ \
    golang-go \
    rustc cargo \
    php \
    ruby \
    mono-complete \
    bash build-essential curl git wget \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user and workspace
RUN useradd -m runner && mkdir -p /workspace && chown -R runner:runner /workspace

USER runner
WORKDIR /workspace


# Environment defaults
ENV USER_ID=none
ENV PROJECT_ID=none
ENV RUN_ID=none
ENV CMD=""

# Copy entrypoint script
COPY --chown=runner:runner entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
