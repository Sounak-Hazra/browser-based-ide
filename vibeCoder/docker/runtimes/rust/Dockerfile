


FROM rust:1.92-slim-bookworm

# Create non-root user + workspace
RUN useradd -m runner && mkdir -p /workspace && chown -R runner:runner /workspace


RUN mkdir -p /workspace \
    && chmod -R 777 /workspace

WORKDIR /workspace


ENV USER_ID=none
ENV PROJECT_ID=none
ENV RUN_ID=none
ENV CMD=""

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]