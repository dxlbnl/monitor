FROM alpine

ENV PACKAGES "postgresql-client bash curl jq"
RUN apk add --no-cache --update $PACKAGES && rm -rf /var/cache/apk/*

RUN mkdir /etc/periodic/minute
COPY crontab /etc/crontab/root
RUN crontab /etc/crontab/root

COPY check_status.sh /etc/periodic/minute/check_status
RUN chmod a+x /etc/periodic/minute/check_status

COPY entry.sh /root/entry.sh
RUN chmod a+x /root/entry.sh

CMD ["/root/entry.sh"]