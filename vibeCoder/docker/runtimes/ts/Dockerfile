FROM node:25.2-bookworm-slim


COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN npm i -g typescript ts-node

ENTRYPOINT ["/entrypoint.sh"]

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
