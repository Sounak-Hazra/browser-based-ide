


FROM ruby:4.0.0-slim-bookworm

# Create non-root user + workspace
RUN useradd -m runner && mkdir -p /workspace && chown -R runner:runner /workspace


RUN mkdir -p /workspace \
    && chmod -R 777 /workspace


ENV USER_ID=none
ENV PROJECT_ID=none
ENV RUN_ID=none
ENV CMD=""

WORKDIR /workspace

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]