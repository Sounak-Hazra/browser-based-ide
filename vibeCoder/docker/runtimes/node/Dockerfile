FROM node:25.2-bookworm-slim


COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

RUN useradd -m -s /bin/bash runner
RUN mkdir -p /workspace && chown -R runner:runner /workspace
WORKDIR /workspace 
USER runner


ENV USER_ID=none
ENV PROJECT_ID=none
ENV RUN_ID=none
ENV CMD=""
