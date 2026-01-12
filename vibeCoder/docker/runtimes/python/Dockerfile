# FROM vibe/base:latest

# USER root
# RUN apt-get update && apt-get install -y \
#     python3 python3-pip \
#     && rm -rf /var/lib/apt/lists/*

# USER runner

# COPY --chown=runner:runner entrypoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh

# ENTRYPOINT ["/entrypoint.sh"]

FROM python:3.12-slim


COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]


# RUN mkdir -p /workspace \
#     && chmod -R 777 /workspace
USER root
RUN apt-get update \
 && apt-get install -y --no-install-recommends time \
 && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash runner
RUN mkdir -p /workspace && chown -R runner:runner /workspace
WORKDIR /workspace
USER runner

ENV USER_ID=none
ENV PROJECT_ID=none
ENV RUN_ID=none
ENV CMD=""

# WORKDIR /workspace


