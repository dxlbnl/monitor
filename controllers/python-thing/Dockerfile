FROM alpine:latest

ENV PACKAGES " \
  postgresql-client postgresql-dev postgresql-libs \
  bash \
  supervisor \
  gcc musl-dev libffi-dev \
  git \
  python3 python3-dev \
"
RUN addgroup -g 1000 node \
  && adduser -u 1000 -G node -s /bin/sh -h /app -D node \
  && apk add --no-cache --update $PACKAGES && rm -rf /var/cache/apk/* \
  && python3 -m ensurepip \
  && rm -r /usr/lib/python*/ensurepip \
  && pip3 install --upgrade pip setuptools \
  && rm -r /root/.cache

# For nginx
RUN mkdir -p /run/nginx
EXPOSE 80
EXPOSE 3000

COPY requirements.txt ./
RUN pip3 install -r requirements.txt --no-cache-dir

ADD ./app /app
RUN chown -R node:node /app

ENV API_SECRET change_me

USER node

WORKDIR /app

COPY conf/supervisord.conf /etc/supervisord.conf

RUN chmod +x /app/main.py

CMD ["entry.sh"]
